import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <Construction className="w-10 h-10" />
              </div>
              <CardTitle className="font-headline text-3xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                We're compiling answers to all your questions. Our FAQ page will be ready soon!
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}