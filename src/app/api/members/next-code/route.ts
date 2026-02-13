import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const unitName = searchParams.get('unitName');

    if (!unitId || !unitName) {
        return NextResponse.json({ message: 'Unit ID and Name are required' }, { status: 400 });
    }

    try {
        // Fetch global starting serial from settings
        const setting = await prisma.setting.findUnique({
            where: { key: 'membershipCodeStartSerial' }
        });
        
        let nextSerial = setting ? parseInt(setting.value) : 30001;
        
        const datePart = format(new Date(), 'MMyy');
        const nextCode = `${unitName}-${nextSerial}-${datePart}`;

        return NextResponse.json({ code: nextCode });

    } catch (error: any) {
        console.error("Failed to generate next code:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
