import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        // Omit password from the response
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        return NextResponse.json({ users: usersWithoutPassword });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch users: " + error.message }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const { email, name, password, role, unitId } = await request.json();

        if (!email || !name || !password || !role) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        if (role === UserRole.UnitAdmin && !unitId) {
             return NextResponse.json({ message: "Unit ID is required for Unit Admins" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role as UserRole,
                unitId: role === UserRole.UnitAdmin ? unitId : null,
            }
        });
        
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

    } catch (error: any) {
         if (error.code === 'P2002') {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: "Failed to create user: " + error.message }, { status: 500 });
    }
}
