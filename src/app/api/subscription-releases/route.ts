import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const releases = await prisma.subscriptionRelease.findMany({
            include: {
                member: {
                    select: {
                        name: true,
                        membershipCode: true,
                        unit: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                releaseDate: 'desc'
            }
        });

        const formattedReleases = releases.map(r => ({
            id: r.id,
            memberId: r.memberId,
            amount: r.amount,
            releaseDate: r.releaseDate,
            notes: r.notes,
            createdAt: r.createdAt,
            memberName: r.member.name,
            membershipCode: r.member.membershipCode,
            unitName: r.member.unit.name,
        }));

        return NextResponse.json({ releases: formattedReleases });
    } catch (error: any) {
        console.error("Failed to fetch subscription releases:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
