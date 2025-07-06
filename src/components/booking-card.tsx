
"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/context/currency-context";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

interface BookingCardProps {
    price: number;
    tourId: string;
    currencyCode: string;
}

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function BookingCard({ price, tourId, currencyCode }: BookingCardProps) {
    const { formatCurrency } = useCurrency();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>();
    const [guests, setGuests] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setDate(new Date());
    }, []);

    if (!paypalClientId) {
        return (
             <Card className="sticky top-24">
                <CardHeader><CardTitle>Booking Unavailable</CardTitle></CardHeader>
                <CardContent><p className="text-destructive">PayPal is not configured. Please contact support.</p></CardContent>
             </Card>
        )
    }
    
    const createOrder = async (): Promise<string> => {
        if (!date) {
            toast({ variant: "destructive", title: "Invalid Date", description: "Please select a date." });
            throw new Error("Date not selected");
        }
        setIsProcessing(true);
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tourId, guests }),
            });
            const order = await response.json();
            if (!response.ok) throw new Error(order.message || 'Failed to create order.');
            return order.id;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast({ variant: "destructive", title: "Error", description: `Could not initiate PayPal transaction: ${message}` });
            setIsProcessing(false);
            throw error;
        }
    };

    const onApprove = async (data: any): Promise<void> => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: data.orderID,
                    tourId: tourId,
                    bookingDate: date?.toISOString(),
                    guests: guests
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to capture payment.');

            toast({ title: "Success!", description: "Your booking is confirmed." });
            window.location.href = `/payment/success?orderId=${data.orderID}`;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast({ variant: "destructive", title: "Error", description: `Payment capture failed: ${message}` });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const onError = (err: any) => {
        toast({ variant: "destructive", title: "PayPal Error", description: "An error occurred with the PayPal transaction. Please try again."});
        console.error("PayPal Error:", err);
        setIsProcessing(false);
    };

    return (
        <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: currencyCode }}>
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
                    {isProcessing && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    <div style={{ display: isProcessing ? 'none' : 'block', width: '100%' }}>
                        <PayPalButtons 
                            style={{ layout: "vertical", label: 'buynow' }} 
                            createOrder={createOrder} 
                            onApprove={onApprove}
                            onError={onError}
                            disabled={!date || guests < 1}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
                </CardFooter>
            </Card>
        </PayPalScriptProvider>
    );
}
