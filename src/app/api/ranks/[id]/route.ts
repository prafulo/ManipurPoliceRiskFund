import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Rank name is required' }, { status: 400 });
        }

        await prisma.rank.update({
            where: { id: id },
            data: { name: name },
        });
        
        return NextResponse.json({ message: 'Rank updated successfully' });

    } catch (error: any) {
       if (error.code === 'P2002') {
             return NextResponse.json({ message: `Rank "${name}" already exists.` }, { status: 409 });
        }
        console.error("Failed to update rank:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        await prisma.rank.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: 'Rank deleted successfully' });

    } catch (error: any) {
        console.error("Failed to delete rank:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
