import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, amount, months } = data;

        if (!memberId || !amount || !months || !Array.isArray(months)) {
            return NextResponse.json({ message: 'Missing required payment data' }, { status: 400 });
        }
        
        const paymentId = uuidv4();
        const paymentDate = new Date();

        await prisma.payment.create({
            data: {
                id: paymentId,
                memberId: memberId,
                amount: amount,
                paymentDate: paymentDate,
                months: JSON.stringify(months)
            }
        });

        return NextResponse.json({ message: 'Payment created successfully', id: paymentId }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to create payment:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
