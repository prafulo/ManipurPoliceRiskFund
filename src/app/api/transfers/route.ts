import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const transfers = await prisma.transfer.findMany({
            include: {
                member: { select: { name: true, membershipCode: true } },
                fromUnit: { select: { name: true } },
                toUnit: { select: { name: true } },
            },
            orderBy: {
                transferDate: 'desc'
            }
        });

        const formattedTransfers = transfers.map(t => ({
            id: t.id,
            memberId: t.memberId,
            fromUnitId: t.fromUnitId,
            toUnitId: t.toUnitId,
            transferDate: t.transferDate,
            createdAt: t.createdAt,
            memberName: t.member.name,
            membershipCode: t.member.membershipCode,
            fromUnitName: t.fromUnit.name,
            toUnitName: t.toUnit.name,
        }));

        return NextResponse.json({ transfers: formattedTransfers });
    } catch (error: any) {
        console.error("Failed to fetch transfers:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
