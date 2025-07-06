
"use client"

import { useState } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// This is mock data. In a real application, you'd fetch this from your API.
const mockPayouts = [
    { providerId: '1', providerName: 'Kazbegi Guides', pendingBalance: 1250.75, lastPayout: new Date('2023-10-01'), status: 'due' },
    { providerId: '2', providerName: 'Tbilisi Treks', pendingBalance: 875.20, lastPayout: new Date('2023-10-02'), status: 'due' },
    { providerId: '3', providerName: 'Wine Tours Georgia', pendingBalance: 0, lastPayout: new Date('2023-10-15'), status: 'paid' },
    { providerId: '4', providerName: 'Batumi Adventures', pendingBalance: 245.50, lastPayout: new Date('2023-09-28'), status: 'due' },
];

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState(mockPayouts);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcessPayout = (providerId: string) => {
    setIsProcessing(providerId);
    toast({
        title: "Processing Payout...",
        description: "This is a placeholder action. In a real app, this would trigger the payment via your payment provider.",
    });

    // Simulate API call
    setTimeout(() => {
        setPayouts(payouts.map(p => p.providerId === providerId ? { ...p, status: 'processing' } : p));
        toast({
            title: "Payout Initiated!",
            description: `Payout for ${payouts.find(p=>p.providerId === providerId)?.providerName} is being processed.`,
        });
        setIsProcessing(null);
    }, 2000);
  };

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
                        <Button 
                            size="sm" 
                            onClick={() => handleProcessPayout(payout.providerId)} 
                            disabled={payout.status !== 'due' || isProcessing === payout.providerId}
                        >
                            {isProcessing === payout.providerId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Process Payout
                        </Button>
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
