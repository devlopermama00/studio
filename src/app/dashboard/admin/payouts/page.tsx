
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PayoutData {
    providerId: string;
    providerName: string;
    pendingBalance: number;
    processingBalance: number;
    lastPayoutDate: string | null;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/admin/payouts');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch payout data');
        }
        const data: PayoutData[] = await response.json();
        setPayouts(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProcessPayout = async (providerId: string) => {
    setActiveActionId(providerId);
    try {
        const response = await fetch('/api/admin/payouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to start payout process.');

        toast({ title: "Payout Initiated!", description: "The payout is now processing." });
        fetchPayouts();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setActiveActionId(null);
    }
  };
  
  const handleMarkAsPaid = async (providerId: string) => {
    setActiveActionId(providerId);
    try {
        const response = await fetch(`/api/admin/payouts/${providerId}`, {
            method: 'PATCH'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to mark payout as paid.');

        toast({ title: "Payout Complete!", description: "The payout has been marked as paid." });
        fetchPayouts();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
        setActiveActionId(null);
    }
  };

  const renderActions = (payout: PayoutData) => {
      const isActionRunning = activeActionId === payout.providerId;

      return (
          <div className="flex flex-col gap-2 items-end">
              {payout.pendingBalance > 0 && (
                   <Button size="sm" onClick={() => handleProcessPayout(payout.providerId)} disabled={isActionRunning}>
                      {isActionRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Process ${payout.pendingBalance.toFixed(2)}
                  </Button>
              )}
              {payout.processingBalance > 0 && (
                  <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(payout.providerId)} disabled={isActionRunning}>
                       {isActionRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Mark ${payout.processingBalance.toFixed(2)} as Paid
                  </Button>
              )}
              {payout.pendingBalance <= 0 && payout.processingBalance <= 0 && (
                   <Button size="sm" variant="secondary" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Up to date
                    </Button>
               )}
          </div>
      )
  };

  const SkeletonRows = () => Array.from({ length: 3 }).map((_, index) => (
    <TableRow key={index}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
    </TableRow>
  ));


  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Payouts</CardTitle>
        <CardDescription>
          Manage and process payouts to your tour providers based on completed tours, with a 25% platform commission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Pending Payout</TableHead>
              <TableHead>In Process</TableHead>
              <TableHead>Last Payout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <SkeletonRows /> : payouts.map((payout) => (
                <TableRow key={payout.providerId}>
                    <TableCell className="font-medium">{payout.providerName}</TableCell>
                    <TableCell>${payout.pendingBalance.toFixed(2)}</TableCell>
                    <TableCell>${payout.processingBalance.toFixed(2)}</TableCell>
                    <TableCell>{payout.lastPayoutDate ? format(new Date(payout.lastPayoutDate), "PPP") : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {renderActions(payout)}
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">
              Payouts are calculated from completed tours. A 25% commission fee is automatically deducted.
          </p>
      </CardFooter>
    </Card>
  )
}
