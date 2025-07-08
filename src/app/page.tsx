
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ticket, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPopularTours } from "@/lib/tours-data";
import { Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getSettings } from "@/lib/settings-data";
import { slugify } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const popularTours = await getPopularTours(8);
  const settings = await getSettings();

  const heroImage = settings.homepage_hero_image || "https://placehold.co/1600x900.png";
  const heroIsVideo = heroImage && (heroImage.endsWith('.mp4') || heroImage.endsWith('.webm'));
  const heroTitle = settings.homepage_hero_title || "Explore Georgia’s Best Day Tours";
  const heroSubtitle = settings.homepage_hero_subtitle || "Book trusted experiences with verified guides.";

  const popularToursTitle = settings.homepage_popular_tours_title || "Popular Tours";
  const popularToursDescription = settings.homepage_popular_tours_description || "Discover our most sought-after tours, handpicked for an unforgettable experience.";

  const categoriesTitle = settings.homepage_categories_title || "Browse by Category";
  const categoriesDescription = settings.homepage_categories_description || "Find the type of adventure that suits you best.";
  const categoryConfig = settings.homepage_category_config || {};

  const discoverTitle = settings.homepage_discover_title || "Discover The World of Georgia With Us!";
  const discoverDescription = settings.homepage_discover_description || "Discover amazing places at exclusive deals Only with Us!";
  const discoverItems = settings.homepage_discover_items?.length > 0 ? settings.homepage_discover_items : [
    { title: "Kakheti Region", description: "Traditions and Wine Making in the Heart of Kakheti!", image: "https://placehold.co/600x400.png", hint: "kakheti wine" },
    { title: "Mountain of Kazbegi", description: "Nature, History and Mountains to Fill your Eyes.", image: "https://placehold.co/600x400.png", hint: "kazbegi mountain" },
    { title: "Lovers of Real History", description: "History of Georgia from the beginning until today!", image: "https://placehold.co/600x400.png", hint: "georgia history" }
  ];

  const destinationsTitle = settings.homepage_destinations_title || "Explore by Destination";
  const destinationsDescription = settings.homepage_destinations_description || "From the vibrant capital to the serene mountains, find tours in your favorite part of Georgia.";
  const destinations = settings.destinations_page_items?.length > 0 ? settings.destinations_page_items : [
    { name: "Tbilisi", image: "https://placehold.co/600x400.png", hint: "tbilisi georgia", description: "The vibrant capital where history meets modernity." },
    { name: "Batumi", image: "https://placehold.co/600x400.png", hint: "batumi georgia", description: "A dazzling city on the Black Sea coast." },
    { name: "Kakheti", image: "https://placehold.co/600x400.png", hint: "kakheti georgia", description: "The historic heartland of Georgian wine." },
  ];
  
  const offersTitle = settings.homepage_offers_title || "Don't Miss Our Special Offers!";
  const offersDescription = settings.homepage_offers_description || "Get up to 20% off on select tours this month. Your next adventure is waiting.";

  const newsletterTitle = settings.homepage_newsletter_title || "Subscribe to Our Newsletter";
  const newsletterDescription = settings.homepage_newsletter_description || "Get the latest news, updates, and special offers delivered directly to your inbox.";

  const staticCategories = [
      { name: "City Tours", hint: "tbilisi street" },
      { name: "Mountain & Hiking", hint: "caucasus mountains" },
      { name: "Wine & Gastronomy", hint: "georgian wine" },
      { name: "Historical & Cultural", hint: "ancient monastery" },
      { name: "Multi-Day Tours", hint: "georgia road trip" },
      { name: "Adventure & Extreme", hint: "paragliding georgia" },
  ];

  const categories = staticCategories.map(category => {
    const slug = slugify(category.name);
    return {
      name: category.name,
      image: categoryConfig[slug] || 'https://placehold.co/400x500.png',
      hint: category.hint,
      href: `/tours?category=${slug}`
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
            {heroIsVideo ? (
                <video
                    key={heroImage}
                    src={heroImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
                    style={{ objectFit: 'cover' }}
                />
            ) : (
                <Image
                    src={heroImage}
                    alt="Scenic view of Georgia"
                    fill
                    style={{ objectFit: "cover" }}
                    className="z-0"
                    data-ai-hint="georgia landscape"
                    priority
                />
            )}
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              {heroSubtitle}
            </p>
            <div className="max-w-4xl mx-auto">
              <TourSearchForm />
            </div>
          </div>
        </section>

        {/* 2. Popular Tours Section */}
        <section id="popular-tours" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-2">
              {popularToursTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-12">
                {popularToursDescription}
            </p>
             {popularTours.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularTours.map((tour) => (
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
                    <AlertTitle>No Popular Tours Yet</AlertTitle>
                    <AlertDescription>
                        We're busy curating the best experiences for you. Check back soon for our popular tours!
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </section>

        {/* 3. Browse by Category Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-2">
              {categoriesTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-12">
              {categoriesDescription}
            </p>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {categories.map((category) => (
                  <CarouselItem key={category.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link href={category.href} className="group relative block aspect-square overflow-hidden rounded-lg shadow-lg">
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
        
        {/* 4. Discover World of Georgia Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold">
                {discoverTitle}
              </h2>
              <p className="text-muted-foreground text-lg mt-4">
                {discoverDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {discoverItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-full overflow-hidden rounded-lg shadow-md mb-6">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 hover:scale-105"
                      data-ai-hint={item.hint}
                    />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground max-w-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Explore by Destination Section */}
        <section className="py-16 md:py-24 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">{destinationsTitle}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-12">
                        {destinationsDescription}
                    </p>
                </div>
                 <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="-ml-4">
                        {destinations.map((dest) => (
                            <CarouselItem key={dest.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <Link href={`/tours?query=${dest.name}`} className="group relative block overflow-hidden rounded-lg shadow-lg">
                                    <Image src={dest.image} alt={dest.name} width={600} height={400} data-ai-hint={dest.hint} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-white text-2xl font-bold font-headline">{dest.name}</h3>
                                        <p className="text-white/90 text-sm">{dest.description}</p>
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
                        <h2 className="text-3xl md:text-4xl font-headline font-bold">{offersTitle}</h2>
                        <p className="text-lg mt-2 opacity-90">{offersDescription}</p>
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
                <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">{newsletterTitle}</h2>
                <p className="text-muted-foreground text-lg mb-8">
                    {newsletterDescription}
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
