
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Mountain, GlassWater, Landmark, CalendarDays, Zap } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        name: "City Tours",
        description: "Explore the vibrant streets and historic landmarks of Georgia's most famous cities.",
        icon: Globe,
        href: "/tours?category=city"
    },
    {
        name: "Mountain & Hiking",
        description: "Trek through breathtaking landscapes and witness the majestic beauty of the Caucasus mountains.",
        icon: Mountain,
        href: "/tours?category=hiking"
    },
    {
        name: "Wine & Gastronomy",
        description: "Indulge in the ancient traditions of Georgian winemaking and savor delicious local cuisine.",
        icon: GlassWater,
        href: "/tours?category=wine"
    },
    {
        name: "Historical & Cultural",
        description: "Step back in time and explore ancient monasteries, fortresses, and UNESCO World Heritage sites.",
        icon: Landmark,
        href: "/tours?category=historical"
    },
    {
        name: "Multi-Day Tours",
        description: "Immerse yourself fully in the Georgian experience with our comprehensive multi-day adventures.",
        icon: CalendarDays,
        href: "/tours?category=multi-day"
    },
    {
        name: "Adventure & Extreme",
        description: "Get your adrenaline pumping with thrilling activities like rafting, paragliding, and more.",
        icon: Zap,
        href: "/tours?category=adventure"
    },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Tours for Every Traveler</h1>
                <p className="text-lg text-muted-foreground">
                    Whether you're a history buff, a nature lover, or a foodie, we have the perfect tour category for you. Browse our selection to find the adventure that calls to you.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link href={category.href} key={category.name}>
                    <Card className="text-center flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-transform">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                        <category.icon className="w-8 h-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <CardTitle className="mb-2 text-xl font-headline">{category.name}</CardTitle>
                        <p className="text-muted-foreground">{category.description}</p>
                    </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
