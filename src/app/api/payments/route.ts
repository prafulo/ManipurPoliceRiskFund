import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
    try {
        const sql = `
            SELECT 
                p.*,
                m.name as memberName,
                m.membership_code as membershipCode,
                u.name as unitName
            FROM payments p
            JOIN members m ON p.member_id = m.id
            JOIN units u ON m.unit_id = u.id
            ORDER BY p.payment_date DESC
        `;
        const payments = await query(sql, []);
        return NextResponse.json({ payments });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
