import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeParse(val: any) {
    if (typeof val === 'object' && val !== null) return val;
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (e) {
            return [];
        }
    }
    return [];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';

    try {
        const where = query ? {
            OR: [
                { member: { name: { contains: query } } },
                { member: { membershipCode: { contains: query } } },
                { member: { serviceNumber: { contains: query } } }
            ]
        } : {};

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    member: {
                        select: {
                            name: true,
                            membershipCode: true,
                            serviceNumber: true,
                            unit: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    paymentDate: 'desc'
                }
            }),
            prisma.payment.count({ where })
        ]);

        const formattedPayments = payments.map(p => ({
            id: p.id,
            memberId: p.memberId,
            amount: Number(p.amount),
            months: safeParse(p.months),
            paymentDate: p.paymentDate,
            memberName: p.member.name,
            membershipCode: p.member.membershipCode,
            unitName: p.member.unit.name,
        }));

        return NextResponse.json({ 
            payments: formattedPayments,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error: any) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}