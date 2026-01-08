import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
    try {
        // The query 'SELECT 1' is a standard way to check a database connection
        // without interacting with any specific tables.
        await query('SELECT 1', []);
        return NextResponse.json({ message: 'Database connection successful!' });
    } catch (error: any) {
        console.error("Database connection test failed:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
