
"use client"

import Image from "next/image"
import Link from "next/link"
import { MoreHorizontal, Loader2, Check, X, Edit, Trash2, Ban } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PopulatedAdminTour {
    _id: string;
    title: string;
    price: number;
    approved: boolean;
    blocked: boolean;
    images: string[];
    createdBy: {
        _id: string;
        name: string;
    };
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<PopulatedAdminTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<PopulatedAdminTour[]>([]);
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
        setFilteredTours(data);
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({ variant: "destructive", title: "Error fetching tours", description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [toast]);

  const handleFilterChange = (status: string) => {
    if (status === 'all') {
      setFilteredTours(tours);
    } else if (status === 'approved') {
      setFilteredTours(tours.filter(t => t.approved && !t.blocked));
    } else if (status === 'pending') {
      setFilteredTours(tours.filter(t => !t.approved && !t.blocked));
    } else if (status === 'blocked') {
        setFilteredTours(tours.filter(t => t.blocked));
    }
  };

  const handleApproval = async (tourId: string, approved: boolean) => {
    setIsUpdating(tourId);
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!response.ok) throw new Error('Failed to update tour');
      
      const updatedTour = await response.json();
      const updatedTours = tours.map(t => t._id === tourId ? { ...t, approved: updatedTour.approved } : t);
      setTours(updatedTours);
      handleFilterChange(document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('data-value') || 'all');
      toast({ title: "Success", description: `Tour has been ${approved ? 'approved' : 'un-approved'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update tour status." });
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handleBlock = async (tourId: string, blocked: boolean) => {
    setIsUpdating(tourId);
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked }),
      });
      if (!response.ok) throw new Error('Failed to update tour');
      
      const updatedTour = await response.json();
      const updatedTours = tours.map(t => t._id === tourId ? { ...t, blocked: updatedTour.blocked } : t);
      setTours(updatedTours);
      handleFilterChange(document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('data-value') || 'all');
      toast({ title: "Success", description: `Tour has been ${blocked ? 'blocked' : 'un-blocked'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update tour status." });
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
        const response = await fetch(`/api/tours/${tourToDelete._id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete tour');
        
        const remainingTours = tours.filter(t => t._id !== tourToDelete._id);
        setTours(remainingTours);
        setFilteredTours(remainingTours);
        toast({ title: "Success", description: "Tour deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete tour." });
    } finally {
        setIsUpdating(null);
        setIsAlertOpen(false);
        setTourToDelete(null);
    }
  }

  const TourListSkeleton = () => (
      Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-16 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
      ))
  );

  return (
    <>
    <Card>
        <Tabs defaultValue="all" onValueChange={handleFilterChange}>
            <CardHeader>
                <CardTitle>Tour Management</CardTitle>
                <CardDescription>Approve, reject, and manage all tours on the platform.</CardDescription>
                <TabsList className="grid w-full grid-cols-4 mt-4 max-w-md">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="blocked">Blocked</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TourListSkeleton /> : filteredTours.length > 0 ? (
                        filteredTours.map(tour => (
                            <TableRow key={tour._id}>
                            <TableCell>
                                <Image alt={tour.title} className="aspect-square rounded-md object-cover" height="64" src={tour.images[0] || "https://placehold.co/64x64.png"} width="64" data-ai-hint="tour destination" />
                            </TableCell>
                            <TableCell className="font-medium">{tour.title}</TableCell>
                            <TableCell>{tour.createdBy?.name || 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={tour.blocked ? "destructive" : tour.approved ? "default" : "secondary"} className={cn({"bg-red-500": tour.blocked, "bg-green-500": tour.approved && !tour.blocked, "bg-amber-500": !tour.approved && !tour.blocked})}>
                                     {tour.blocked ? "Blocked" : tour.approved ? "Approved" : "Pending"}
                                </Badge>
                            </TableCell>
                            <TableCell>${tour.price}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === tour._id}>
                                            {isUpdating === tour._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/admin/tours/${tour._id}/edit`} className="cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        {!tour.blocked && (
                                            <DropdownMenuItem onClick={() => handleApproval(tour._id, !tour.approved)} className="cursor-pointer">
                                                {tour.approved ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                                {tour.approved ? 'Un-approve' : 'Approve'}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleBlock(tour._id, !tour.blocked)} className="cursor-pointer">
                                            {tour.blocked ? <Check className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                            {tour.blocked ? 'Unblock' : 'Block'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => openDeleteDialog(tour)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">No tours found for this filter.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Tabs>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the tour "{tourToDelete?.title}".</AlertDialogDescription>
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
