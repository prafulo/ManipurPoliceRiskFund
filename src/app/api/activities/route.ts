import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subMonths, parseISO, startOfDay, endOfDay } from 'date-fns';
import type { Activity } from '@/lib/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    const threeMonthsAgo = subMonths(new Date(), 3);
    const startDate = startDateParam ? startOfDay(parseISO(startDateParam)) : threeMonthsAgo;
    const endDate = endDateParam ? endOfDay(parseISO(endDateParam)) : new Date();

    try {
        // Since we are merging data from 3 tables, we fetch all relevant items within the range
        // and then paginate the sorted result. For a truly high-scale system, 
        // a unified AuditLog table would be better.
        const [newMembers, payments, transfers] = await Promise.all([
            prisma.member.findMany({
                where: { createdAt: { gte: startDate, lte: endDate } },
            }),
            prisma.payment.findMany({
                where: { paymentDate: { gte: startDate, lte: endDate } },
                include: { member: { select: { name: true } } },
            }),
            prisma.transfer.findMany({
                where: { transferDate: { gte: startDate, lte: endDate } },
                include: {
                    member: { select: { name: true } },
                    fromUnit: { select: { name: true } },
                    toUnit: { select: { name: true } },
                },
            }),
        ]);

        const allActivities: Activity[] = [];

        newMembers.forEach(m => allActivities.push({
            id: `m-${m.id}`, type: 'new-member', date: m.createdAt,
            description: `New Member: ${m.name}`, details: 'Joined the fund.'
        }));

        payments.forEach(p => allActivities.push({
            id: `p-${p.id}`, type: 'payment', date: p.paymentDate,
            description: `Payment from ${p.member.name}`, details: `₹${Number(p.amount).toFixed(2)} received.`
        }));

        transfers.forEach(t => allActivities.push({
            id: `t-${t.id}`, type: 'transfer', date: t.transferDate,
            description: `Transfer for ${t.member.name}`, details: `From ${t.fromUnit.name} to ${t.toUnit.name}.`
        }));

        const sorted = allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const total = sorted.length;
        const paginated = sorted.slice((page - 1) * limit, page * limit);

        return NextResponse.json({ 
            activities: paginated,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
