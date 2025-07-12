
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Ticket, Hash } from "lucide-react";
import { useCurrency } from "@/context/currency-context";

interface Booking {
  _id: string;
  tourId: {
    _id: string;
    title: string;
    images: string[];
    city: string;
  };
  bookingDate: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
}

const BookingCardSkeleton = () => (
    <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter>
             <Skeleton className="h-10 w-24" />
        </CardFooter>
    </Card>
);

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch('/api/bookings');
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                } else {
                    console.error("Failed to fetch bookings");
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    return (
        <div className="space-y-6">
            <CardHeader className="px-0">
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View your upcoming and past tour bookings.</CardDescription>
            </CardHeader>
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)}
                </div>
            ) : bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="flex flex-col">
                            <Image
                                src={booking.tourId.images[0] || 'https://placehold.co/400x300.png'}
                                alt={booking.tourId.title}
                                width={400}
                                height={300}
                                className="w-full h-48 object-cover"
                            />
                            <CardHeader>
                                <CardTitle className="text-xl line-clamp-2">{booking.tourId.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground flex-1">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(booking.bookingDate), "PPP")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{booking.numberOfGuests} Guest(s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    <span>Booking ID: {booking._id.slice(-6)}</span>
                                </div>
                            </CardContent>
                             <CardFooter className="border-t pt-4">
                                <Button asChild size="sm">
                                    <Link href={`/tours/${booking.tourId._id}`}>View Tour</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Alert>
                    <Ticket className="h-4 w-4" />
                    <AlertTitle>No Bookings Found</AlertTitle>
                    <AlertDescription>
                        You haven't booked any tours yet. Start exploring and find your next adventure!
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

