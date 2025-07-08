
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign } from "lucide-react"

interface PayoutTransaction {
    id: string;
    date: string;
    amount: number;
    bookingCount: number;
    status: 'Paid';
}

const PayoutsSkeleton = () => (
    Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        </TableRow>
    ))
);


export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/provider/payouts');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch payouts');
                }
                const data = await response.json();
                setPayouts(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                })
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayouts();
    }, [toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                    A record of all payouts you have received from DayTourGuides.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payout Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Included Bookings</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <PayoutsSkeleton /> : payouts.length > 0 ? (
                            payouts.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell>{format(new Date(payout.date), "PPP")}</TableCell>
                                    <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                                    <TableCell>{payout.bookingCount} bookings</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500 hover:bg-green-500">
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    You have not received any payouts yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
