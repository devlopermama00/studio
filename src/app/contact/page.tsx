
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings-data";

const defaultContent = {
  title: "Get in Touch",
  description: "Have a question or need help with a booking? We'd love to hear from you. Fill out the form below or use our contact details to reach us.",
  email: "contact@tourvista.ge",
  phone: "+995 123 456 789",
  address: "123 Freedom Square, Tbilisi, Georgia",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const content = {
    title: settings.contact_page_title || defaultContent.title,
    description: settings.contact_page_description || defaultContent.description,
    email: settings.contact_page_email || defaultContent.email,
    phone: settings.contact_page_phone || defaultContent.phone,
    address: settings.contact_page_address || defaultContent.address,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{content.title}</h1>
              <p className="text-lg text-muted-foreground">
                {content.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader className="flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0"><Mail className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="font-headline text-xl">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2 text-sm">Our support team will get back to you within 24 hours.</p>
                  <a href={`mailto:${content.email}`} className="font-semibold text-primary break-all hover:underline text-base">{content.email}</a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0"><Phone className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="font-headline text-xl">Phone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2 text-sm">Speak with our team for immediate assistance.</p>
                  <a href={`tel:${content.phone}`} className="font-semibold text-primary break-all hover:underline text-base">{content.phone}</a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0"><MapPin className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="font-headline text-xl">Office</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2 text-sm">{content.address}</p>
                  <p className="font-semibold text-primary text-base">Mon-Fri, 9am - 6pm</p>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto w-full">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl md:text-3xl font-headline">Send us a Message</CardTitle>
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
                    <Button type="submit" size="lg" className="w-full sm:w-auto">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
