
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Minus, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import type { Tour } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingCardProps {
  tour: Tour;
}

export function BookingCard({ tour }: BookingCardProps) {
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const totalPrice = tour.price * numberOfGuests;

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (!bookingDate) {
        toast({ variant: "destructive", title: "Please select a date." });
        return;
      }
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          numberOfGuests,
          bookingDate,
        }),
      });

      if(response.status === 401) {
          toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to book a tour.' });
          window.location.href = '/login';
          return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js has not loaded yet.");
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: 'destructive', title: 'Booking Failed', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {formatCurrency(totalPrice)}
        </CardTitle>
        <CardDescription>Total for {numberOfGuests} guest(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !bookingDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={bookingDate}
                onSelect={setBookingDate}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
           <label className="text-sm font-medium">Guests</label>
           <div className="flex items-center justify-between border rounded-md p-2 mt-1">
                <Button variant="ghost" size="icon" onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="font-semibold text-lg">{numberOfGuests}</span>
                <Button variant="ghost" size="icon" onClick={() => setNumberOfGuests(Math.min(tour.groupSize, numberOfGuests + 1))}><Plus className="h-4 w-4" /></Button>
           </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full text-lg" onClick={handleBookNow} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
