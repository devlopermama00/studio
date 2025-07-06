
"use client"

import { MoreHorizontal, Loader2, Calendar as CalendarIcon, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PopulatedBooking {
    _id: string;
    userId: { name: string; email: string };
    tourId: { title: string; };
    bookingDate: string;
    guests: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/bookings');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch bookings");
                }
                const data = await response.json();
                setBookings(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Error", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [toast]);

    const handleUpdateStatus = async (bookingId: string, status: PopulatedBooking['status']) => {
        setIsUpdating(bookingId);
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking status');
            }
            const updatedBooking = await response.json();
            setBookings(b => b.map(booking => booking._id === bookingId ? { ...booking, status: updatedBooking.status } : booking));
            toast({ title: "Success", description: `Booking status updated to ${status}.` });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        } finally {
            setIsUpdating(null);
        }
    };
    
    const SkeletonRows = () => (
        Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
                <CardDescription>View and manage all user bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Tour</TableHead>
                            <TableHead>Booking Date</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <SkeletonRows /> : bookings.length > 0 ? (
                            bookings.map(booking => (
                                <TableRow key={booking._id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.userId?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{booking.userId?.email || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>{booking.tourId?.title || 'Deleted Tour'}</TableCell>
                                    <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                                    <TableCell>{booking.guests}</TableCell>
                                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn({
                                            "text-amber-600 border-amber-600": booking.status === 'pending',
                                            "text-green-600 border-green-600": booking.status === 'confirmed' || booking.status === 'completed',
                                            "text-red-600 border-red-600": booking.status === 'cancelled',
                                        })}>{booking.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === booking._id}>
                                                    {isUpdating === booking._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, 'confirmed')}>Mark as Confirmed</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, 'completed')}>Mark as Completed</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleUpdateStatus(booking._id, 'cancelled')}>Cancel Booking</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">No bookings found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
