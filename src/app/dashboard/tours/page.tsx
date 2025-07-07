
"use client"

import Image from "next/image"
import Link from "next/link"
import { PlusCircle, Edit, ShieldAlert } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface PopulatedTour {
    _id: string;
    title: string;
    price: number;
    approved: boolean;
    blocked: boolean;
    images: string[];
    category: {
        _id: string;
        name: string;
    }
}

interface AuthUser {
    isVerified: boolean;
}

export default function ProviderToursPage() {
  const [tours, setTours] = useState<PopulatedTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<PopulatedTour[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [toursResponse, userResponse] = await Promise.all([
          fetch('/api/tours'),
          fetch('/api/auth/me')
        ]);

        if (!toursResponse.ok) {
          const errorData = await toursResponse.json();
          throw new Error(errorData.message || "Failed to fetch tours");
        }
        const toursData = await toursResponse.json();
        setTours(toursData);
        setFilteredTours(toursData);
        
        if (!userResponse.ok) {
            throw new Error("Failed to fetch user status");
        }
        const userData = await userResponse.json();
        setUser(userData);

      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          })
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  const handleFilterChange = (status: string) => {
    if (status === 'all') {
      setFilteredTours(tours);
    } else if (status === 'active') {
      setFilteredTours(tours.filter(t => t.approved && !t.blocked));
    } else if (status === 'requested') {
      setFilteredTours(tours.filter(t => !t.approved && !t.blocked));
    } else if (status === 'blocked') {
      setFilteredTours(tours.filter(t => t.blocked));
    }
  };

  const getStatus = (tour: PopulatedTour) => {
    if (tour.blocked) {
      return { text: "Blocked", className: "bg-red-500 hover:bg-red-500" };
    }
    if (tour.approved) {
      return { text: "Active", className: "bg-green-500 hover:bg-green-500" };
    }
    return { text: "Requested", className: "bg-amber-500 hover:bg-amber-500" };
  };
  
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
                <Skeleton className="h-6 w-20" />
            </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-12" />
            </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-12" />
            </TableCell>
            <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
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
            <Button asChild size="sm" className="gap-1" disabled={isLoading || !user?.isVerified}>
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
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="mb-4">
          <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="requested">Requested</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {!isLoading && user && !user.isVerified && (
            <Alert variant="destructive" className="mb-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Account Pending Approval</AlertTitle>
                <AlertDescription>
                    Your account is pending review by an admin. You cannot add new tours until your documents are approved. Check your status on the Verification page.
                </AlertDescription>
            </Alert>
        )}

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
            {isLoading ? <TourListSkeleton /> : filteredTours.length > 0 ? (
              filteredTours.map(tour => {
                const status = getStatus(tour);
                return (
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
                  <TableCell className="font-medium">
                    <Link href={`/tours/${tour._id}`} className="hover:underline" target="_blank">
                      {tour.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tour.approved ? "default" : "secondary"} className={cn(status.className)}>
                      {status.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">${tour.price}</TableCell>
                  <TableCell className="hidden md:table-cell">N/A</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="icon" disabled={tour.blocked}>
                        <Link href={`/dashboard/tours/${tour._id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
                )
              })
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        You haven't created any tours for this filter.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredTours.length}</strong> of <strong>{tours.length}</strong> tours
        </div>
      </CardFooter>
    </Card>
  )
}
