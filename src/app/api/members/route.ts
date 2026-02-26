import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { MemberStatus } from '@prisma/client';

function safeParse(val: any) {
    if (typeof val === 'object' && val !== null) return val;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return []; }
    }
    return [];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status') as MemberStatus | undefined;
    const all = searchParams.get('all') === 'true';

    try {
        const where: any = {
            AND: [
                status ? { status } : {},
                query ? {
                    OR: [
                        { name: { contains: query } },
                        { membershipCode: { contains: query } },
                        { serviceNumber: { contains: query } },
                    ]
                } : {}
            ]
        };

        const findOptions: any = {
            where,
            orderBy: { createdAt: 'desc' },
            include: { unit: { select: { name: true } } }
        };

        if (!all) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [members, total] = await Promise.all([
            prisma.member.findMany(findOptions),
            prisma.member.count({ where })
        ]);

        const parsedMembers = members.map(member => ({
            ...member,
            unitName: member.unit.name,
            nominees: safeParse(member.nominees),
            firstWitness: safeParse(member.firstWitness),
            secondWitness: safeParse(member.secondWitness),
        }));

        return NextResponse.json({ 
            members: parsedMembers,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error: any) {
        console.error("Failed to fetch members:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
