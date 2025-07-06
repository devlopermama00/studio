"use client";

import Link from "next/link";
import React from "react";
import { TourVistaLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

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

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("items-center space-x-4 lg:space-x-6 hidden md:flex", className)}>
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
  );

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    if (isLoading) {
      if (mobile) {
        return (
          <div className="flex flex-col space-y-2 pt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        );
      }
      return <Skeleton className="h-10 w-32" />;
    }

    if (user) {
      const button = (
        <Button asChild className={cn(mobile && "w-full")}>
          <Link href="/dashboard"><LayoutDashboard className="mr-2" />Dashboard</Link>
        </Button>
      );
      return mobile ? <div className="flex flex-col space-y-2 pt-4">{button}</div> : button;
    }

    return (
      <div className={cn("items-center space-x-2", mobile ? "flex flex-col space-y-2 pt-4 space-x-0" : "hidden md:flex")}>
        <Button variant={mobile ? "outline" : "ghost"} asChild className={cn(mobile && "w-full")}>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild className={cn(mobile && "w-full")}>
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <TourVistaLogo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <NavLinks />
          <AuthButtons />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <TourVistaLogo className="mb-8" />
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <AuthButtons mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
