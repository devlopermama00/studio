
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, CalendarCheck, Sparkles, Globe, MousePointerClick, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { getPublicReviews } from "@/lib/reviews-data";
import { getSettings } from "@/lib/settings-data";
import { cn, toHslString } from "@/lib/utils";

const iconMap = {
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Globe,
  MousePointerClick,
  Star,
};

const defaultContent = {
  hero_image: "https://placehold.co/1600x600.png",
  hero_title: "About DayTourGuides",
  intro_title: "Your Journey Begins Here",
  intro_desc: "At DayTourGuides, we’ve been proudly delivering guaranteed tours across Georgia for over two years, helping travelers from around the world discover the magic of this breathtaking country.",
  intro_bg: null,
  features_title: "What Makes Us Different?",
  features: [
    { icon: "ShieldCheck", title: "Reliable & Trusted Network", description: "We work only with handpicked, trusted suppliers and experienced local partners to ensure every part of your trip is safe, smooth, and memorable." },
    { icon: "CalendarCheck", title: "Guaranteed Departures", description: "No more worrying about cancellations. Our tours run as planned, whether you’re a solo traveler or part of a group." },
    { icon: "Sparkles", title: "Authentic Local Experiences", description: "From ancient monasteries and scenic mountains to cozy wine cellars and vibrant cities, we go beyond the usual routes to show you the real Georgia." },
    { icon: "Globe", title: "Quality Service, Global Hospitality", description: "Whether you’re from Europe, the Middle East, or Asia, our team speaks your language—both literally and culturally." },
    { icon: "MousePointerClick", title: "Easy Booking, Full Support", description: "Our online platform is user-friendly and secure, and our team is available 24/7 to assist with planning, booking, and any questions along the way." }
  ],
  why_choose_us_title: "Why Choose Us",
  why_choose_us_description: "These popular destinations have a lot to offer",
  why_choose_us_items: [
      { icon: "ShieldCheck", title: "What makes us different?", description: "Reliable & Trusted Network - We work only with handpicked, trusted suppliers and experienced local partners to ensure every part of your trip is safe, smooth, and memorable." },
      { icon: "CalendarCheck", title: "Guaranteed Departures", description: "No more worrying about cancellations. Our tours run as planned, whether you’re a solo traveler or part of a group." },
      { icon: "Globe", title: "Quality Service, Global Hospitality", description: "Whether you’re from Europe, the Middle East, Asia or the Americas, our team speaks your language—both literally and culturally." }
  ],
  reviews_title: "What Our Travelers Say",
  reviews_desc: "Real stories from our adventurous guests.",
  cta_title: "Join Our Happy Travelers",
  cta_desc: "Join hundreds of happy travelers who trusted us to create their unforgettable Georgian adventure. Your journey begins here—with the people who know Georgia best."
};

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
        />
      ))}
    </div>
);

export default async function AboutPage() {
  const reviews = await getPublicReviews(9);
  const settings = await getSettings();
  const content = {
      hero_image: settings.about_page_hero_image || defaultContent.hero_image,
      hero_title: settings.about_page_hero_title || defaultContent.hero_title,
      intro_title: settings.about_page_intro_title || defaultContent.intro_title,
      intro_desc: settings.about_page_intro_desc || defaultContent.intro_desc,
      intro_bg: settings.about_page_intro_bg || defaultContent.intro_bg,
      features_title: settings.about_page_features_title || defaultContent.features_title,
      features: settings.about_page_features?.length > 0 ? settings.about_page_features : defaultContent.features,
      why_choose_us_title: settings.about_page_why_choose_us_title || defaultContent.why_choose_us_title,
      why_choose_us_description: settings.about_page_why_choose_us_description || defaultContent.why_choose_us_description,
      why_choose_us_items: settings.about_page_why_choose_us_items?.length > 0 ? settings.about_page_why_choose_us_items : defaultContent.why_choose_us_items,
      reviews_title: settings.reviews_title || defaultContent.reviews_title,
      reviews_desc: settings.reviews_desc || defaultContent.reviews_desc,
      cta_title: settings.about_page_cta_title || defaultContent.cta_title,
      cta_desc: settings.about_page_cta_desc || defaultContent.cta_desc,
  };

  const introBgHsl = toHslString(content.intro_bg);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <section className="relative h-[40vh] flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src={content.hero_image}
            alt="Team of DayTourGuides guides"
            fill
            style={{ objectFit: "cover" }}
            className="z-0"
            data-ai-hint="georgia landscape team"
            priority
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
              {content.hero_title}
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div
              className={cn(
                "rounded-lg p-12 text-center",
                introBgHsl ? "text-primary-foreground" : "bg-secondary"
              )}
              style={introBgHsl ? { backgroundColor: `hsl(${introBgHsl})` } : {}}
            >
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4">
                  {content.intro_title}
                </h2>
                <p className={cn("text-lg leading-relaxed", introBgHsl ? "text-primary-foreground/90" : "text-muted-foreground")}>
                  {content.intro_desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">{content.features_title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.features.map((feature: any, index: number) => {
                const Icon = iconMap[feature.icon as keyof typeof iconMap] || ShieldCheck;
                return (
                  <Card key={index} className="text-center flex flex-col h-full">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                        <Icon className="w-8 h-8" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardTitle className="mb-2 text-xl font-headline">{feature.title}</CardTitle>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">{content.why_choose_us_title}</h2>
              <p className="text-lg text-muted-foreground">{content.why_choose_us_description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.why_choose_us_items.map((item: any, index: number) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap] || ShieldCheck;
                return (
                  <Card key={index} className="text-center flex flex-col h-full">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                        <Icon className="w-8 h-8" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardTitle className="mb-2 text-xl font-headline">{item.title}</CardTitle>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold">{content.reviews_title}</h2>
              <p className="text-muted-foreground text-lg mt-4">
                {content.reviews_desc}
              </p>
            </div>
            {reviews && reviews.length > 0 ? (
              <Carousel
                opts={{ align: "start" }}
                className="w-full max-w-6xl mx-auto"
              >
                <CarouselContent className="-ml-4">
                  {reviews.map((review) => (
                    <CarouselItem key={review._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="flex flex-col h-full">
                          <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <StarRating rating={review.rating} />
                                <p className="text-muted-foreground mt-4 italic line-clamp-4">"{review.comment}"</p>
                            </div>
                            <div className="mt-6 flex items-center gap-4 border-t pt-4">
                                <Avatar>
                                    <AvatarImage src={review.userId?.profilePhoto} alt={review.userId?.name} />
                                    <AvatarFallback>{review.userId?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{review.userId?.name || 'Anonymous User'}</p>
                                    <p className="text-sm text-muted-foreground">on {review.tourId?.title || 'a tour'}</p>
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            ) : (
              <Alert className="max-w-md mx-auto">
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Reviews Yet</AlertTitle>
                <AlertDescription>
                    Be the first to leave a review after your tour!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4">{content.cta_title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content.cta_desc}
              </p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
