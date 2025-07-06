
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface TourActionButtonsProps {
  tourId: string;
  tourTitle: string;
}

export function TourActionButtons({ tourId, tourTitle }: TourActionButtonsProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/wishlist', { cache: 'no-store' });
        
        if (response.status === 401) {
            setIsWishlisted(false);
            return;
        }
        
        if (response.ok) {
          const wishlist: { id: string }[] = await response.json();
          if (wishlist.some((item) => item.id === tourId)) {
            setIsWishlisted(true);
          } else {
            setIsWishlisted(false);
          }
        }
      } catch (error) {
        console.error("Could not fetch wishlist status", error);
        setIsWishlisted(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWishlistStatus();
  }, [tourId]);


  const handleShare = async () => {
    const shareData = {
      title: tourTitle,
      text: `Check out this amazing tour: ${tourTitle}`,
      url: window.location.origin + pathname,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: 'Link Copied!', description: 'Tour URL copied to your clipboard.' });
      }
    } catch (error) {
      console.error('Share failed', error);
      toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not share this tour.' });
    }
  };

  const handleWishlistToggle = async () => {
    setIsSubmitting(true);
    const method = isWishlisted ? 'DELETE' : 'POST';
    try {
        const response = await fetch('/api/user/wishlist', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tourId }),
        });

        if (response.status === 401) {
             toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to wishlist tours.' });
             return;
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Something went wrong');
        }
        
        setIsWishlisted(!isWishlisted);
        toast({
            title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
            description: tourTitle,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button variant="outline" size="icon" onClick={handleShare}>
        <Share2 className="h-5 w-5" />
        <span className="sr-only">Share</span>
      </Button>
      <Button variant="outline" size="icon" onClick={handleWishlistToggle} disabled={isLoading || isSubmitting}>
        {isLoading || isSubmitting ? (
             <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
            <Heart
            className={cn('h-5 w-5', {
                'fill-red-500 text-red-500': isWishlisted,
            })}
            />
        )}
        <span className="sr-only">Add to Wishlist</span>
      </Button>
    </div>
  );
}
