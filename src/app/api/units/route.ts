import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const units = await prisma.units.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json({ units });
    } catch (error: any) {
        console.error("Failed to fetch units:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
