import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
    try {
         const sql = `
            SELECT 
                t.*,
                m.name as memberName,
                from_u.name as fromUnitName,
                to_u.name as toUnitName
            FROM transfers t
            JOIN members m ON t.member_id = m.id
            JOIN units from_u ON t.from_unit_id = from_u.id
            JOIN units to_u ON t.to_unit_id = to_u.id
            ORDER BY t.transfer_date DESC
        `;
        const transfers = await query(sql, []);
        return NextResponse.json({ transfers });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
