import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ClosureReason, MemberPostType, MemberStatus } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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
            nominees: member.nominees ? JSON.parse(member.nominees as string) : [],
            firstWitness: member.firstWitness ? JSON.parse(member.firstWitness as string) : {},
            secondWitness: member.secondWitness ? JSON.parse(member.secondWitness as string) : {},
          }
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const memberData = {
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


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
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
