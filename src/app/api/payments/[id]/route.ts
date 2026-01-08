import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        await prisma.payment.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: 'Payment deleted successfully' });

    } catch (error: any) {
        console.error("Failed to delete payment:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
