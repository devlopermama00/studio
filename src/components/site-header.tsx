
"use client";

import Link from "next/link";
import React, { useState } from "react";
import { TourVistaLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";

const navLinks = [
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About Us" },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);
  
  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
     if (isLoading) {
      return <Skeleton className={cn("h-10", isMobile ? "w-full" : "w-32")} />;
    }

    if (user) {
      return (
        <Button asChild className={cn(isMobile && "w-full")} onClick={() => isMobile && setIsMenuOpen(false)}>
          <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
        </Button>
      );
    }

    return (
      <div className={cn("flex items-center gap-2", isMobile && "flex-col w-full")}>
        <Button variant={isMobile ? "outline" : "ghost"} asChild className={cn(isMobile && "w-full")} onClick={() => isMobile && setIsMenuOpen(false)}>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild className={cn(isMobile && "w-full")} onClick={() => isMobile && setIsMenuOpen(false)}>
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <TourVistaLogo />
          <nav className="hidden items-center gap-6 md:flex">
             {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
            <div className="hidden md:flex">
                <AuthButtons />
            </div>
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-sm">
                <SheetHeader className="p-0 text-left mb-8">
                  <SheetTitle>
                    <TourVistaLogo onClick={() => setIsMenuOpen(false)} />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  <AuthButtons isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
