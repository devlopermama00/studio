
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings-data";
import Image from "next/image";
import { cn, toHslString } from "@/lib/utils";

const defaultContent = {
  title: "Get in Touch",
  description: "We're here to help! Reach out to us with any questions or feedback.",
  contact_info_title: "Contact Information",
  contact_info_description: "Need help or have a question? We're here to support you.",
  email: "contact@tourvista.ge",
  phone: "+995 123 456 789",
  address: "123 Freedom Square, Tbilisi, Georgia",
  hero_image: null,
  hero_bg: null,
};

const ContactInfoItem = ({ icon: Icon, title, value, href }: { icon: React.ElementType, title: string, value: string, href: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h3 className="font-semibold">{title}</h3>
            <a href={href} className="text-muted-foreground hover:text-primary transition-colors break-all">{value}</a>
        </div>
    </div>
);


export default async function ContactPage() {
  const settings = await getSettings();
  const content = {
    title: settings.contact_page_title || defaultContent.title,
    description: settings.contact_page_description || defaultContent.description,
    contact_info_title: settings.contact_info_title || defaultContent.contact_info_title,
    contact_info_description: settings.contact_info_description || defaultContent.contact_info_description,
    email: settings.contact_page_email || defaultContent.email,
    phone: settings.contact_page_phone || defaultContent.phone,
    address: settings.contact_page_address || defaultContent.address,
    hero_image: settings.contact_page_hero_image || defaultContent.hero_image,
    hero_bg: settings.contact_page_hero_bg || defaultContent.hero_bg,
  };

  const heroBgHsl = toHslString(content.hero_bg);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <section
          className="relative text-primary-foreground py-20 text-center"
          style={!content.hero_image && heroBgHsl ? { backgroundColor: `hsl(${heroBgHsl})` } : {}}
        >
          {content.hero_image ? (
            <>
              <div className="absolute inset-0 bg-black/50 z-10" />
              <Image
                src={content.hero_image}
                alt="Contact us background"
                fill
                style={{ objectFit: 'cover' }}
                className="z-0"
                priority
                data-ai-hint="contact people"
              />
            </>
          ) : (
            <div className={cn(!heroBgHsl && "bg-gradient-to-r from-primary to-accent", "absolute inset-0")} />
          )}

          <div className="relative z-20 container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{content.title}</h1>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                  {content.description}
              </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-2">{content.contact_info_title}</h2>
                            <p className="text-muted-foreground">{content.contact_info_description}</p>
                        </div>
                        <div className="space-y-6">
                            <ContactInfoItem icon={Mail} title="Email" value={content.email} href={`mailto:${content.email}`} />
                            <ContactInfoItem icon={Phone} title="Phone" value={content.phone} href={`tel:${content.phone}`} />
                            <ContactInfoItem icon={MapPin} title="Office Address" value={content.address} href="#" />
                        </div>
                    </div>

                    <div>
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">Send us a Message</CardTitle>
                                <CardDescription>Fill out the form and we'll be in touch.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="name@example.com" />
                                    </div>
                                    </div>
                                    <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="e.g., Question about a tour" />
                                    </div>
                                    <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message here..." className="min-h-[150px]" />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full">Send Message</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
