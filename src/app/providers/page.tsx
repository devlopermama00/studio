
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Laptop, Wallet, ArrowRight, LogIn, ShieldCheck, List } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const benefits = [
    {
        icon: Users,
        title: "Reach a Global Audience",
        description: "Connect with thousands of travelers from around the world who are eager to explore Georgia."
    },
    {
        icon: Laptop,
        title: "Easy-to-Use Platform",
        description: "Our intuitive dashboard makes it simple to list tours, manage bookings, and track your earnings."
    },
    {
        icon: Wallet,
        title: "Secure & Timely Payments",
        description: "Receive your earnings securely and on time with our reliable payment system."
    }
];

const howItWorks = [
  {
      icon: LogIn,
      title: "1. Sign Up",
      description: "Create your provider account in just a few minutes."
  },
  {
      icon: ShieldCheck,
      title: "2. Get Verified",
      description: "Submit your documents for a quick verification process to ensure trust and safety."
  },
  {
      icon: List,
      title: "3. List Your Tours",
      description: "Showcase your unique tours to a global audience and start getting bookings."
  }
];

export default function ProvidersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        
        <section className="relative bg-secondary py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                 <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">
                    Partner with TourVista
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                    Share your passion for Georgia with a global audience. Join our network of trusted local guides and grow your tour business with us.
                </p>
                <Button asChild size="lg">
                    <Link href="/register/provider">Get Started for Free <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </section>
        
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold">Why Partner With Us?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                      <benefit.icon className="w-8 h-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-headline font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                     <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-headline font-semibold">Simple Steps to Success</h2>
                        <p className="text-muted-foreground mt-2 text-lg">Getting started on TourVista is quick and straightforward.</p>
                    </div>
                    <div className="space-y-6">
                        {howItWorks.map(step => (
                            <div key={step.title} className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0 mt-1">
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-headline font-semibold">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="hidden lg:block">
                    <Image 
                        src="https://placehold.co/600x700.png"
                        alt="Tour guide in Georgia"
                        width={600}
                        height={700}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="georgian tour guide"
                    />
                </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join hundreds of happy providers who trust TourVista to connect them with travelers. Your next adventure in business starts here.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register/provider">Sign Up and Start Listing Tours</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
