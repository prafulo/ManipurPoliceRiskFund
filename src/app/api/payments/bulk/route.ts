import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

type PaymentPayload = {
    memberId: string;
    amount: number;
    months: (string | Date)[];
    memberName: string;
};

export async function POST(request: NextRequest) {
    try {
        const paymentsToCreate: PaymentPayload[] = await request.json();

        if (!Array.isArray(paymentsToCreate) || paymentsToCreate.length === 0) {
            return NextResponse.json({ message: 'No payments to process.' }, { status: 400 });
        }

        const paymentDate = new Date();
        
        const prismaCreateOperations = paymentsToCreate.flatMap(payment => {
            // For bulk payments, we create one payment record per member,
            // with all their selected months in the JSON array.
            return prisma.payment.create({
                data: {
                    id: uuidv4(),
                    memberId: payment.memberId,
                    amount: payment.amount,
                    paymentDate: paymentDate,
                    months: JSON.stringify(payment.months),
                }
            });
        });

        // Use a transaction to ensure all payments are created or none are.
        await prisma.$transaction(prismaCreateOperations);

        return NextResponse.json({ message: `${paymentsToCreate.length} payment records created successfully.` }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to create bulk payments:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
