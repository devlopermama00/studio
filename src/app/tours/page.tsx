import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { TourCard } from "@/components/tour-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { getPublicTours } from "@/lib/tours-data";


export default async function ToursPage() {
  const tours = await getPublicTours();

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-headline font-bold mb-4 text-center">
              Explore Our Tours
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
              Find your next adventure in Georgia. Search by destination, category, or date.
            </p>
            <div className="max-w-4xl mx-auto">
              <TourSearchForm />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            {tours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
                </div>
            ) : (
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Tours Found</AlertTitle>
                    <AlertDescription>
                        There are currently no approved tours available. Please check back later or ask a provider to add some!
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
