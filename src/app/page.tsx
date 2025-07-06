

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Compass, Lock, Smile, Ticket, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPublicTours } from "@/lib/tours-data";
import { Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const howItWorksSteps = [
  {
    icon: Compass,
    title: "Find Your Perfect Tour",
    description: "Browse our curated selection of tours or use the search to find exactly what you're looking for.",
  },
  {
    icon: Lock,
    title: "Book Securely Online",
    description: "Our booking process is simple, fast, and uses a secure payment system to protect your data.",
  },
  {
    icon: Smile,
    title: "Enjoy with a Verified Guide",
    description: "Meet your expert local guide and embark on an unforgettable adventure in Georgia.",
  },
];

const destinations = [
  { name: "Tbilisi", image: "https://placehold.co/400x500.png", hint: "tbilisi georgia", activities: 125 },
  { name: "Batumi", image: "https://placehold.co/400x500.png", hint: "batumi georgia", activities: 88 },
  { name: "Gudauri", image: "https://placehold.co/400x500.png", hint: "gudauri georgia", activities: 42 },
  { name: "Kakheti", image: "https://placehold.co/400x500.png", hint: "kakheti georgia", activities: 95 },
  { name: "Kazbegi", image: "https://placehold.co/400x500.png", hint: "kazbegi mountains", activities: 30 },
  { name: "Svaneti", image: "https://placehold.co/400x500.png", hint: "svaneti landscape", activities: 15 },
  { name: "Mtskheta", image: "https://placehold.co/400x500.png", hint: "mtskheta georgia", activities: 25 },
  { name: "Kutaisi", image: "https://placehold.co/400x500.png", hint: "kutaisi georgia", activities: 50 },
];

const categories = [
    {
        name: "City Tours",
        image: "https://placehold.co/400x500.png",
        hint: "tbilisi street",
        href: "/tours?category=city"
    },
    {
        name: "Mountain & Hiking",
        image: "https://placehold.co/400x500.png",
        hint: "caucasus mountains",
        href: "/tours?category=hiking"
    },
    {
        name: "Wine & Gastronomy",
        image: "https://placehold.co/400x500.png",
        hint: "georgian wine",
        href: "/tours?category=wine"
    },
    {
        name: "Historical & Cultural",
        image: "https://placehold.co/400x500.png",
        hint: "ancient monastery",
        href: "/tours?category=historical"
    },
    {
        name: "Multi-Day Tours",
        image: "https://placehold.co/400x500.png",
        hint: "georgia road trip",
        href: "/tours?category=multi-day"
    },
    {
        name: "Adventure & Extreme",
        image: "https://placehold.co/400x500.png",
        hint: "paragliding georgia",
        href: "/tours?category=adventure"
    },
];

export default async function Home() {
  const featuredTours = await getPublicTours(8);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="https://placehold.co/1600x900.png"
            alt="Scenic view of Georgia mountains"
            fill
            style={{objectFit: "cover"}}
            className="z-0"
            data-ai-hint="georgia mountains landscape"
            priority
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
              Explore Georgia’s Best Day Tours
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              Book trusted experiences with verified guides.
            </p>
            <div className="max-w-4xl mx-auto">
              <TourSearchForm />
            </div>
          </div>
        </section>

        {/* 2. Featured Tours Section */}
        <section id="featured-tours" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-2">
              Featured & Popular Tours
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-12">
                Discover our most sought-after tours, handpicked for an unforgettable experience.
            </p>
             {featuredTours.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredTours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                    </div>
                    <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/tours">Explore All Tours <ArrowRight className="ml-2" /></Link>
                    </Button>
                    </div>
                </>
            ) : (
                 <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Featured Tours Yet</AlertTitle>
                    <AlertDescription>
                        We're busy curating the best experiences for you. Check back soon for our featured tours!
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </section>

        {/* 3. Browse by Category Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-2">
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-12">
              Find the type of adventure that suits you best.
            </p>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {categories.map((category) => (
                  <CarouselItem key={category.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link href={category.href} className="group relative block aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={category.hint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-white text-xl font-bold font-headline">{category.name}</h3>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex left-2 bg-background/50 hover:bg-background/80" />
              <CarouselNext className="hidden md:flex right-2 bg-background/50 hover:bg-background/80" />
            </Carousel>
          </div>
        </section>
        
        {/* 4. How It Works Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                Booking your Georgian adventure is as easy as 1-2-3.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorksSteps.map((step, index) => (
                <Card key={index} className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <step.icon className="w-8 h-8" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl font-headline">{step.title}</CardTitle>
                        <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Explore by Destination Section */}
        <section className="py-16 md:py-24 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">Explore by Destination</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                        From the vibrant capital to the serene mountains, find tours in your favorite part of Georgia.
                    </p>
                </div>
                 <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="-ml-4">
                        {destinations.map((dest, index) => (
                            <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <Link href="/tours" className="group block overflow-hidden rounded-lg relative aspect-[4/5] shadow-lg">
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={dest.hint}
                                    />
                                    <div className="absolute top-3 left-3 right-3 text-white">
                                        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 mb-2 shadow-lg">
                                            <h3 className="font-bold text-lg truncate">{`${index + 1}. ${dest.name}`}</h3>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm text-gray-900 rounded-md px-3 py-1 inline-block shadow">
                                            <p className="text-sm font-semibold">{`${dest.activities} activities`}</p>
                                        </div>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex left-2 bg-background/50 hover:bg-background/80" />
                    <CarouselNext className="hidden md:flex right-2 bg-background/50 hover:bg-background/80" />
                </Carousel>
            </div>
        </section>
        
        {/* 6. Offers Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="bg-accent text-accent-foreground rounded-lg p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
                <div className="flex items-center gap-6">
                    <Ticket className="w-16 h-16 hidden sm:block" />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-headline font-bold">Don't Miss Our Special Offers!</h2>
                        <p className="text-lg mt-2 opacity-90">Get up to 20% off on select tours this month. Your next adventure is waiting.</p>
                    </div>
                </div>
                <Button asChild variant="secondary" size="lg" className="bg-white text-accent hover:bg-white/90 flex-shrink-0">
                    <Link href="/deals">View Deals <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
          </div>
        </section>

        {/* 7. Newsletter Section */}
        <section className="py-16 md:py-24 bg-secondary">
            <div className="container mx-auto px-4 max-w-3xl text-center">
                 <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">Subscribe to Our Newsletter</h2>
                <p className="text-muted-foreground text-lg mb-8">
                    Get the latest news, updates, and special offers delivered directly to your inbox.
                </p>
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <Input type="email" placeholder="Enter your email address" className="h-12 text-base flex-1" />
                    <Button type="submit" size="lg" className="h-12">Subscribe</Button>
                </form>
            </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
