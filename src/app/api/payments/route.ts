import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                member: {
                    select: {
                        name: true,
                        membershipCode: true,
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
        });

        const formattedPayments = payments.map(p => ({
            id: p.id,
            memberId: p.memberId,
            amount: Number(p.amount),
            months: JSON.parse(p.months as string),
            paymentDate: p.paymentDate,
            memberName: p.member.name,
            membershipCode: p.member.membershipCode,
            unitName: p.member.unit.name,
        }));

        return NextResponse.json({ payments: formattedPayments });
    } catch (error: any) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
