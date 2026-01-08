import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ClosureReason, MemberPostType, MemberStatus } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const member = await prisma.member.findUnique({
            where: { id: id },
        });
        
        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        // The database stores JSON, but we parse it before sending to the client
        return NextResponse.json({
          member: {
            ...member,
            nominees: JSON.parse(member.nominees as string),
            firstWitness: JSON.parse(member.firstWitness as string),
            secondWitness: JSON.parse(member.secondWitness as string),
          }
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();

        const memberData = {
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

        await prisma.member.update({
            where: { id: id },
            data: memberData,
        });

        return NextResponse.json({ message: 'Member updated successfully' });

    } catch (error: any) {
        console.error("Failed to update member:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // Prisma will handle cascading deletes for payments and transfers as defined in the schema.
        await prisma.member.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: 'Member and related data deleted successfully' });

    } catch (error: any)
{
        console.error("Failed to delete member:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
