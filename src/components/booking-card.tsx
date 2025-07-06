

"use client";

import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface BookingCardProps {
    price: number;
}

export function BookingCard({ price }: BookingCardProps) {
    const { currency, formatCurrency } = useCurrency();

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
                    <Input id="date" type="date" />
                </div>
                <div>
                    <Label htmlFor="guests">Number of guests</Label>
                    <Input id="guests" type="number" min="1" defaultValue="1" />
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch">
                <Button size="lg" className="w-full">Book Now</Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
            </CardFooter>
        </Card>
    )
}
