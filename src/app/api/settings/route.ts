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
        const { subscriptionAmount, expiredReleaseAmount } = body;

        const upsertSubscription = prisma.setting.upsert({
            where: { key: 'subscriptionAmount' },
            update: { value: String(subscriptionAmount) },
            create: { key: 'subscriptionAmount', value: String(subscriptionAmount) },
        });

        const upsertExpiredRelease = prisma.setting.upsert({
            where: { key: 'expiredReleaseAmount' },
            update: { value: String(expiredReleaseAmount) },
            create: { key: 'expiredReleaseAmount', value: String(expiredReleaseAmount) },
        });

        await prisma.$transaction([upsertSubscription, upsertExpiredRelease]);

        return NextResponse.json({ message: 'Settings updated successfully' });

    } catch (error: any) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
