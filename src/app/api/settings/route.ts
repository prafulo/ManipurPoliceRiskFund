import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.setting.findMany();
        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subscriptionAmount, expiredReleaseAmount, membershipCodeStartSerial } = body;

        const operations = [];

        if (subscriptionAmount !== undefined) {
            operations.push(prisma.setting.upsert({
                where: { key: 'subscriptionAmount' },
                update: { value: String(subscriptionAmount) },
                create: { key: 'subscriptionAmount', value: String(subscriptionAmount) },
            }));
        }

        if (expiredReleaseAmount !== undefined) {
            operations.push(prisma.setting.upsert({
                where: { key: 'expiredReleaseAmount' },
                update: { value: String(expiredReleaseAmount) },
                create: { key: 'expiredReleaseAmount', value: String(expiredReleaseAmount) },
            }));
        }

        if (membershipCodeStartSerial !== undefined) {
            operations.push(prisma.setting.upsert({
                where: { key: 'membershipCodeStartSerial' },
                update: { value: String(membershipCodeStartSerial) },
                create: { key: 'membershipCodeStartSerial', value: String(membershipCodeStartSerial) },
            }));
        }

        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }

        return NextResponse.json({ message: 'Settings updated successfully' });

    } catch (error: any) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
