import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, amount, releaseDate, notes } = data;

        if (!memberId || !amount || !releaseDate) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if a release for this member already exists to prevent duplicates
        const existingRelease = await prisma.subscriptionRelease.findFirst({
            where: { memberId: memberId }
        });

        if (existingRelease) {
            return NextResponse.json({ message: 'A subscription release has already been processed for this member.' }, { status: 409 });
        }
        
        await prisma.subscriptionRelease.create({
            data: {
                id: uuidv4(),
                memberId: memberId,
                amount: amount,
                releaseDate: new Date(releaseDate),
                notes: notes,
            }
        });

        return NextResponse.json({ message: 'Subscription release recorded successfully' }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to create subscription release:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
