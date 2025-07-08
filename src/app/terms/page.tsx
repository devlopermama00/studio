
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalLayout } from "@/components/legal-layout";
import { getSettings } from "@/lib/settings-data";
import ReactMarkdown from 'react-markdown';

const defaultContent = `
## 1. Introduction
Welcome to DayTourGuides. These Terms of Use govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms and our Privacy Policy.

## 2. Booking and Payments
All bookings made through DayTourGuides are subject to availability. Payment must be made in full at the time of booking to confirm your reservation. We accept various payment methods, which are processed through a secure third-party payment gateway.

## 3. User Accounts
To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

## 4. Code of Conduct
Users are expected to conduct themselves in a respectful manner. Any form of harassment, abuse, or fraudulent activity is strictly prohibited and may result in account termination and legal action.

## 5. Limitation of Liability
DayTourGuides acts as an intermediary between you and the tour providers. We are not liable for any personal injury, property damage, or other loss that may occur during a tour. All disputes with a tour provider must be resolved directly with them.
`;

function TermsContent({ content }: { content: string }) {
    return (
      <article className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">General Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last Updated: October 26, 2023</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    );
}

export default async function TermsPage() {
  const settings = await getSettings();
  const content = settings.terms_page_content || defaultContent;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-secondary">
        <LegalLayout>
            <TermsContent content={content} />
        </LegalLayout>
      </main>
      <SiteFooter />
    </div>
  );
}
