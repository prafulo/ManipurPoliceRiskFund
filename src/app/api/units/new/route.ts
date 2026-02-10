
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    let name = 'Unknown';
    try {
        const body = await request.json();
        name = body.name || 'Unknown';
        const title = body.title;

        if (!name || name === 'Unknown') {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        const newUnit = await prisma.unit.create({
            data: {
                id: uuidv4(),
                name: name,
                title: title || null,
            }
        });

        return NextResponse.json(newUnit, { status: 201 });

    } catch (error: any) {
        if (error.code === 'P2002') {
             // Fixed: name variable is now defined in outer scope
             return NextResponse.json({ message: `Unit name "${name}" already exists.` }, { status: 409 });
        }
        console.error("Failed to create unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
