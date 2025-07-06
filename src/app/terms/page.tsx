import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalLayout } from "@/components/legal-layout";

function TermsContent() {
    return (
      <article className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">General Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last Updated: October 26, 2023</p>
        
        <div className="space-y-4 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">1. Introduction</h2>
            <p>Welcome to TourVista. These Terms of Use govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms and our Privacy Policy.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">2. Booking and Payments</h2>
            <p>All bookings made through TourVista are subject to availability. Payment must be made in full at the time of booking to confirm your reservation. We accept various payment methods, which are processed through a secure third-party payment gateway.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">3. User Accounts</h2>
            <p>To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">4. Code of Conduct</h2>
            <p>Users are expected to conduct themselves in a respectful manner. Any form of harassment, abuse, or fraudulent activity is strictly prohibited and may result in account termination and legal action.</p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold font-headline mb-2 text-foreground">5. Limitation of Liability</h2>
            <p>TourVista acts as an intermediary between you and the tour providers. We are not liable for any personal injury, property damage, or other loss that may occur during a tour. All disputes with a tour provider must be resolved directly with them.</p>
          </section>
        </div>
      </article>
    );
  }

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <LegalLayout>
            <TermsContent />
        </LegalLayout>
      </main>
      <SiteFooter />
    </div>
  );
}
