
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Compass, Lock, Smile, Ticket, Mail, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPublicTours } from "@/lib/tours-data";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";

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
  { name: "Tbilisi", image: "https://placehold.co/400x500.png", hint: "tbilisi georgia" },
  { name: "Batumi", image: "https://placehold.co/400x500.png", hint: "batumi georgia" },
  { name: "Gudauri", image: "https://placehold.co/400x500.png", hint: "gudauri georgia" },
  { name: "Kakheti", image: "https://placehold.co/400x500.png", hint: "kakheti georgia" },
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

        {/* 3. How It Works Section */}
        <section className="py-16 md:py-24 bg-secondary">
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

        {/* 4. Explore by Destination Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">Explore by Destination</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                        From the vibrant capital to the serene mountains, find tours in your favorite part of Georgia.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {destinations.map((dest) => (
                        <Link href="/tours" key={dest.name} className="group relative block overflow-hidden rounded-lg">
                            <Image src={dest.image} alt={dest.name} width={400} height={500} data-ai-hint={dest.hint} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 md:p-6">
                                <h3 className="text-white text-xl md:text-2xl font-bold font-headline">{dest.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        
        {/* 5. Offers Section */}
        <section className="py-16 md:py-24">
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

        {/* 6. Newsletter Section */}
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
