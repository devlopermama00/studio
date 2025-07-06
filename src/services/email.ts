
'use server';

import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/components/emails/reset-password-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error('NEXT_PUBLIC_APP_URL is not defined in your environment variables. This is required to generate password reset links.');
    }
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: 'TourVista Support <onboarding@resend.dev>',
            to: email,
            subject: 'Reset Your TourVista Password',
            react: ResetPasswordEmail({ userName: name, resetUrl: resetUrl }),
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        // This will now be caught by the calling API route and returned to the user.
        throw new Error('Could not send password reset email.');
    }
};
