import { TourVistaLogo } from "@/components/logo";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "./ui/button";

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <TourVistaLogo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Your gateway to unforgettable adventures in the heart of the Caucasus.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Facebook className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Twitter className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Instagram className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
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
              <li><Link href="/providers" className="text-muted-foreground hover:text-primary">For Tour Providers</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
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
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 TourVista Georgia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
