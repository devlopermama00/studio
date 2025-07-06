
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setErrorMessage('No session ID found.');
            return;
        }

        const verifyBooking = async () => {
            try {
                const response = await fetch('/api/bookings/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed.');
                }
                setStatus('success');
            } catch (error) {
                setStatus('error');
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                setErrorMessage(message);
                console.error('Booking verification failed:', error);
            }
        };

        verifyBooking();
    }, [sessionId]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                 {status === 'loading' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}
                 {status === 'success' && <CheckCircle className="mx-auto h-12 w-12 text-green-500" />}
                 {status === 'error' && <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />}
                <CardTitle className="text-3xl font-bold font-headline mt-4">
                    {status === 'loading' && 'Verifying Your Payment...'}
                    {status === 'success' && 'Payment Successful!'}
                    {status === 'error' && 'An Error Occurred'}
                </CardTitle>
                 <CardDescription>
                    {status === 'loading' && 'Please wait while we confirm your booking. Do not close this page.'}
                    {status === 'success' && 'Your tour has been booked successfully! A confirmation has been sent to your email.'}
                    {status === 'error' && `There was a problem processing your booking. ${errorMessage}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 {status !== 'loading' && (
                    <Button asChild>
                        <Link href="/dashboard/bookings">View My Bookings</Link>
                    </Button>
                 )}
            </CardContent>
        </Card>
    )
}

export default function SuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
           <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
