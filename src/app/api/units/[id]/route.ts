import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        const result = await prisma.units.update({
            where: { id: id },
            data: { name: name },
        });
        
        return NextResponse.json({ message: 'Unit updated successfully' });

    } catch (error: any) {
       if (error.code === 'P2002') { // Prisma unique constraint violation
             return NextResponse.json({ message: `Unit name "${name}" already exists.` }, { status: 409 });
        }
        console.error("Failed to update unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const memberCount = await prisma.member.count({
            where: { unitId: id },
        });

        if(memberCount > 0) {
            return NextResponse.json({ message: 'Cannot delete unit with assigned members. Please transfer members first.' }, { status: 400 });
        }

        await prisma.units.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: 'Unit deleted successfully' });

    } catch (error: any) {
        console.error("Failed to delete unit:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
