import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        const newUnit = await prisma.units.create({
            data: {
                id: uuidv4(),
                name: name,
            }
        });

        return NextResponse.json(newUnit, { status: 201 });

    } catch (error: any) {
        // Handle potential duplicate entry error
        if (error.code === 'P2002') {
             return NextResponse.json({ message: `Unit name "${name}" already exists.` }, { status: 409 });
        }
        console.error("Failed to create unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
