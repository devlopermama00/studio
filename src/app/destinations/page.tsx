
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings-data";

const defaultDestinations = [
  { name: "Tbilisi", image: "https://placehold.co/600x400.png", hint: "tbilisi georgia", description: "The vibrant capital where history meets modernity." },
  { name: "Batumi", image: "https://placehold.co/600x400.png", hint: "batumi georgia", description: "A dazzling city on the Black Sea coast." },
  { name: "Gudauri", image: "https://placehold.co/600x400.png", hint: "gudauri georgia", description: "A premier ski resort with stunning mountain views." },
  { name: "Kakheti", image: "https://placehold.co/600x400.png", hint: "kakheti georgia", description: "The historic heartland of Georgian wine." },
  { name: "Kazbegi", image: "https://placehold.co/600x400.png", hint: "kazbegi mountains", description: "Home to the iconic Gergeti Trinity Church." },
  { name: "Svaneti", image: "https://placehold.co/600x400.png", hint: "svaneti landscape", description: "A remote region of medieval towers and high peaks." },
  { name: "Mtskheta", image: "https://placehold.co/600x400.png", hint: "mtskheta georgia", description: "The ancient capital and spiritual heart of Georgia." },
  { name: "Kutaisi", image: "https://placehold.co/600x400.png", hint: "kutaisi georgia", description: "A city of legends, canyons, and monasteries." },
];

export default async function DestinationsPage() {
  const settings = await getSettings();
  const destinations = settings.destinations_page_items?.length > 0 ? settings.destinations_page_items : defaultDestinations;
  const pageTitle = settings.destinations_page_title || "Discover Georgia, Destination by Destination";
  const pageDescription = settings.destinations_page_description || "From the ancient streets of Tbilisi to the soaring peaks of the Caucasus, Georgia is a country of breathtaking diversity. Explore our top destinations to find the perfect backdrop for your next adventure.";

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{pageTitle}</h1>
                <p className="text-lg text-muted-foreground">
                    {pageDescription}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {destinations.map((dest: any) => (
                    <Link href={`/tours?query=${dest.name}`} key={dest.name} className="group relative block overflow-hidden rounded-lg shadow-lg transform transition-transform hover:-translate-y-1">
                        <Image src={dest.image} alt={dest.name} width={600} height={400} data-ai-hint={dest.hint || dest.name.toLowerCase()} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-2xl font-bold font-headline">{dest.name}</h3>
                            <p className="text-white/90 text-sm">{dest.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
