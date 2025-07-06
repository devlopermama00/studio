
"use client"

import { useState } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

// This is mock data. In a real application, you'd fetch this from your API.
const mockPayoutsData = [
    { providerId: '1', providerName: 'Kazbegi Guides', pendingBalance: 1250.75, lastPayout: new Date('2023-10-01'), status: 'due' },
    { providerId: '2', providerName: 'Tbilisi Treks', pendingBalance: 875.20, lastPayout: new Date('2023-10-02'), status: 'processing' },
    { providerId: '3', providerName: 'Wine Tours Georgia', pendingBalance: 0, lastPayout: new Date('2023-10-15'), status: 'paid' },
    { providerId: '4', providerName: 'Batumi Adventures', pendingBalance: 245.50, lastPayout: new Date('2023-09-28'), status: 'due' },
];

type PayoutStatus = 'due' | 'processing' | 'paid';

interface Payout {
    providerId: string;
    providerName: string;
    pendingBalance: number;
    lastPayout: Date;
    status: PayoutStatus;
}


export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(mockPayoutsData);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcessPayout = (providerId: string) => {
    setActiveActionId(providerId);
    toast({
        title: "Processing Payout...",
        description: "In a real app, this would trigger a payment API.",
    });

    // Simulate API call
    setTimeout(() => {
        setPayouts(payouts.map(p => p.providerId === providerId ? { ...p, status: 'processing' } : p));
        toast({
            title: "Payout Initiated!",
            description: `${payouts.find(p=>p.providerId === providerId)?.providerName}'s payout is processing.`,
        });
        setActiveActionId(null);
    }, 1500);
  };
  
  const handleMarkAsPaid = (providerId: string) => {
    setActiveActionId(providerId);
    toast({
        title: "Confirming Payment...",
        description: "Marking this payout as complete.",
    });

    // Simulate API call and update local state
    setTimeout(() => {
        setPayouts(payouts.map(p => 
            p.providerId === providerId 
            ? { ...p, status: 'paid', pendingBalance: 0, lastPayout: new Date() } 
            : p
        ));
        toast({
            title: "Payout Complete!",
            description: `Payout for ${payouts.find(p=>p.providerId === providerId)?.providerName} marked as paid.`,
        });
        setActiveActionId(null);
    }, 1500);
  };

  const renderActions = (payout: Payout) => {
      const isActionRunning = activeActionId === payout.providerId;

      switch (payout.status) {
          case 'due':
              return (
                  <Button size="sm" onClick={() => handleProcessPayout(payout.providerId)} disabled={isActionRunning || payout.pendingBalance <= 0}>
                      {isActionRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Process Payout
                  </Button>
              );
          case 'processing':
              return (
                  <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(payout.providerId)} disabled={isActionRunning}>
                       {isActionRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mark as Paid
                  </Button>
              );
          case 'paid':
               return (
                   <Button size="sm" variant="secondary" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Paid
                    </Button>
               );
          default:
              return null;
      }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Payouts</CardTitle>
        <CardDescription>
          Manage and process payouts to your tour providers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Pending Balance</TableHead>
              <TableHead>Last Payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
                <TableRow key={payout.providerId}>
                    <TableCell className="font-medium">{payout.providerName}</TableCell>
                    <TableCell>${payout.pendingBalance.toFixed(2)}</TableCell>
                    <TableCell>{format(payout.lastPayout, "PPP")}</TableCell>
                    <TableCell>
                        <Badge variant={payout.status === 'due' ? 'destructive' : payout.status === 'paid' ? 'default' : 'secondary'}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                    </TableCell>
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
              Payouts are calculated based on completed tours minus platform commission.
          </p>
      </CardFooter>
    </Card>
  )
}
