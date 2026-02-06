import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const ranks = await prisma.rank.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json({ ranks });
    } catch (error: any) {
        console.error("Failed to fetch ranks:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
