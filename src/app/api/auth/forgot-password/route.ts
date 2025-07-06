
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/services/email';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email } = await request.json();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Only proceed if user is found, but don't reveal if the user exists
            const token = crypto.randomBytes(32).toString('hex');
            const oneHour = 3600000; // 1 hour in milliseconds

            user.forgotPasswordToken = token;
            user.forgotPasswordTokenExpiry = new Date(Date.now() + oneHour);
            await user.save();
            
            await sendPasswordResetEmail(user.email, user.name, token);
        }

        // Always return a generic success message to prevent user enumeration attacks.
        return NextResponse.json({ 
            message: 'If an account with that email exists, a password reset link has been sent.',
            success: true
        }, { status: 200 });

    } catch (error) {
        console.error('Forgot password error:', error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : (typeof error === 'object' && error !== null && 'message' in error) 
            ? String((error as { message: unknown }).message)
            : 'An unknown server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
