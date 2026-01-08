import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

function toMySQLDatetime(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, amount, months } = data;

        if (!memberId || !amount || !months || !Array.isArray(months)) {
            return NextResponse.json({ message: 'Missing required payment data' }, { status: 400 });
        }
        
        const paymentId = uuidv4();
        const paymentDate = new Date();

        const sql = `
            INSERT INTO payments (id, member_id, amount, payment_date, months)
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            paymentId,
            memberId,
            amount,
            toMySQLDatetime(paymentDate),
            JSON.stringify(months.map(m => format(new Date(m), 'yyyy-MM-dd')))
        ];

        await query(sql, values);

        return NextResponse.json({ message: 'Payment created successfully', id: paymentId }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
