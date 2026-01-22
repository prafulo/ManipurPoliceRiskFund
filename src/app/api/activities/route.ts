import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subMonths, parseISO, startOfDay, endOfDay } from 'date-fns';
import type { Activity } from '@/lib/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // By default, fetch data for the last 3 months.
    // Data older than this is filtered out but not deleted from the database
    // to preserve historical records for other reporting needs.
    const threeMonthsAgo = subMonths(new Date(), 3);

    const startDate = startDateParam ? startOfDay(parseISO(startDateParam)) : threeMonthsAgo;
    const endDate = endDateParam ? endOfDay(parseISO(endDateParam)) : new Date();

    try {
        const newMembers = await prisma.member.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const payments = await prisma.payment.findMany({
            where: {
                paymentDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { member: { select: { name: true } } },
        });

        const transfers = await prisma.transfer.findMany({
            where: {
                transferDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                member: { select: { name: true } },
                fromUnit: { select: { name: true } },
                toUnit: { select: { name: true } },
            },
        });

        const activities: Activity[] = [];

        newMembers.forEach(member => {
            activities.push({
                id: `member-${member.id}`,
                type: 'new-member',
                date: member.createdAt,
                description: `New Member: ${member.name}`,
                details: 'Joined the fund.',
            });
        });

        payments.forEach(payment => {
            activities.push({
                id: `payment-${payment.id}`,
                type: 'payment',
                date: payment.paymentDate,
                description: `Payment from ${payment.member.name}`,
                details: `Rs. ${Number(payment.amount).toFixed(2)} received.`,
                amount: Number(payment.amount),
            });
        });

        transfers.forEach(transfer => {
            activities.push({
                id: `transfer-${transfer.id}`,
                type: 'transfer',
                date: transfer.transferDate,
                description: `Transfer for ${transfer.member.name}`,
                details: `From ${transfer.fromUnit.name} to ${transfer.toUnit.name}.`,
            });
        });

        const sortedActivities = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ activities: sortedActivities });

    } catch (error: any) {
        console.error("Failed to fetch activities:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
