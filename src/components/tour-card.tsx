
"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tour } from "@/lib/types";
import { useCurrency } from "@/context/currency-context";

export function TourCard({ tour }: { tour: Tour }) {
  const { formatCurrency } = useCurrency();

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0 relative">
        <Link href={`/tours/${tour.id}`} className="block">
          <Image
            src={tour.images[0]}
            alt={tour.title}
            width={400}
            height={300}
            className="w-full h-56 object-cover"
            data-ai-hint="tour landscape"
          />
        </Link>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            {tour.originalPrice && (
                <Badge variant="destructive" className="text-base animate-pulse">DEAL</Badge>
            )}
            <Badge variant="secondary" className="text-base">
                {tour.originalPrice && (
                    <span className="line-through text-muted-foreground mr-2">{formatCurrency(tour.originalPrice)}</span>
                )}
                {formatCurrency(tour.price)}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 w-fit">{tour.category}</Badge>
        <CardTitle className="text-lg font-headline font-semibold mb-2">
          <Link href={`/tours/${tour.id}`} className="hover:text-primary transition-colors">
            {tour.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {tour.overview}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground border-t mt-auto">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{tour.city}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold">{tour.rating.toFixed(1)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
