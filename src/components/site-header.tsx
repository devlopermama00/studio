
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { TourVistaLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, ChevronDown, LogOut } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { useCurrency } from "@/context/currency-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

const CurrencySelector = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { currency, currencies, setCurrency } = useCurrency();
  
  if (isMobile) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">Currency</p>
        <div className="grid grid-cols-3 gap-2">
          {currencies.map((c) => (
            <Button
              key={c.code}
              variant={currency.code === c.code ? 'default' : 'outline'}
              onClick={() => setCurrency(c.code)}
            >
              {c.code}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {currency.code}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((c) => (
          <DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code)}>
            {c.name} ({c.code})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
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
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); // Explicitly update client state
    if(isMenuOpen) setIsMenuOpen(false);
    router.refresh();
  };

  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
     if (isLoading) {
      return <Skeleton className={cn("h-10", isMobile ? "w-full" : "w-40")} />;
    }

    if (user) {
      return (
        <div className={cn("flex items-center gap-2", isMobile && "flex-col w-full items-start")}>
            <Button variant="ghost" asChild className={cn("w-full", isMobile && "justify-start text-lg")} onClick={() => isMobile && setIsMenuOpen(false)}>
              <Link href="/dashboard"><LayoutDashboard className="mr-2 h-5 w-5" />Dashboard</Link>
            </Button>
            <Button
                variant={isMobile ? 'outline' : 'ghost'}
                onClick={handleLogout}
                className={cn("w-full", isMobile && "justify-start text-lg")}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
        </div>
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
          <TourVistaLogo onClick={() => isMenuOpen && setIsMenuOpen(false)} />
          <nav className="hidden items-center gap-6 lg:flex">
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
            <div className="hidden lg:flex items-center">
                <CurrencySelector />
                <AuthButtons />
            </div>
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-sm">
                <div key={user?.id ?? 'logged-out'}>
                  <SheetHeader className="p-0 text-left mb-8">
                    <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    <TourVistaLogo onClick={() => setIsMenuOpen(false)} />
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
                    <CurrencySelector isMobile={true}/>
                    <Separator className="my-2" />
                    <AuthButtons isMobile={true} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
