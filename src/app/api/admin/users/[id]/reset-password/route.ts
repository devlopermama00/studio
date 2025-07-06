
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/services/email';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAdmin(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const userIdToReset = params.id;
        if (!Types.ObjectId.isValid(userIdToReset)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        
        const userToReset = await User.findById(userIdToReset);
        if (!userToReset) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (userToReset.role === 'admin') {
            return NextResponse.json({ message: 'Cannot reset password for an administrator.' }, { status: 403 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const oneHour = 3600000; // 1 hour in milliseconds

        userToReset.forgotPasswordToken = resetToken;
        userToReset.forgotPasswordTokenExpiry = new Date(Date.now() + oneHour);
        await userToReset.save();
        
        await sendPasswordResetEmail(userToReset.email, userToReset.name, resetToken);

        return NextResponse.json({ message: 'Password reset email sent successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Admin password reset error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while sending the reset link.', error: errorMessage }, { status: 500 });
    }
}
