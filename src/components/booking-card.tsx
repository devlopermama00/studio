
"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BookingCardProps {
    price: number;
    tourId: string;
}

export function BookingCard({ price, tourId }: BookingCardProps) {
    const { formatCurrency } = useCurrency();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>();
    const [guests, setGuests] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Set the initial date only on the client side after mounting
        // to prevent hydration mismatch.
        setDate(new Date());
    }, []);

    const handleBooking = async () => {
        if (!date) {
            toast({
                variant: "destructive",
                title: "Invalid Date",
                description: "Please select a date for the tour.",
            });
            return;
        }

        if (guests < 1) {
            toast({
                variant: "destructive",
                title: "Invalid Guests",
                description: "You must book for at least one guest.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId,
                    bookingDate: date.toISOString(),
                    guests,
                }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create checkout session.");
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: errorMessage,
            });
            setIsLoading(false);
        }
    };

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">
                    From <span className="text-primary">{formatCurrency(price)}</span> / person
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label htmlFor="guests">Number of guests</Label>
                    <Input 
                        id="guests" 
                        type="number" 
                        min="1" 
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch">
                <Button size="lg" className="w-full" onClick={handleBooking} disabled={isLoading || !date}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Book Now
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
            </CardFooter>
        </Card>
    );
}
