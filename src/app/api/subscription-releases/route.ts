import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Fetch members who have had a release processed
        const releases = await prisma.member.findMany({
            where: {
                releaseDate: {
                    not: null
                }
            },
            orderBy: {
                releaseDate: 'desc'
            }
        });

        // The data is already in the correct format on the member model
        return NextResponse.json({ releases });
    } catch (error: any) {
        console.error("Failed to fetch subscription releases:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
