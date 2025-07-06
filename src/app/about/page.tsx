import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CalendarCheck, Sparkles, Globe, MousePointerClick } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Reliable & Trusted Network",
    description: "We work only with handpicked, trusted suppliers and experienced local partners to ensure every part of your trip is safe, smooth, and memorable."
  },
  {
    icon: CalendarCheck,
    title: "Guaranteed Departures",
    description: "No more worrying about cancellations. Our tours run as planned, whether you’re a solo traveler or part of a group."
  },
  {
    icon: Sparkles,
    title: "Authentic Local Experiences",
    description: "From ancient monasteries and scenic mountains to cozy wine cellars and vibrant cities, we go beyond the usual routes to show you the real Georgia."
  },
  {
    icon: Globe,
    title: "Quality Service, Global Hospitality",
    description: "Whether you’re from Europe, the Middle East, or Asia, our team speaks your language—both literally and culturally."
  },
  {
    icon: MousePointerClick,
    title: "Easy Booking, Full Support",
    description: "Our online platform is user-friendly and secure, and our team is available 24/7 to assist with planning, booking, and any questions along the way."
  }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative h-[40vh] flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="https://placehold.co/1600x600.png"
            alt="Team of TourVista guides"
            fill
            style={{ objectFit: "cover" }}
            className="z-0"
            data-ai-hint="georgia landscape team"
            priority
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
              About TourVista
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4">Your Journey Begins Here</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At TourVista, we’ve been proudly delivering guaranteed tours across Georgia for over two years, helping travelers from around the world discover the magic of this breathtaking country.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">What Makes Us Different?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                      <feature.icon className="w-8 h-8" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2 text-xl font-headline">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4">Join Our Happy Travelers</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join hundreds of happy travelers who trusted us to create their unforgettable Georgian adventure. Your journey begins here—with the people who know Georgia best.
              </p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}