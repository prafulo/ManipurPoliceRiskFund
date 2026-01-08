import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const members = await prisma.member.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        // The database stores JSON, so we need to parse it for each member
        const parsedMembers = members.map(member => ({
            ...member,
            nominees: member.nominees ? JSON.parse(member.nominees as string) : [],
            firstWitness: member.firstWitness ? JSON.parse(member.firstWitness as string) : {},
            secondWitness: member.secondWitness ? JSON.parse(member.secondWitness as string) : {},
        }));
        return NextResponse.json({ members: parsedMembers });

    } catch (error: any) {
        console.error("Failed to fetch members:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
