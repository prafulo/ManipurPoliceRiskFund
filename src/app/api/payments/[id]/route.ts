import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const payment = await prisma.payment.findUnique({
            where: { id: id },
            include: {
                member: {
                    include: {
                        unit: true
                    }
                }
            }
        });

        if (!payment) {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }

        return NextResponse.json({
            payment: {
                id: payment.id,
                memberId: payment.memberId,
                amount: Number(payment.amount),
                paymentDate: payment.paymentDate,
                months: JSON.parse(payment.months as string),
                memberName: payment.member.name,
                membershipCode: payment.member.membershipCode,
                serviceNumber: payment.member.serviceNumber,
                rank: payment.member.rank,
                unitName: payment.member.unit.name,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

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
