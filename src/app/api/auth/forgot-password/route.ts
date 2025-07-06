
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email } = await request.json();
        
        const user = await User.findOne({ email });

        if (user) {
            // Only proceed if user is found, but don't reveal if the user exists
            const token = crypto.randomBytes(32).toString('hex');
            const oneHour = 3600000; // 1 hour in milliseconds

            user.forgotPasswordToken = token;
            user.forgotPasswordTokenExpiry = new Date(Date.now() + oneHour);
            await user.save();
            
            // In a real application, you would send an email here.
            // For this demo, we will log the reset link to the console.
            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
            console.log('Password Reset Link:', resetUrl);
        }

        // Always return a generic success message to prevent user enumeration attacks.
        return NextResponse.json({ 
            message: 'If an account with that email exists, a password reset link has been sent.',
            success: true
        }, { status: 200 });

    } catch (error) {
        console.error('Forgot password error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
