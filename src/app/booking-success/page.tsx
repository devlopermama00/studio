
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Give a moment for the user to see the success message before redirecting.
      // In a real app, you might also use this time to verify the session status
      // with your backend if needed, though webhooks are the primary method.
      const timer = setTimeout(() => {
        router.replace('/dashboard/bookings');
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // If there's no session ID, redirect away after a delay.
      const timer = setTimeout(() => {
        router.replace('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, router]);

  if (!sessionId) {
      return (
          <Card className="w-full max-w-lg mx-auto">
              <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Invalid Request</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                  <p className="text-muted-foreground">No booking session found. You will be redirected to the homepage.</p>
              </CardContent>
          </Card>
      );
  }
  
  return (
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
          <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-3xl font-bold font-headline">Payment Successful!</CardTitle>
              <CardDescription>Thank you for your booking. Your tour is confirmed.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                  You will be redirected to your dashboard shortly.
              </p>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <Button asChild>
                <Link href="/dashboard/bookings">
                    Go to My Bookings
                </Link>
              </Button>
          </CardContent>
      </Card>
  );
}


export default function BookingSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
             <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin" />}>
                <BookingSuccessContent />
            </Suspense>
        </div>
    )
}
