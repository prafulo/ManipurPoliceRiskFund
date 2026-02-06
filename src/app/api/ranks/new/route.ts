import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Rank name is required' }, { status: 400 });
        }

        const newRank = await prisma.rank.create({
            data: {
                id: uuidv4(),
                name: name,
            }
        });

        return NextResponse.json(newRank, { status: 201 });

    } catch (error: any) {
        if (error.code === 'P2002') {
             return NextResponse.json({ message: `Rank "${name}" already exists.` }, { status: 409 });
        }
        console.error("Failed to create rank:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
