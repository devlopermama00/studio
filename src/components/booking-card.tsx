
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface BookingCardProps {
    price: number;
    tourId: string;
    currencyCode: string;
    originalPrice?: number;
}

export function BookingCard({ price, tourId, currencyCode, originalPrice }: BookingCardProps) {
    const { formatCurrency } = useCurrency();
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [guests, setGuests] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleBooking = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tourId, bookingDate: date, guests })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Booking failed');
            }
            // Redirect to Stripe checkout page
            router.push(data.url);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Booking Error",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            });
            setIsLoading(false);
        }
    }


    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline text-2xl space-y-2">
                    {originalPrice ? (
                        <div className="flex items-baseline gap-2">
                            <span className="text-primary">{formatCurrency(price)}</span>
                            <span className="text-lg line-through text-muted-foreground">{formatCurrency(originalPrice)}</span>
                        </div>
                    ) : (
                        <span>From <span className="text-primary">{formatCurrency(price)}</span></span>
                    )}
                    <p className="text-lg font-normal text-muted-foreground">/ person</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label htmlFor="guests">Number of guests</Label>
                    <Input id="guests" type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch">
                <Button onClick={handleBooking} disabled={isLoading} size="lg">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Book Now"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
            </CardFooter>
        </Card>
    );
}
