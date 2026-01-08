import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // The $queryRaw command is a good way to test the connection without affecting data.
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ message: 'Database connection successful!' });
    } catch (error: any) {
        console.error("Database connection test failed:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
