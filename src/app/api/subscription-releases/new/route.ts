import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, amount, releaseDate, notes } = data;

        if (!memberId || !amount || !releaseDate) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId }
        });

        if (!member) {
            return NextResponse.json({ message: 'Member not found.' }, { status: 404 });
        }

        if (member.releaseDate) {
            return NextResponse.json({ message: 'A subscription release has already been processed for this member.' }, { status: 409 });
        }
        
        await prisma.member.update({
            where: { id: memberId },
            data: {
                releaseDate: new Date(releaseDate),
                releaseAmount: amount,
                releaseNotes: notes,
            }
        });

        return NextResponse.json({ message: 'Subscription release recorded successfully' }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to create subscription release:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
