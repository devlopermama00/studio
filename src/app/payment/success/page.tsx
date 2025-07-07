
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BookingDetails {
    metadata: {
        tourTitle: string;
        bookingDate: string;
        guests: string;
    };
    customer_email: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [details, setDetails] = useState<BookingDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID found. Your booking may still be processing.");
            setIsLoading(false);
            return;
        }

        const fetchSessionDetails = async () => {
            try {
                const response = await fetch(`/api/payment/session/${sessionId}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to verify payment session.');
                }
                setDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        // Give Stripe webhook a moment to process
        setTimeout(() => {
            fetchSessionDetails();
        }, 2000);

    }, [sessionId]);

    if (isLoading) {
        return (
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <CardTitle className="text-3xl font-bold font-headline mt-4">
                        Verifying Payment...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
         return (
             <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="text-3xl font-bold font-headline mt-4">
                        Verification Failed
                    </CardTitle>
                    <CardDescription>
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild>
                        <Link href="/dashboard/bookings">Check My Bookings</Link>
                    </Button>
                </CardContent>
            </Card>
         )
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <CardTitle className="text-3xl font-bold font-headline mt-4">
                    Payment Successful!
                </CardTitle>
                 <CardDescription>
                    Your tour has been booked. A confirmation has been sent to {details?.customer_email}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {details && (
                     <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md space-y-2">
                         <h3 className="font-semibold text-foreground mb-2">Booking Summary</h3>
                         <div className="flex justify-between"><span>Tour:</span> <span className="font-medium text-foreground text-right">{details.metadata.tourTitle}</span></div>
                         <div className="flex justify-between"><span>Date:</span> <span className="font-medium text-foreground">{new Date(details.metadata.bookingDate).toLocaleDateString()}</span></div>
                         <div className="flex justify-between"><span>Guests:</span> <span className="font-medium text-foreground">{details.metadata.guests}</span></div>
                    </div>
                )}
                <div className="flex justify-center">
                    <Button asChild>
                        <Link href="/dashboard/bookings">View My Bookings</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
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
