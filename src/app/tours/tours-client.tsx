
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import { TourCard } from "@/components/tour-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import type { Tour } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { slugify } from "@/lib/utils";

const TOURS_PER_PAGE = 16;

interface ToursClientProps {
  initialTours: Tour[];
}

export function ToursClient({ initialTours }: ToursClientProps) {
  const [filteredTours, setFilteredTours] = useState<Tour[]>(initialTours);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('query')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';

    const filtered = initialTours.filter(tour => {
        const queryMatch = query ? 
            tour.title.toLowerCase().includes(query) || 
            tour.city.toLowerCase().includes(query) || 
            tour.country.toLowerCase().includes(query) ||
            tour.place.toLowerCase().includes(query)
            : true;
        
        const categoryMatch = category ? slugify(tour.category) === category : true;
        
        return queryMatch && categoryMatch;
    });

    setFilteredTours(filtered);
    setCurrentPage(1);
  }, [searchParams, initialTours]);

  const paginatedTours = useMemo(() => {
      return filteredTours.slice(
        (currentPage - 1) * TOURS_PER_PAGE,
        currentPage * TOURS_PER_PAGE
      );
  }, [filteredTours, currentPage]);

  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE);

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
  
    if (filteredTours.length === 0) {
        return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Tours Found</AlertTitle>
                <AlertDescription>
                    Try adjusting your search filters or check back later!
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
