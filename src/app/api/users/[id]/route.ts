import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

// GET a single user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword });

    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch user: ' + error.message }, { status: 500 });
    }
}


// UPDATE a user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { email, name, password, role, unitId } = await request.json();

        const updateData: {
            email?: string;
            name?: string;
            password?: string;
            role?: UserRole;
            unitId?: string | null;
        } = {
            email,
            name,
            role: role as UserRole,
            unitId: role === UserRole.UnitAdmin ? unitId : null
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });
        
        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ user: userWithoutPassword });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Failed to update user: ' + error.message }, { status: 500 });
    }
}


// DELETE a user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        if (error.code === 'P2025') { // Record to delete not found
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to delete user: ' + error.message }, { status: 500 });
    }
}
