
"use client"

import Image from "next/image"
import Link from "next/link"
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface PopulatedTour {
    _id: string;
    title: string;
    price: number;
    approved: boolean;
    images: string[];
    category: {
        _id: string;
        name: string;
    }
}

export default function ProviderToursPage() {
  const [tours, setTours] = useState<PopulatedTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  
  const TourListSkeleton = () => (
      Array.from({ length: 3 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5 w-48" />
            </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
            </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-12" />
            </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-12" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
      ))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>My Tours</CardTitle>
                <CardDescription>
                Manage your tours and view their performance.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="gap-1">
              <Link href="/dashboard/tours/add">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Tour
                </span>
              </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">
                Rating
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      src={tour.images[0] || 'https://placehold.co/64x64.png'}
                      width="64"
                      data-ai-hint="tour destination"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tour.title}</TableCell>
                  <TableCell>
                    <Badge variant={tour.approved ? "default" : "secondary"} className={cn({"bg-green-500": tour.approved, "bg-amber-500": !tour.approved})}>
                      {tour.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">${tour.price}</TableCell>
                  <TableCell className="hidden md:table-cell">N/A</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="icon">
                        <Link href={`/dashboard/tours/${tour._id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        You haven't created any tours yet.
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
  )
}
