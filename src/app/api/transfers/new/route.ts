import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, fromUnitId, toUnitId, transferDate } = data;

        if (!memberId || !fromUnitId || !toUnitId || !transferDate) {
            return NextResponse.json({ message: 'Missing required transfer data' }, { status: 400 });
        }
        
        const transferId = uuidv4();

        const transfer = await prisma.transfer.create({
            data: {
                id: transferId,
                memberId: memberId,
                fromUnitId: fromUnitId,
                toUnitId: toUnitId,
                transferDate: new Date(transferDate),
            }
        });
        

        return NextResponse.json({ message: 'Transfer processed successfully', id: transfer.id }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to process transfer:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
