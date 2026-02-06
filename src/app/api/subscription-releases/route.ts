import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';

    try {
        const where: any = {
            AND: [
                { releaseDate: { not: null } },
                query ? {
                    OR: [
                        { name: { contains: query } },
                        { membershipCode: { contains: query } },
                        { serviceNumber: { contains: query } }
                    ]
                } : {}
            ]
        };

        const [releases, total] = await Promise.all([
            prisma.member.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    releaseDate: 'desc'
                },
                include: {
                    unit: { select: { name: true } }
                }
            }),
            prisma.member.count({ where })
        ]);

        const formatted = releases.map(r => ({
            ...r,
            unitName: r.unit.name,
            releaseAmount: r.releaseAmount ? Number(r.releaseAmount) : null
        }));

        return NextResponse.json({ 
            releases: formatted,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error: any) {
        console.error("Failed to fetch subscription releases:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
