import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const unitName = searchParams.get('unitName');

    if (!unitId || !unitName) {
        return NextResponse.json({ message: 'Unit ID and Name are required' }, { status: 400 });
    }

    try {
        const sql = `SELECT membership_code FROM members WHERE unit_id = ? ORDER BY created_at DESC LIMIT 1`;
        const [lastMember] = await query(sql, [unitId]) as any[];
        
        let nextSerial = 30001; // Starting serial number

        if (lastMember && lastMember.membership_code) {
             const parts = lastMember.membership_code.split('-');
             if (parts.length === 3) {
                 const lastSerial = parseInt(parts[1], 10);
                 if (!isNaN(lastSerial)) {
                    nextSerial = lastSerial + 1;
                 }
             }
        }
        
        const datePart = format(new Date(), 'MMyy');
        const nextCode = `${unitName}-${nextSerial}-${datePart}`;

        return NextResponse.json({ code: nextCode });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
