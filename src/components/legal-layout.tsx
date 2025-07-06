"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const legalNavLinks = [
  { href: "/terms", label: "General Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cancellation", label: "Cancellation Policy" },
];

export function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-2">
                {legalNavLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6 md:p-8">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
