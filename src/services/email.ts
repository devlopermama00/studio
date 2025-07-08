
'use server';

import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/components/emails/reset-password-email';

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error('NEXT_PUBLIC_APP_URL is not defined in your environment variables. This is required to generate password reset links.');
    }
    
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY is not defined in your environment variables. This is required to send emails.');
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const resend = new Resend(resendApiKey);
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Reset Your DayTourGuides Password',
            react: ResetPasswordEmail({ userName: name, resetUrl: resetUrl }),
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        // Re-throw a more specific error to be caught by the API route
        if (error instanceof Error) {
             throw new Error(`Email sending failed: ${error.message}`);
        }
        throw new Error('Could not send password reset email due to an unknown error.');
    }
};
