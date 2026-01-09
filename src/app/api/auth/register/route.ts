
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { email, name, password } = await request.json();

        if (!email || !name || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                id: uuidv4(),
                email,
                name,
                password: hashedPassword,
                role: UserRole.SuperAdmin, // All registered users are SuperAdmins
            }
        });
        
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ message: "Failed to create user: " + error.message }, { status: 500 });
    }
}
