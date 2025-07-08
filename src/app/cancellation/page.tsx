
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalLayout } from "@/components/legal-layout";
import { getSettings } from "@/lib/settings-data";
import ReactMarkdown from 'react-markdown';

const defaultContent = `
## 1. Cancellation by Traveler
We understand that plans can change. Our cancellation policy is designed to be as flexible as possible while respecting the commitment of our tour providers.
* **Full Refund:** Cancellations made more than 48 hours before the scheduled tour start time will receive a full refund.
* **50% Refund:** Cancellations made between 24 and 48 hours before the tour start time will receive a 50% refund.
* **No Refund:** Cancellations made less than 24 hours before the tour start time are not eligible for a refund.

## 2. How to Cancel
To cancel a booking, please log into your account, go to "My Bookings", and select the booking you wish to cancel. Follow the prompts to complete the cancellation process. The refund will be processed to your original payment method within 5-7 business days.

## 3. Cancellation by TourVista or Provider
In the rare event that we or a tour provider must cancel a tour due to unforeseen circumstances (e.g., extreme weather, safety concerns), you will be notified as soon as possible and offered the choice of a full refund or rescheduling for a future date at no additional cost.
`;

function CancellationContent({ content }: { content: string }) {
    return (
      <article className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Cancellation Policy</h1>
        <p className="text-sm text-muted-foreground">Last Updated: October 26, 2023</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    );
}

export default async function CancellationPage() {
  const settings = await getSettings();
  const content = settings.cancellation_page_content || defaultContent;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <LegalLayout>
            <CancellationContent content={content} />
        </LegalLayout>
      </main>
      <SiteFooter />
    </div>
  );
}
