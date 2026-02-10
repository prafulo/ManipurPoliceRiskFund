import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { payments } = await request.json();

        if (!Array.isArray(payments) || payments.length === 0) {
            return NextResponse.json({ message: 'No payment data provided.' }, { status: 400 });
        }

        const results = [];
        
        for (const data of payments) {
            // Find member by code or EIN
            const member = await prisma.member.findFirst({
                where: {
                    OR: [
                        { membershipCode: data.membershipCode },
                        { serviceNumber: data.serviceNumber }
                    ]
                }
            });

            if (!member) continue;

            const monthsArray = (data.months || []).map((m: number) => {
                return new Date(data.year, m - 1, 15); // Use 15th to avoid timezone shift
            });

            if (monthsArray.length === 0) continue;

            results.push(prisma.payment.create({
                data: {
                    id: uuidv4(),
                    memberId: member.id,
                    amount: data.amount,
                    paymentDate: new Date(data.paymentDate || new Date()),
                    months: monthsArray,
                }
            }));
        }

        if (results.length === 0) {
            return NextResponse.json({ message: 'No valid records to import. Please check Membership Codes or EINs.' }, { status: 400 });
        }

        await prisma.$transaction(results);

        return NextResponse.json({ count: results.length, message: 'Import successful' });

    } catch (error: any) {
        console.error("Bulk Payment Import Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
