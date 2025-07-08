
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourSearchForm } from "@/components/tour-search-form";
import { getPublicTours } from "@/lib/tours-data";
import { ToursClient } from "./tours-client";

export const dynamic = 'force-dynamic';

export default async function ToursPage() {
  const initialTours = await getPublicTours();

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
            <ToursClient initialTours={initialTours} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
