
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SuccessContent() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <CardTitle className="text-3xl font-bold font-headline mt-4">
                    Payment Successful!
                </CardTitle>
                 <CardDescription>
                    Your tour has been booked successfully! A confirmation has been sent to your email.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button asChild>
                    <Link href="/dashboard/bookings">View My Bookings</Link>
                </Button>
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
