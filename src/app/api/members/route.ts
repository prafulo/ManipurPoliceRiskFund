import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
    try {
        const membersResults: any = await query('SELECT * FROM members', []);
        const unitsResults: any = await query('SELECT * FROM units', []);

        const unitsMap = new Map(unitsResults.map((unit: any) => [unit.id, unit.name]));

        const enrichedMembers = membersResults.map((member: any) => ({
            ...member,
            // Convert numbers back to strings where appropriate from DB
            serviceNumber: String(member.service_number),
            badgeNumber: String(member.badge_number),
            // Map unitId to unitName
            unitName: unitsMap.get(member.unit_id) || 'N/A',
            // Handle JSON fields
            nominees: JSON.parse(member.nominees || '[]'),
            firstWitness: JSON.parse(member.first_witness || '{}'),
            secondWitness: JSON.parse(member.second_witness || '{}'),
        }));
        
        return NextResponse.json({ members: enrichedMembers });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
