
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How do I book a tour?",
    answer: "Booking is easy! Simply find the tour you like, select your desired date and number of guests, and click the 'Book Now' button. You'll be guided through a secure payment process to confirm your reservation."
  },
  {
    question: "What is your cancellation policy?",
    answer: "We offer free cancellation up to 48 hours before the tour's start time for a full refund. Cancellations between 24 and 48 hours receive a 50% refund. Cancellations made less than 24 hours in advance are non-refundable. You can view the full policy on our Cancellation Policy page."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure online payment gateway. All prices are listed in USD."
  },
  {
    question: "Are the tours suitable for children?",
    answer: "Most of our tours are family-friendly, but some may have age or fitness restrictions, especially hiking or adventure tours. Please check the 'Tour Details' section on each tour page for specific information."
  },
  {
    question: "What should I bring on a tour?",
    answer: "We recommend comfortable walking shoes, weather-appropriate clothing, a bottle of water, a camera, and sunscreen. For specific tours like hiking, additional gear may be recommended. Check the tour description for details."
  },
  {
    question: "Can I customize a tour or book a private tour?",
    answer: "Many of our providers offer private tours that can be customized to your interests. Please use the 'Contact Us' form to inquire about private or custom tour arrangements, and we'll be happy to assist you."
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Frequently Asked Questions</h1>
                <p className="text-lg text-muted-foreground">
                    Have questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full bg-background rounded-lg p-6 shadow-sm">
                    {faqItems.map((item, index) => (
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
