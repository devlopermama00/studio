
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/lib/types";


const BookingListSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-9 w-24" /></TableCell>
        </TableRow>
    ))
);


export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/bookings');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch bookings");
                }
                const data = await response.json();
                setBookings(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error fetching bookings",
                    description: errorMessage,
                })
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [toast]);


  return (
    <Card>
        <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>A list of all your booked tours.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                    Booking Date
                    </TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? <BookingListSkeleton /> : bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <TableRow key={booking.id}>
                        <TableCell className="hidden sm:table-cell">
                            <Image
                            alt={booking.tourTitle}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={booking.tourImage}
                            width="64"
                            data-ai-hint="tour destination"
                            />
                        </TableCell>
                        <TableCell className="font-medium">{booking.tourTitle}</TableCell>
                        <TableCell>
                            <Badge
                            variant="outline"
                            className={cn({
                                "text-green-600 border-green-600": booking.status === "confirmed",
                                "text-blue-600 border-blue-600": booking.status === "completed",
                                "text-red-600 border-red-600": booking.status === "cancelled",
                                "text-amber-600 border-amber-600": booking.status === "pending",
                            })}
                            >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">${booking.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <Button size="sm" variant="outline">View Details</Button>
                        </TableCell>
                        </TableRow>
                    ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            You haven't booked any tours yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
