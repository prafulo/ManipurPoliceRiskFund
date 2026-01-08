import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

function toMySQLDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return format(new Date(date), 'yyyy-MM-dd');
}

function toMySQLDatetime(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
}


export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const memberId = uuidv4();
        const now = new Date();

        const sql = `
            INSERT INTO members (id, membership_code, name, father_name, rank, trade, service_number, badge_number, blood_group, member_post_type, joining_rank, date_of_birth, date_of_enrollment, superannuation_date, date_of_discharge, address, phone, unit_id, status, closure_reason, closure_notes, subscription_start_date, parent_department, date_applied, receipt_date, allotment_date, created_at, updated_at, first_witness, second_witness, nominees)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            memberId, data.membershipCode, data.name, data.fatherName, data.rank, data.trade, data.serviceNumber, data.badgeNumber, data.bloodGroup, data.memberPostType, data.joiningRank,
            toMySQLDate(data.dateOfBirth), toMySQLDate(data.dateOfEnrollment), toMySQLDate(data.superannuationDate), toMySQLDate(data.dateOfDischarge),
            data.address, data.phone, data.unitId, data.status,
            data.closureReason || null, data.closureNotes || null, toMySQLDate(data.subscriptionStartDate),
            data.parentDepartment || null, toMySQLDate(data.dateApplied), toMySQLDate(data.receiptDate), toMySQLDate(data.allotmentDate),
            toMySQLDatetime(now), toMySQLDatetime(now),
            JSON.stringify({ name: data.firstWitnessName, address: data.firstWitnessAddress }),
            JSON.stringify({ name: data.secondWitnessName, address: data.secondWitnessAddress }),
            JSON.stringify(data.nominees)
        ];

        await query(sql, values);

        return NextResponse.json({ message: 'Member created successfully', id: memberId }, { status: 201 });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
             return NextResponse.json({ message: `A member with the same unique information already exists.` }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
