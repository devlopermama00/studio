
"use client"

import Image from "next/image"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface PopulatedAdminTour {
    _id: string;
    title: string;
    price: number;
    approved: boolean;
    images: string[];
    createdBy: {
        _id: string;
        name: string;
    };
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<PopulatedAdminTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<PopulatedAdminTour | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tours');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch tours");
        }
        const data = await response.json();
        setTours(data);
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({
            variant: "destructive",
            title: "Error fetching tours",
            description: errorMessage,
          })
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [toast]);

  const handleApprove = async (tourId: string) => {
    setIsUpdating(tourId);
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve tour');
      }
      const updatedTour = await response.json();
      setTours(tours.map(t => t._id === tourId ? { ...t, approved: updatedTour.approved } : t));
      toast({ title: "Success", description: "Tour approved successfully." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Approval Failed", description: errorMessage });
    } finally {
      setIsUpdating(null);
    }
  };

  const openDeleteDialog = (tour: PopulatedAdminTour) => {
    setTourToDelete(tour);
    setIsAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!tourToDelete) return;
    setIsUpdating(tourToDelete._id);
    try {
        const response = await fetch(`/api/tours/${tourToDelete._id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete tour');
        }
        setTours(tours.filter(t => t._id !== tourToDelete._id));
        toast({ title: "Success", description: "Tour deleted successfully." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Deletion Failed", description: errorMessage });
    } finally {
        setIsUpdating(null);
        setIsAlertOpen(false);
        setTourToDelete(null);
    }
  }


  const TourListSkeleton = () => (
      Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
      ))
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Tour Management</CardTitle>
        <CardDescription>
          Approve, reject, and manage all tours on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TourListSkeleton /> : tours.length > 0 ? (
                tours.map(tour => (
                    <TableRow key={tour._id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={tour.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={tour.images[0] || "https://placehold.co/64x64.png"}
                        width="64"
                        data-ai-hint="tour destination"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tour.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{tour.createdBy?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={tour.approved ? "default" : "secondary"} className={cn({"bg-green-500": tour.approved, "bg-amber-500": !tour.approved})}>
                        {isUpdating === tour._id ? <Loader2 className="h-3 w-3 animate-spin" /> : (tour.approved ? "Approved" : "Approved")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${tour.price}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === tour._id}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {!tour.approved && <DropdownMenuItem onClick={() => handleApprove(tour._id)}>Approve</DropdownMenuItem>}
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(tour)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No tours found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{tours.length}</strong> of <strong>{tours.length}</strong> tours
        </div>
      </CardFooter>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the tour
                "{tourToDelete?.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isUpdating === tourToDelete?._id}>
                {isUpdating === tourToDelete?._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
