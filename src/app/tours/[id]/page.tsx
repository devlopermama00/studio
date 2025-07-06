import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Clock, Users, MessageSquare } from "lucide-react";
import type { Tour } from "@/lib/types";


async function getTourById(id: string): Promise<Tour | null> {
    const host = headers().get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    try {
        const res = await fetch(`${protocol}://${host}/api/public/tours/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}


export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
      { reviewCount > 0 && <span className="text-muted-foreground text-sm">{rating.toFixed(1)} ({reviewCount} reviews)</span> }
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Tour Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-headline font-bold mb-2">{tour.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-muted-foreground">
              <StarRating rating={tour.rating} reviewCount={tour.reviews.length} />
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {tour.location}</div>
              <div className="flex items-center gap-2"><Badge variant="outline">{tour.category}</Badge></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main Column */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden mb-8">
                {tour.images && tour.images.length > 0 ? (
                    <Carousel>
                        <CarouselContent>
                            {tour.images.map((src, index) => (
                            <CarouselItem key={index}>
                                <Image
                                src={src}
                                alt={`${tour.title} image ${index + 1}`}
                                width={800}
                                height={500}
                                className="w-full h-auto max-h-[500px] object-cover"
                                data-ai-hint="tour destination"
                                />
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                ) : (
                    <Image
                        src="https://placehold.co/800x500.png"
                        alt="Placeholder image"
                        width={800}
                        height={500}
                        className="w-full h-auto max-h-[500px] object-cover"
                        data-ai-hint="tour destination placeholder"
                    />
                )}
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-headline font-semibold mb-4">About this tour</h2>
                  <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
                  
                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /> <div><p className="font-semibold">Duration</p><p className="text-muted-foreground">{tour.duration}</p></div></div>
                    <div className="flex items-center gap-3"><Users className="w-5 h-5 text-primary" /> <div><p className="font-semibold">Group size</p><p className="text-muted-foreground">Up to 12 people</p></div></div>
                    <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-primary" /> <div><p className="font-semibold">Languages</p><p className="text-muted-foreground">English, Georgian</p></div></div>
                  </div>

                  <Separator className="my-6" />

                  <h2 className="text-2xl font-headline font-semibold mb-4">Itinerary</h2>
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {tour.itinerary.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="font-semibold">{item.title}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                {item.description}
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-muted-foreground">Itinerary details coming soon.</p>
                    )}
                  
                  <Separator className="my-6" />

                  <h2 className="text-2xl font-headline font-semibold mb-4">Reviews</h2>
                    {tour.reviews && tour.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {tour.reviews.map(review => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                <AvatarImage src={review.userImage} alt={review.userName} />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{review.userName}</p>
                                    <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                                </div>
                                <StarRating rating={review.rating} reviewCount={0} />
                                <p className="text-muted-foreground mt-2 text-sm">{review.comment}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
                    )}

                </CardContent>
              </Card>
            </div>

            {/* Right/Sticky Column */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    From <span className="text-primary">${tour.price}</span> / person
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="guests">Number of guests</Label>
                    <Input id="guests" type="number" min="1" defaultValue="1" />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch">
                  <Button size="lg" className="w-full">Book Now</Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">Free cancellation up to 24 hours before</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
