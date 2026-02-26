import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';
    const all = searchParams.get('all') === 'true';

    try {
        const where = query ? {
            OR: [
                { member: { name: { contains: query } } },
                { member: { membershipCode: { contains: query } } },
                { member: { serviceNumber: { contains: query } } }
            ]
        } : {};

        const findOptions: any = {
            where,
            include: {
                member: { select: { name: true, membershipCode: true } },
                fromUnit: { select: { name: true } },
                toUnit: { select: { name: true } },
            },
            orderBy: {
                transferDate: 'desc'
            }
        };

        if (!all) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [transfers, total] = await Promise.all([
            prisma.transfer.findMany(findOptions),
            prisma.transfer.count({ where })
        ]);

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

        return NextResponse.json({ 
            transfers: formattedTransfers,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error: any) {
        console.error("Failed to fetch transfers:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
