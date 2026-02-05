import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';

    try {
        const where = query ? {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma.user.count({ where })
        ]);

        // Omit password from the response
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        
        return NextResponse.json({ 
            users: usersWithoutPassword,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
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
                id: uuidv4(),
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
