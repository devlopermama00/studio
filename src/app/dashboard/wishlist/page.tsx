
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TourCard } from "@/components/tour-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tour } from "@/lib/types";

const CardSkeleton = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Skeleton className="h-56 w-full rounded-t-lg rounded-b-none" />
        <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="p-4 pt-0 border-t flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
        </div>
    </div>
);

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<Tour[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/wishlist');
                if (response.ok) {
                    const data = await response.json();
                    setWishlist(data);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWishlist();
    }, []);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="text-primary"/>
                    My Wishlist
                </CardTitle>
                <CardDescription>Tours you've saved for later. Plan your next adventure!</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((tour: Tour) => (
                           <TourCard key={tour.id} tour={tour} />
                        ))}
                    </div>
                ) : (
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Your Wishlist is Empty</AlertTitle>
                        <AlertDescription>
                            You haven't added any tours to your wishlist yet. Start exploring and save your favorites!
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
