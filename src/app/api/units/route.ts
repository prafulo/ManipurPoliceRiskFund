import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
    try {
        const units = await query('SELECT * FROM units ORDER BY name ASC', []);
        return NextResponse.json({ units });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
