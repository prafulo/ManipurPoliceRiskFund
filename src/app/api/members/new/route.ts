import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import type { ClosureReason, MemberPostType, MemberStatus } from '@prisma/client';


export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const memberId = uuidv4();

        const newMember = {
            id: memberId,
            membershipCode: data.membershipCode,
            name: data.name,
            fatherName: data.fatherName,
            rank: data.rank,
            trade: data.trade,
            serviceNumber: data.serviceNumber,
            badgeNumber: data.badgeNumber,
            bloodGroup: data.bloodGroup,
            memberPostType: data.memberPostType as MemberPostType,
            joiningRank: data.joiningRank,
            dateOfBirth: new Date(data.dateOfBirth),
            dateOfEnrollment: new Date(data.dateOfEnrollment),
            superannuationDate: new Date(data.superannuationDate),
            dateOfDischarge: data.dateOfDischarge ? new Date(data.dateOfDischarge) : null,
            address: data.address,
            phone: data.phone,
            unitId: data.unitId,
            status: data.status as MemberStatus,
            closureReason: (data.closureReason || null) as ClosureReason | null,
            closureNotes: data.closureNotes || null,
            subscriptionStartDate: new Date(data.subscriptionStartDate),
            parentDepartment: data.parentDepartment || null,
            dateApplied: new Date(data.dateApplied),
            receiptDate: new Date(data.receiptDate),
            allotmentDate: new Date(data.allotmentDate),
            firstWitness: JSON.stringify({ name: data.firstWitnessName, address: data.firstWitnessAddress }),
            secondWitness: JSON.stringify({ name: data.secondWitnessName, address: data.secondWitnessAddress }),
            nominees: JSON.stringify(data.nominees),
        };

        await prisma.member.create({
            data: newMember
        });

        return NextResponse.json({ message: 'Member created successfully', id: memberId }, { status: 201 });

    } catch (error: any) {
        if (error.code === 'P2002') { // Prisma's unique constraint violation code
             return NextResponse.json({ message: `A member with the same unique information (e.g., membership code) already exists.` }, { status: 409 });
        }
        console.error("Failed to create member:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
