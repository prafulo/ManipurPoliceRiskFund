
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

        const results = [];
        const datePart = format(new Date(), 'MMyy');

        for (const data of members) {
            const unitId = unitsMap.get(String(data.unitName || '').toLowerCase());
            if (!unitId) continue;

            // Generate basic membership code
            const lastMember = await prisma.member.findFirst({
                where: { unitId },
                orderBy: { createdAt: 'desc' },
                select: { membershipCode: true }
            });
            
            let nextSerial = 30001;
            if (lastMember?.membershipCode) {
                const parts = lastMember.membershipCode.split('-');
                if (parts.length === 3) {
                    const lastSerial = parseInt(parts[1], 10);
                    if (!isNaN(lastSerial)) nextSerial = lastSerial + 1;
                }
            }
            
            const code = `${data.unitName}-${nextSerial}-${datePart}`;

            // Check if service number already exists
            const existing = await prisma.member.findUnique({
                where: { serviceNumber: String(data.serviceNumber) }
            });

            if (existing) continue;

            // Calculate superannuation if not provided (DOB + 60 years)
            const dob = new Date(data.dateOfBirth);
            const superannuationDate = data.superannuationDate 
                ? new Date(data.superannuationDate) 
                : new Date(new Date(dob).setFullYear(dob.getFullYear() + 60));

            results.push(prisma.member.create({
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
                    nominees: [{ name: 'N/A', relation: 'N/A', age: 0, share: 100 }],
                    firstWitness: { name: 'N/A', address: 'N/A' },
                    secondWitness: { name: 'N/A', address: 'N/A' },
                }
            }));
        }

        if (results.length === 0) {
            return NextResponse.json({ message: 'No new members were imported (possible duplicates or invalid units).' }, { status: 400 });
        }

        await prisma.$transaction(results);

        return NextResponse.json({ count: results.length, message: 'Import successful' });

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
