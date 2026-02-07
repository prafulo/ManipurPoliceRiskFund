import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const signature = await prisma.signature.findUnique({
            where: { id: 'singleton' }
        });
        
        if (!signature) {
            return NextResponse.json({
                name: '(Authority Name)',
                designation: 'Designation',
                organization: 'Organization Name'
            });
        }

        return NextResponse.json(signature);
    } catch (error: any) {
        console.error("Failed to fetch signature:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, designation, organization } = body;

        if (!name || !designation || !organization) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const signature = await prisma.signature.upsert({
            where: { id: 'singleton' },
            update: { name, designation, organization },
            create: { id: 'singleton', name, designation, organization },
        });

        return NextResponse.json(signature);

    } catch (error: any) {
        console.error("Failed to update signature:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
