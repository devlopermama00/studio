
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourCard } from "@/components/tour-card";
import { getPublicTours } from "@/lib/tours-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Percent } from "lucide-react";
import type { Tour } from "@/lib/types";

export default async function DealsPage() {
  const deals: Tour[] = await getPublicTours(3);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
         <section className="py-12 bg-secondary text-center">
          <div className="container mx-auto px-4">
            <Percent className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Exclusive Deals & Special Offers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save on your next adventure with our handpicked selection of discounted tours. Book now before they're gone!
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
             {deals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
                </div>
            ) : (
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Deals Available Right Now</AlertTitle>
                    <AlertDescription>
                        We're currently not running any special offers, but please check back soon!
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
