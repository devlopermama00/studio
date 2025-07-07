
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyUser(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;

    try {
        await dbConnect();
        const body = await request.json();

        const parseResult = changePasswordSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ message: 'Invalid input', errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { currentPassword, newPassword } = parseResult.data;

        const user = await User.findById(userCheck.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isPasswordCorrect = await bcryptjs.compare(currentPassword, user.passwordHash);
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: 'Incorrect current password.' }, { status: 403 });
        }

        const newPasswordHash = await bcryptjs.hash(newPassword, 10);
        user.passwordHash = newPasswordHash;
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Error updating password:', error);
         if (error instanceof Error) {
             return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
