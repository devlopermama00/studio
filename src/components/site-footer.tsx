
import { TourVistaLogo } from "@/components/logo";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "./ui/button";
import { getSettings } from "@/lib/settings-data";
import React from "react";

// Inline SVG component for Pinterest icon
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 20l4 -9" />
    <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export async function SiteFooter() {
  const settings = await getSettings();

  const footerTitle = settings.footer_title;
  const description = settings.footer_description || "Your gateway to unforgettable adventures in the heart of the Caucasus.";
  const facebookUrl = settings.footer_facebook_url;
  const twitterUrl = settings.footer_twitter_url;
  const instagramUrl = settings.footer_instagram_url;
  const pinterestUrl = settings.footer_pinterest_url;
  const linkedinUrl = settings.footer_linkedin_url;
  const copyrightText = settings.footer_copyright_text || `© ${new Date().getFullYear()} DayTourGuides Georgia. All rights reserved.`;

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-4">
            <TourVistaLogo />
            {footerTitle && <h3 className="font-headline font-semibold text-lg pt-2">{footerTitle}</h3>}
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
               {pinterestUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={pinterestUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="h-5 w-5" /></Link>
                </Button>
              )}
               {linkedinUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /></Link>
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
