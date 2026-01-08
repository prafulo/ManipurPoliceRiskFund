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
            membership_code: data.membershipCode,
            name: data.name,
            father_name: data.fatherName,
            rank: data.rank,
            trade: data.trade,
            service_number: data.serviceNumber,
            badge_number: data.badgeNumber,
            blood_group: data.bloodGroup,
            member_post_type: data.memberPostType as MemberPostType,
            joining_rank: data.joiningRank,
            date_of_birth: new Date(data.dateOfBirth),
            date_of_enrollment: new Date(data.dateOfEnrollment),
            superannuation_date: new Date(data.superannuationDate),
            date_of_discharge: data.dateOfDischarge ? new Date(data.dateOfDischarge) : null,
            address: data.address,
            phone: data.phone,
            unitId: data.unitId,
            status: data.status as MemberStatus,
            closure_reason: (data.closureReason || null) as ClosureReason | null,
            closure_notes: data.closureNotes || null,
            subscription_start_date: new Date(data.subscriptionStartDate),
            parent_department: data.parentDepartment || null,
            date_applied: new Date(data.dateApplied),
            receipt_date: new Date(data.receiptDate),
            allotment_date: new Date(data.allotmentDate),
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
