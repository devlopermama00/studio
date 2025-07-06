
import { NextResponse, type NextRequest } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Token and password are required.' }, { status: 400 });
        }
        
        const user = await User.findOne({ 
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
        }
        
        const passwordHash = await bcryptjs.hash(password, 10);

        user.passwordHash = passwordHash;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        
        await user.save();

        return NextResponse.json({ message: 'Password has been successfully reset.', success: true }, { status: 200 });

    } catch (error) {
        console.error('Reset password error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
