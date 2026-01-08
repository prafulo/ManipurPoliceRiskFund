import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        const result = await query('INSERT INTO units (name) VALUES (?)', [name]) as any;

        return NextResponse.json({ id: result.insertId, name }, { status: 201 });

    } catch (error: any) {
        // Handle potential duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
             return NextResponse.json({ message: `Unit name "${error.values[0]}" already exists.` }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
