
"use client"

import { MoreHorizontal, Loader2, Check, X, ShieldQuestion } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PopulatedBooking {
    _id: string;
    userId: { name: string; email: string };
    tourId: { title: string; };
    bookingDate: string;
    guests: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'cancellation-requested';
    createdAt: string;
    cancellationDetails?: {
        refundEligible?: boolean;
    }
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<PopulatedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

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
            setFilteredBookings(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchBookings();
    }, [toast]);
    
     const handleFilterChange = (status: string) => {
        if (status === 'all') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(b => b.status === status));
        }
    };


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
            // Refetch all bookings to get the latest state
            await fetchBookings();
            toast({ title: "Success", description: `Booking status updated.` });
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

    const renderStatusBadge = (booking: PopulatedBooking) => {
        const statusConfig = {
            'pending': { label: 'Pending', className: 'text-amber-600 border-amber-600' },
            'confirmed': { label: 'Confirmed', className: 'text-blue-600 border-blue-600' },
            'completed': { label: 'Completed', className: 'text-green-600 border-green-600' },
            'cancelled': { label: 'Cancelled', className: 'text-red-600 border-red-600' },
            'cancellation-requested': { label: 'Cancellation Requested', className: 'text-purple-600 border-purple-600' },
        };
        const config = statusConfig[booking.status] || { label: 'Unknown', className: '' };
        return <Badge variant="outline" className={cn(config.className)}>{config.label}</Badge>;
    };

    const renderBookingTable = (bookingsToRender: PopulatedBooking[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? <SkeletonRows /> : bookingsToRender.length > 0 ? (
                    bookingsToRender.map(booking => (
                        <TableRow key={booking._id}>
                            <TableCell>
                                <div className="font-medium">{booking.userId?.name || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{booking.userId?.email || 'N/A'}</div>
                            </TableCell>
                            <TableCell>{booking.tourId?.title || 'Deleted Tour'}</TableCell>
                            <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                            <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                            <TableCell>{renderStatusBadge(booking)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === booking._id}>
                                            {isUpdating === booking._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        {booking.status !== 'confirmed' && <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, 'confirmed')}>Mark as Confirmed</DropdownMenuItem>}
                                        {booking.status !== 'completed' && <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, 'completed')}>Mark as Completed</DropdownMenuItem>}
                                        
                                        {booking.status === 'cancellation-requested' && (
                                            <>
                                                <DropdownMenuItem className="text-green-600" onClick={() => handleUpdateStatus(booking._id, 'cancelled')}>Approve Cancellation {booking.cancellationDetails?.refundEligible && '(Refund)'}</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleUpdateStatus(booking._id, 'confirmed')}>Reject Cancellation</DropdownMenuItem>
                                            </>
                                        )}

                                        {booking.status !== 'cancelled' && booking.status !== 'cancellation-requested' && (
                                            <DropdownMenuItem className="text-red-500" onClick={() => handleUpdateStatus(booking._id, 'cancelled')}>Cancel Booking</DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No bookings found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
                <CardDescription>View and manage all user bookings and cancellations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="all" onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                        <TabsTrigger value="cancellation-requested" className="text-purple-600">
                           Cancellation Requests
                        </TabsTrigger>
                         <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">{renderBookingTable(filteredBookings)}</TabsContent>
                    <TabsContent value="confirmed">{renderBookingTable(filteredBookings)}</TabsContent>
                    <TabsContent value="cancellation-requested">{renderBookingTable(filteredBookings)}</TabsContent>
                    <TabsContent value="cancelled">{renderBookingTable(filteredBookings)}</TabsContent>
                    <TabsContent value="completed">{renderBookingTable(filteredBookings)}</TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
