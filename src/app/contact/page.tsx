
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help with a booking? We'd love to hear from you. Fill out the form below or use our contact details to reach us.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-headline">Email</h3>
                  <p className="text-muted-foreground">Our support team will get back to you within 24 hours.</p>
                  <a href="mailto:contact@tourvista.ge" className="text-primary font-medium hover:underline">contact@tourvista.ge</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-headline">Phone</h3>
                  <p className="text-muted-foreground">Speak with our team for immediate assistance.</p>
                  <a href="tel:+995123456789" className="text-primary font-medium hover:underline">+995 123 456 789</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-headline">Office</h3>
                  <p className="text-muted-foreground">123 Freedom Square, Tbilisi, Georgia</p>
                   <p className="text-sm text-muted-foreground">Mon-Fri, 9am - 6pm</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
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
                    <Button type="submit" size="lg">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
