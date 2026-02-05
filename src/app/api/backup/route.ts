import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { format } from 'date-fns';

export async function GET() {
    const session = await auth();

    // Only SuperAdmin can take backups
    if (!session || session.user.role !== 'SuperAdmin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all data from the database
        const [units, members, payments, transfers, settings, users] = await Promise.all([
            prisma.unit.findMany(),
            prisma.member.findMany(),
            prisma.payment.findMany(),
            prisma.transfer.findMany(),
            prisma.setting.findMany(),
            prisma.user.findMany(),
        ]);

        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                units,
                members,
                payments,
                transfers,
                settings,
                users: users.map(({ password, ...user }) => ({ ...user, password_hash: password })), // Include hashed passwords but rename key
            }
        };

        const fileName = `mp-risk-fund-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error: any) {
        console.error("Backup failed:", error);
        return NextResponse.json({ message: 'Failed to generate backup: ' + error.message }, { status: 500 });
    }
}
