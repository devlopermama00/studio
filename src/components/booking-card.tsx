"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/context/currency-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface BookingCardProps {
    price: number;
    tourId: string;
    currencyCode: string;
}

export function BookingCard({ price, tourId, currencyCode }: BookingCardProps) {
    const { formatCurrency } = useCurrency();
    const [date, setDate] = useState<Date | undefined>();
    const [guests, setGuests] = useState<number>(1);

    useEffect(() => {
        setDate(new Date());
    }, []);

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
                <Button disabled size="lg">Booking Unavailable</Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
            </CardFooter>
        </Card>
    );
}
