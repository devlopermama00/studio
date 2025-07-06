import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalLayout } from "@/components/legal-layout";

function CancellationContent() {
    return (
      <article className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Cancellation Policy</h1>
        <p className="text-sm text-muted-foreground">Last Updated: October 26, 2023</p>
        
        <div className="space-y-4 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">1. Cancellation by Traveler</h2>
            <p>We understand that plans can change. Our cancellation policy is designed to be as flexible as possible while respecting the commitment of our tour providers.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Full Refund:</strong> Cancellations made more than 48 hours before the scheduled tour start time will receive a full refund.</li>
                <li><strong>50% Refund:</strong> Cancellations made between 24 and 48 hours before the tour start time will receive a 50% refund.</li>
                <li><strong>No Refund:</strong> Cancellations made less than 24 hours before the tour start time are not eligible for a refund.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">2. How to Cancel</h2>
            <p>To cancel a booking, please log into your account, go to "My Bookings", and select the booking you wish to cancel. Follow the prompts to complete the cancellation process. The refund will be processed to your original payment method within 5-7 business days.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">3. Cancellation by TourVista or Provider</h2>
            <p>In the rare event that we or a tour provider must cancel a tour due to unforeseen circumstances (e.g., extreme weather, safety concerns), you will be notified as soon as possible and offered the choice of a full refund or rescheduling for a future date at no additional cost.</p>
          </section>
        </div>
      </article>
    );
}

export default function CancellationPage() {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 bg-secondary">
          <LegalLayout>
              <CancellationContent />
          </LegalLayout>
        </main>
        <SiteFooter />
      </div>
    );
}
