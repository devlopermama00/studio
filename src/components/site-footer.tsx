
import { TourVistaLogo } from "@/components/logo";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { getSettings } from "@/lib/settings-data";

export async function SiteFooter() {
  const settings = await getSettings();

  const description = settings.footer_description || "Your gateway to unforgettable adventures in the heart of the Caucasus.";
  const facebookUrl = settings.footer_facebook_url;
  const twitterUrl = settings.footer_twitter_url;
  const instagramUrl = settings.footer_instagram_url;
  const copyrightText = settings.footer_copyright_text || `© ${new Date().getFullYear()} TourVista Georgia. All rights reserved.`;

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-4">
            <TourVistaLogo />
            <p className="text-sm text-muted-foreground max-w-xs">
              {description}
            </p>
            <div className="flex space-x-2">
              {facebookUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></Link>
                </Button>
              )}
               {twitterUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={twitterUrl} target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5" /></Link>
                </Button>
              )}
               {instagramUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></Link>
                </Button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-headline font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tours" className="text-muted-foreground hover:text-primary">All Tours</Link></li>
                <li><Link href="/destinations" className="text-muted-foreground hover:text-primary">Destinations</Link></li>
                <li><Link href="/categories" className="text-muted-foreground hover:text-primary">Categories</Link></li>
                <li><Link href="/deals" className="text-muted-foreground hover:text-primary">Special Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Career</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/providers" className="text-muted-foreground hover:text-primary">For Tour Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/cancellation" className="text-muted-foreground hover:text-primary">Cancellation Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
