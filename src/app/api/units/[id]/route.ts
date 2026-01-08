import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Unit name is required' }, { status: 400 });
        }

        const result = await query('UPDATE units SET name = ? WHERE id = ?', [name, id]);
        
        return NextResponse.json({ message: 'Unit updated successfully' });

    } catch (error: any) {
       if (error.code === 'ER_DUP_ENTRY') {
             return NextResponse.json({ message: `Unit name "${error.values[0]}" already exists.` }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const [members] = await query('SELECT COUNT(*) as count FROM members WHERE unit_id = ?', [id]) as any;

        if(members.count > 0) {
            return NextResponse.json({ message: 'Cannot delete unit with assigned members. Please transfer members first.' }, { status: 400 });
        }

        await query('DELETE FROM units WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Unit deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
