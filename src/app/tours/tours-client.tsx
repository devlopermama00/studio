
"use client";

import { useState, useEffect, useCallback } from "react";
import { TourCard } from "@/components/tour-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { getPublicTours } from "@/lib/tours-data";
import type { Tour } from "@/lib/types";
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

interface ToursClientProps {
  initialTours: Tour[];
}

export function ToursClient({ initialTours }: ToursClientProps) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [currentPage, setCurrentPage] = useState(1);
  const socket = useSocket();

  const fetchTours = useCallback(async () => {
    const allTours = await getPublicTours();
    setTours(allTours);
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('tour_updated', fetchTours);
    socket.on('tour_deleted', fetchTours);

    return () => {
        socket.off('tour_updated', fetchTours);
        socket.off('tour_deleted', fetchTours);
    };
  }, [socket, fetchTours]);

  useEffect(() => {
    const totalPages = Math.ceil(tours.length / TOURS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [tours, currentPage]);

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
  
    if (paginatedTours.length === 0) {
        return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Tours Found</AlertTitle>
                <AlertDescription>
                    There are currently no approved tours available. Please check back later!
                </AlertDescription>
            </Alert>
        )
    }

  return (
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
  );
}
