
"use client";

import { useState, useEffect, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { getPublicTours } from "@/lib/tours-data";
import type { Tour } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSocket } from "@/lib/socket";

const TOURS_PER_PAGE = 16;

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const socket = useSocket();

  const fetchTours = useCallback(async () => {
    // We don't want to show the skeleton on refetches, only initial load.
    // So we only set isLoading to true if there are no tours yet.
    if (tours.length === 0) {
      setIsLoading(true);
    }
    const allTours = await getPublicTours();
    setTours(allTours);
    setIsLoading(false);
  }, [tours.length]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  useEffect(() => {
    if (!socket) return;
    
    // Refetch tours when an admin approves/updates or deletes a tour
    socket.on('tour_updated', fetchTours);
    socket.on('tour_deleted', fetchTours);

    return () => {
        socket.off('tour_updated', fetchTours);
        socket.off('tour_deleted', fetchTours);
    };
  }, [socket, fetchTours]);

  const totalPages = Math.ceil(tours.length / TOURS_PER_PAGE);
  const paginatedTours = tours.slice(
    (currentPage - 1) * TOURS_PER_PAGE,
    currentPage * TOURS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };
  
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
  
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage: number, endPage: number;
    if (totalPages <= 5) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 3) {
            startPage = 1;
            endPage = 5;
        } else if (currentPage + 2 >= totalPages) {
            startPage = totalPages - 4;
            endPage = totalPages;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    
    const showStartEllipsis = startPage > 1;
    const showEndEllipsis = endPage < totalPages;

    return (
      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {showStartEllipsis && (
             <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
            </PaginationItem>
          )}
          {showStartEllipsis && startPage > 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {showEndEllipsis && endPage < totalPages -1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
           {showEndEllipsis && (
             <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-headline font-bold mb-4 text-center">
              Explore Our Tours
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
              Find your next adventure in Georgia. Search by destination, category, or date.
            </p>
            <div className="max-w-4xl mx-auto">
              <TourSearchForm />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : paginatedTours.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedTours.map((tour, index) => (
                           <div 
                                key={tour.id} 
                                className="animate-fade-in opacity-0" 
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                            >
                                <TourCard tour={tour} />
                            </div>
                        ))}
                    </div>
                    <PaginationControls />
                </>
            ) : (
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Tours Found</AlertTitle>
                    <AlertDescription>
                        There are currently no approved tours available. Please check back later or ask a provider to add some!
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
