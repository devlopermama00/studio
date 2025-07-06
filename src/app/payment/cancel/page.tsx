
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CancelPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-3xl font-bold font-headline mt-4">
            Payment Cancelled
          </CardTitle>
          <CardDescription>
            Your booking was not completed. You have not been charged.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/tours">Return to Tours</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
