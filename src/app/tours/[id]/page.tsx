

import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Users, MessageSquare, Check, X, Languages, Globe, Plane, UserCheck, Shield } from "lucide-react";
import { getPublicTourById } from "@/lib/tours-data";
import { BookingCard } from "@/components/booking-card";
import { TourActionButtons } from "@/components/tour-action-buttons";


export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const tour = await getPublicTourById(params.id);

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

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-primary" /> <div><p className="font-semibold">{label}</p><p className="text-muted-foreground">{value}</p></div></div>
  );

  const ListItem = ({ children, icon: Icon }: { children: React.ReactNode, icon: React.ElementType }) => (
      <li className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
          <span>{children}</span>
      </li>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Tour Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h1 className="text-3xl md:text-5xl font-headline font-bold">{tour.title}</h1>
              <TourActionButtons tourId={tour.id} tourTitle={tour.title} />
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-4 gap-y-2 text-muted-foreground">
              <StarRating rating={tour.rating} reviewCount={tour.reviews.length} />
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {tour.place}, {tour.city}</div>
              <div className="flex items-center gap-2"><Badge variant="outline">{tour.category}</Badge></div>
              <div className="flex items-center gap-2"><Badge variant="outline" className="capitalize">{tour.tourType}</Badge></div>
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
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tour.overview}</p>
                  
                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <InfoItem icon={Clock} label="Duration" value={`${tour.durationInHours} hours`} />
                    <InfoItem icon={Users} label="Group size" value={`Up to ${tour.groupSize} people`} />
                    <InfoItem icon={Languages} label="Languages" value={tour.languages.join(', ')} />
                    <InfoItem icon={Globe} label="Tour Type" value={<span className="capitalize">{tour.tourType}</span>} />
                    <InfoItem icon={UserCheck} label="Provider" value={tour.providerName} />
                    <InfoItem icon={Plane} label="Country" value={tour.country} />
                  </div>

                  <Separator className="my-6" />
                  
                  {tour.highlights && tour.highlights.length > 0 && (
                      <>
                        <h2 className="text-2xl font-headline font-semibold mb-4">Highlights</h2>
                        <ul className="space-y-2 text-muted-foreground">
                            {tour.highlights.map((item, index) => (
                                <ListItem key={index} icon={Star}>{item}</ListItem>
                            ))}
                        </ul>
                        <Separator className="my-6" />
                      </>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    {tour.inclusions && tour.inclusions.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-4">What's Included</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                {tour.inclusions.map((item, index) => (
                                    <ListItem key={index} icon={Check}>{item}</ListItem>
                                ))}
                            </ul>
                        </div>
                    )}
                     {tour.exclusions && tour.exclusions.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-4">What's Not Included</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                {tour.exclusions.map((item, index) => (
                                    <ListItem key={index} icon={X}>{item}</ListItem>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                  
                  {tour.itinerary && tour.itinerary.length > 0 && (
                    <>
                        <Separator className="my-6" />
                        <h2 className="text-2xl font-headline font-semibold mb-4">Itinerary</h2>
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
                    </>
                  )}

                  {tour.importantInformation && (
                    <>
                        <Separator className="my-6" />
                        <h2 className="text-2xl font-headline font-semibold mb-4">Important Information</h2>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary">
                            <Shield className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <p className="text-muted-foreground whitespace-pre-wrap">{tour.importantInformation}</p>
                        </div>
                    </>
                  )}
                  
                  <Separator className="my-6" />

                  <h2 className="text-2xl font-headline font-semibold mb-4">Reviews</h2>
                    {tour.reviews && tour.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {tour.reviews.map(review => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                <AvatarImage src={review.userImage} alt={review.userName} />
                                <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
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
              <BookingCard price={tour.price} tourId={tour.id} currencyCode={tour.currency} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
