import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { format } from 'date-fns';

/**
 * Escapes values for SQL insert statements.
 */
function escapeSqlValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (value instanceof Date) {
        // MySQL format: YYYY-MM-DD HH:MM:SS
        return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    if (typeof value === 'object') {
        // Handle Prisma JSON fields
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    // Escape single quotes for strings
    return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Generates SQL INSERT statements for a dataset.
 */
function generateInsertStatements(tableName: string, data: any[]): string {
    if (data.length === 0) return `-- No data found for table ${tableName}\n\n`;

    const columns = Object.keys(data[0]);
    let sql = `-- Dumping data for table \`${tableName}\`\n`;
    
    data.forEach(row => {
        const values = columns.map(col => escapeSqlValue(row[col])).join(', ');
        sql += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values});\n`;
    });
    
    return sql + '\n';
}

export async function GET() {
    const session = await auth();

    // Only SuperAdmin can take backups
    if (!session || session.user.role !== 'SuperAdmin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all data from the database
        // The order matters slightly for readability, but FOREIGN_KEY_CHECKS = 0 handles constraints
        const [units, members, payments, transfers, settings, users] = await Promise.all([
            prisma.unit.findMany(),
            prisma.member.findMany(),
            prisma.payment.findMany(),
            prisma.transfer.findMany(),
            prisma.setting.findMany(),
            prisma.user.findMany(),
        ]);

        let sql = `-- Manipur Police Risk Fund Database Backup\n`;
        sql += `-- Generated on: ${new Date().toLocaleString()}\n`;
        sql += `-- ------------------------------------------------------\n\n`;
        
        sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

        // We use model names as table names. Note: If you've customized table names 
        // in schema.prisma using @@map, adjust these strings accordingly.
        sql += generateInsertStatements('Unit', units);
        sql += generateInsertStatements('Member', members);
        sql += generateInsertStatements('Payment', payments);
        sql += generateInsertStatements('Transfer', transfers);
        sql += generateInsertStatements('Setting', settings);
        sql += generateInsertStatements('User', users);

        sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

        const fileName = `mp-risk-fund-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.sql`;

        return new NextResponse(sql, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error: any) {
        console.error("Backup generation failed:", error);
        return NextResponse.json({ message: 'Failed to generate SQL backup: ' + error.message }, { status: 500 });
    }
}
