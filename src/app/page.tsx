import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Users, ShieldCheck, Award } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tours as mockTours } from "@/lib/mock-data";

export default function Home() {
  const featuredTours = mockTours.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="https://placehold.co/1600x900.png"
            alt="Scenic view of Georgia mountains"
            layout="fill"
            objectFit="cover"
            className="z-0"
            data-ai-hint="georgia mountains landscape"
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
              Discover Georgia's Hidden Gems
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              Unforgettable day tours and experiences curated by local experts. Your next adventure starts here.
            </p>
            <div className="max-w-4xl mx-auto">
              <TourSearchForm />
            </div>
          </div>
        </section>

        <section id="featured-tours" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-12">
              Featured Tours
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/tours">Explore All Tours <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">Why Choose TourVista?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                We are committed to providing you with the best travel experience in Georgia.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <Users className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-xl font-headline">Expert Local Guides</CardTitle>
                  <p className="text-muted-foreground">Passionate, knowledgeable guides who bring Georgian culture to life.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <Award className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-xl font-headline">Curated Experiences</CardTitle>
                  <p className="text-muted-foreground">Unique tours that you won't find anywhere else, tailored for you.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-xl font-headline">Secure & Easy Booking</CardTitle>
                  <p className="text-muted-foreground">Book your next adventure in minutes with our secure payment system.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <Star className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-xl font-headline">Top-Rated Service</CardTitle>
                  <p className="text-muted-foreground">Thousands of 5-star reviews from happy travelers across the globe.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready for an Adventure?</h2>
                <p className="text-lg mt-2 opacity-90">Become a tour provider and share the magic of Georgia with the world.</p>
              </div>
              <Button asChild variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register">Join as a Provider <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
