import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const signatures = await prisma.signature.findMany();
        
        // Return a map of signatures for easier access
        const result = {
            sig1: signatures.find(s => s.id === 'sig1') || { name: '', designation: '', organization: '' },
            sig2: signatures.find(s => s.id === 'sig2') || { name: '', designation: '', organization: '' },
            sig3: signatures.find(s => s.id === 'sig3') || { name: '', designation: '', organization: '' },
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to fetch signatures:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sig1, sig2, sig3 } = body;

        const operations = [];

        if (sig1) {
            operations.push(prisma.signature.upsert({
                where: { id: 'sig1' },
                update: { name: sig1.name, designation: sig1.designation, organization: sig1.organization },
                create: { id: 'sig1', name: sig1.name, designation: sig1.designation, organization: sig1.organization },
            }));
        }

        if (sig2) {
            operations.push(prisma.signature.upsert({
                where: { id: 'sig2' },
                update: { name: sig2.name, designation: sig2.designation, organization: sig2.organization },
                create: { id: 'sig2', name: sig2.name, designation: sig2.designation, organization: sig2.organization },
            }));
        }

        if (sig3) {
            operations.push(prisma.signature.upsert({
                where: { id: 'sig3' },
                update: { name: sig3.name, designation: sig3.designation, organization: sig3.organization },
                create: { id: 'sig3', name: sig3.name, designation: sig3.designation, organization: sig3.organization },
            }));
        }

        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }

        return NextResponse.json({ message: 'Signatures updated successfully' });

    } catch (error: any) {
        console.error("Failed to update signatures:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
