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

        // Fetch Member and Target Unit to perform the code update
        const [member, toUnit] = await Promise.all([
            prisma.member.findUnique({ where: { id: memberId } }),
            prisma.unit.findUnique({ where: { id: toUnitId } })
        ]);

        if (!member || !toUnit) {
            return NextResponse.json({ message: 'Member or Target Unit not found' }, { status: 404 });
        }

        // Construct new membership code based on requirements
        // Format: UNITCODE-SERIAL-DATE (e.g., 1MR-30002-0226)
        const codeParts = member.membershipCode.split('-');
        let newMembershipCode = member.membershipCode;
        
        if (codeParts.length === 3) {
            // Replace the first part (unit identifier) with the destination unit name
            codeParts[0] = toUnit.name;
            newMembershipCode = codeParts.join('-');
        }

        const transferId = uuidv4();

        // Use a transaction to create the transfer record and update the member simultaneously
        await prisma.$transaction([
            // 1. Create the transfer record
            prisma.transfer.create({
                data: {
                    id: transferId,
                    memberId: memberId,
                    fromUnitId: fromUnitId,
                    toUnitId: toUnitId,
                    transferDate: new Date(transferDate),
                }
            }),
            // 2. Update the member's unit assignment and generated code
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
