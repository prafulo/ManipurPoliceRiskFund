import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type { MemberPostType, MemberStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const { members } = await request.json();

        if (!Array.isArray(members) || members.length === 0) {
            return NextResponse.json({ message: 'No members provided for import.' }, { status: 400 });
        }

        const allUnits = await prisma.unit.findMany();
        const unitsMap = new Map(allUnits.map(u => [u.name.toLowerCase(), u.id]));

        const datePart = format(new Date(), 'MMyy');

        // Execute import in a transaction to maintain global serial integrity
        const count = await prisma.$transaction(async (tx) => {
            // Get current global starting serial
            const setting = await tx.setting.findUnique({
                where: { key: 'membershipCodeStartSerial' }
            });
            let currentGlobalSerial = setting ? parseInt(setting.value) : 30001;
            let importedCount = 0;

            for (const data of members) {
                const unitId = unitsMap.get(String(data.unitName || '').toLowerCase());
                if (!unitId) continue;

                // Check if service number already exists
                const existing = await tx.member.findUnique({
                    where: { serviceNumber: String(data.serviceNumber) }
                });
                if (existing) continue;

                // Generate code using current global serial
                const code = `${data.unitName}-${currentGlobalSerial}-${datePart}`;

                const dob = new Date(data.dateOfBirth);
                const superannuationDate = (data.superannuationDate && data.superannuationDate !== '') 
                    ? new Date(data.superannuationDate) 
                    : new Date(new Date(dob).setFullYear(dob.getFullYear() + 60));

                await tx.member.create({
                    data: {
                        id: uuidv4(),
                        membershipCode: code,
                        name: data.name,
                        fatherName: data.fatherName,
                        rank: data.rank,
                        trade: data.trade,
                        serviceNumber: String(data.serviceNumber),
                        badgeNumber: String(data.badgeNumber || ''),
                        bloodGroup: data.bloodGroup,
                        memberPostType: (data.memberPostType || 'Substantive') as MemberPostType,
                        joiningRank: data.joiningRank,
                        dateOfBirth: dob,
                        dateOfEnrollment: new Date(data.dateOfEnrollment),
                        superannuationDate: superannuationDate,
                        address: data.address,
                        phone: String(data.phone || ''),
                        unitId: unitId,
                        status: (data.status || 'Opened') as MemberStatus,
                        subscriptionStartDate: new Date(data.subscriptionStartDate),
                        dateApplied: new Date(data.dateApplied || data.dateOfEnrollment),
                        receiptDate: new Date(data.receiptDate || data.dateOfEnrollment),
                        allotmentDate: new Date(data.allotmentDate || data.dateOfEnrollment),
                        nominees: JSON.stringify([{ name: 'N/A', relation: 'N/A', age: 0, share: 100 }]),
                        firstWitness: JSON.stringify({ name: 'N/A', address: 'N/A' }),
                        secondWitness: JSON.stringify({ name: 'N/A', address: 'N/A' }),
                    }
                });

                currentGlobalSerial++;
                importedCount++;
            }

            // Update the global serial in settings for future members
            await tx.setting.upsert({
                where: { key: 'membershipCodeStartSerial' },
                update: { value: String(currentGlobalSerial) },
                create: { key: 'membershipCodeStartSerial', value: String(currentGlobalSerial) }
            });

            return importedCount;
        });

        if (count === 0) {
            return NextResponse.json({ message: 'No new members were imported (possible duplicates or invalid units).' }, { status: 400 });
        }

        return NextResponse.json({ count, message: 'Import successful' });

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
