
"use client"

import { MoreHorizontal, Loader2, Trash2, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface PopulatedReview {
    _id: string;
    userId: { name: string; };
    tourId: { title: string; };
    rating: number;
    comment: string;
    createdAt: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<PopulatedReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/reviews');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch reviews");
            }
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchReviews();
    }, [toast]);


    const handleDelete = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete review");
            }
            toast({ title: "Success", description: "Review has been deleted." });
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Deletion Failed", description: errorMessage });
        }
    };
    
    const SkeletonRows = () => (
        Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))
    );

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
            ))}
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Moderate Reviews</CardTitle>
                <CardDescription>View and manage all user-submitted reviews.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Tour</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <SkeletonRows /> : reviews.length > 0 ? (
                            reviews.map(review => (
                                <TableRow key={review._id}>
                                    <TableCell>{review.userId?.name || 'N/A'}</TableCell>
                                    <TableCell>{review.tourId?.title || 'Deleted Tour'}</TableCell>
                                    <TableCell><StarRating rating={review.rating} /></TableCell>
                                    <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                                    <TableCell>{format(new Date(review.createdAt), "PPP")}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the review.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(review._id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No reviews found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
