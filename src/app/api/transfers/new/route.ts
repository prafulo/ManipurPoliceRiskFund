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
        const { memberId, fromUnitId, toUnitId, transferDate } = data;

        if (!memberId || !fromUnitId || !toUnitId || !transferDate) {
            return NextResponse.json({ message: 'Missing required transfer data' }, { status: 400 });
        }
        
        const transferId = uuidv4();
        const createdAt = new Date();

        const transferSql = `
            INSERT INTO transfers (id, member_id, from_unit_id, to_unit_id, transfer_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const transferValues = [
            transferId,
            memberId,
            fromUnitId,
            toUnitId,
            toMySQLDatetime(transferDate),
            toMySQLDatetime(createdAt)
        ];

        await query(transferSql, transferValues);
        
        // Also update the member's current unitId
        const updateMemberSql = `UPDATE members SET unit_id = ? WHERE id = ?`;
        await query(updateMemberSql, [toUnitId, memberId]);

        return NextResponse.json({ message: 'Transfer processed successfully', id: transferId }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
