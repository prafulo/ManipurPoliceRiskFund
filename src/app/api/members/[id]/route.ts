import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import { format } from 'date-fns';

function toMySQLDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return format(new Date(date), 'yyyy-MM-dd');
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const [member] = await query('SELECT * FROM members WHERE id = ?', [id]) as any[];
        
        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json({ member });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();

        const sql = `
            UPDATE members SET
                name = ?, father_name = ?, rank = ?, trade = ?, service_number = ?, badge_number = ?, blood_group = ?, member_post_type = ?, joining_rank = ?,
                date_of_birth = ?, date_of_enrollment = ?, superannuation_date = ?, date_of_discharge = ?, address = ?, phone = ?, unit_id = ?, status = ?,
                closure_reason = ?, closure_notes = ?, subscription_start_date = ?, parent_department = ?, date_applied = ?, receipt_date = ?, allotment_date = ?,
                first_witness = ?, second_witness = ?, nominees = ?
            WHERE id = ?
        `;
        const values = [
            data.name, data.fatherName, data.rank, data.trade, data.serviceNumber, data.badgeNumber, data.bloodGroup, data.memberPostType, data.joiningRank,
            toMySQLDate(data.dateOfBirth), toMySQLDate(data.dateOfEnrollment), toMySQLDate(data.superannuationDate), toMySQLDate(data.dateOfDischarge), data.address, data.phone, data.unitId, data.status,
            data.closureReason || null, data.closureNotes || null, toMySQLDate(data.subscriptionStartDate), data.parentDepartment || null, toMySQLDate(data.dateApplied), toMySQLDate(data.receiptDate), toMySQLDate(data.allotmentDate),
            JSON.stringify({ name: data.firstWitnessName, address: data.firstWitnessAddress }),
            JSON.stringify({ name: data.secondWitnessName, address: data.secondWitnessAddress }),
            JSON.stringify(data.nominees),
            id
        ];

        await query(sql, values);

        return NextResponse.json({ message: 'Member updated successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // You might want to add checks here to ensure related data is handled correctly (e.g. payments, transfers)
        
        await query('DELETE FROM payments WHERE member_id = ?', [id]);
        await query('DELETE FROM transfers WHERE member_id = ?', [id]);
        await query('DELETE FROM members WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Member and related data deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
