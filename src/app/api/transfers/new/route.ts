
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, fromUnitId, toUnitId, transferDate } = data;

        if (!memberId || !fromUnitId || !toUnitId || !transferDate) {
            return NextResponse.json({ message: 'Missing required transfer data' }, { status: 400 });
        }

        const [member, toUnit] = await Promise.all([
            prisma.member.findUnique({ where: { id: memberId } }),
            prisma.unit.findUnique({ where: { id: toUnitId } })
        ]);

        if (!member || !toUnit) {
            return NextResponse.json({ message: 'Member or Target Unit not found' }, { status: 404 });
        }

        // Automatic Membership Code Update logic
        const codeParts = member.membershipCode.split('-');
        let newMembershipCode = member.membershipCode;
        
        if (codeParts.length === 3) {
            codeParts[0] = toUnit.name; // Replace 1MR with 2MR etc.
            newMembershipCode = codeParts.join('-');
        }

        const transferId = uuidv4();

        await prisma.$transaction([
            prisma.transfer.create({
                data: {
                    id: transferId,
                    memberId: memberId,
                    fromUnitId: fromUnitId,
                    toUnitId: toUnitId,
                    transferDate: new Date(transferDate),
                }
            }),
            prisma.member.update({
                where: { id: memberId },
                data: {
                    unitId: toUnitId,
                    membershipCode: newMembershipCode
                }
            })
        ]);

        return NextResponse.json({ 
            message: 'Transfer processed successfully', 
            id: transferId,
            newCode: newMembershipCode 
        }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to process transfer:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
