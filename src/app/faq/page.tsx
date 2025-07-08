
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { getSettings } from "@/lib/settings-data";

const defaultContent = {
  title: "Frequently Asked Questions",
  description: "Have questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.",
  items: [
    { question: "How do I book a tour?", answer: "Booking is easy! Simply find the tour you like, select your desired date and number of guests, and click the 'Book Now' button. You'll be guided through a secure payment process to confirm your reservation." },
    { question: "What is your cancellation policy?", answer: "We offer free cancellation up to 48 hours before the tour's start time for a full refund. Cancellations between 24 and 48 hours receive a 50% refund. Cancellations made less than 24 hours in advance are non-refundable. You can view the full policy on our Cancellation Policy page." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure online payment gateway. All prices are listed in USD." }
  ]
};

export default async function FAQPage() {
  const settings = await getSettings();
  const content = {
    title: settings.faq_page_title || defaultContent.title,
    description: settings.faq_page_description || defaultContent.description,
    items: settings.faq_page_items?.length > 0 ? settings.faq_page_items : defaultContent.items,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{content.title}</h1>
                <p className="text-lg text-muted-foreground">
                    {content.description}
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full bg-background rounded-lg p-6 shadow-sm">
                    {content.items.map((item: any, index: number) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="font-headline text-lg text-left hover:no-underline">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                        {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
