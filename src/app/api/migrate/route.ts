import { NextResponse } from 'next/server';
import { execa } from 'execa';

export async function POST() {
    try {
        // Using `prisma db push` syncs the schema without creating migration files.
        const { stdout, stderr } = await execa('npx', ['prisma', 'db', 'push', '--accept-data-loss']);

        if (stderr && !stderr.includes("Your database is already in sync")) {
            console.error("Prisma DB Push Error:", stderr);
            // Even with stderr, sometimes it's just a warning. Check stdout.
            if (!stdout.includes("Your database is now in sync")) {
                 throw new Error(stderr);
            }
        }

        return NextResponse.json({ 
            message: 'Database schema updated successfully.',
            stdout: stdout,
        });

    } catch (error: any) {
        console.error("Failed to update database schema:", error);
        return NextResponse.json({ 
            message: 'Failed to update database schema.',
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr
        }, { status: 500 });
    }
}
