import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const unitName = searchParams.get('unitName');

    if (!unitId || !unitName) {
        return NextResponse.json({ message: 'Unit ID and Name are required' }, { status: 400 });
    }

    try {
        const lastMember = await prisma.member.findFirst({
            where: { unitId: unitId },
            orderBy: { createdAt: 'desc' },
            select: { membershipCode: true }
        });
        
        let nextSerial = 30001; // Starting serial number

        if (lastMember && lastMember.membershipCode) {
             const parts = lastMember.membershipCode.split('-');
             if (parts.length === 3) {
                 const lastSerial = parseInt(parts[1], 10);
                 if (!isNaN(lastSerial)) {
                    nextSerial = lastSerial + 1;
                 }
             }
        }
        
        const datePart = format(new Date(), 'MMyy');
        const nextCode = `${unitName}-${nextSerial}-${datePart}`;

        return NextResponse.json({ code: nextCode });

    } catch (error: any) {
        console.error("Failed to generate next code:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
