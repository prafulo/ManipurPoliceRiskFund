
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let nameToLog = 'Unknown';
    try {
        const { id } = await params;
        const body = await request.json();
        const name = body.name;
        const title = body.title;
        nameToLog = name || 'Unknown';

        if (!name) {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        await prisma.unit.update({
            where: { id: id },
            data: { 
                name: name,
                title: title || null
            },
        });
        
        return NextResponse.json({ message: 'Unit updated successfully' });

    } catch (error: any) {
       if (error.code === 'P2002') {
             return NextResponse.json({ message: `Unit name "${nameToLog}" already exists.` }, { status: 409 });
        }
        console.error("Failed to update unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        const memberCount = await prisma.member.count({
            where: { unitId: id },
        });

        if(memberCount > 0) {
            return NextResponse.json({ message: 'Cannot delete unit with assigned members. Please transfer members first.' }, { status: 400 });
        }

        await prisma.unit.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: 'Unit deleted successfully' });

    } catch (error: any) {
        console.error("Failed to delete unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
