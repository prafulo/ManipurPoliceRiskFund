import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        await query('DELETE FROM payments WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Payment deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
