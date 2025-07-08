
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalLayout } from "@/components/legal-layout";
import { getSettings } from "@/lib/settings-data";
import ReactMarkdown from 'react-markdown';

const defaultContent = `
## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, book a tour, or contact us. This may include your name, email address, payment information, and any other information you choose to provide.

## 2. How We Use Your Information
We use the information we collect to process your bookings, communicate with you, personalize your experience, and improve our services. We do not share your personal information with third parties except as necessary to complete your booking (e.g., with tour providers) or as required by law.

## 3. Data Security
We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.

## 4. Your Rights
You have the right to access, correct, or delete your personal information at any time. You can do this by logging into your account or by contacting our support team.
`;

function PrivacyContent({ content }: { content: string }) {
    return (
      <article className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last Updated: October 26, 2023</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    );
}

export default async function PrivacyPage() {
  const settings = await getSettings();
  const content = settings.privacy_page_content || defaultContent;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-1 bg-secondary">
        <LegalLayout>
            <PrivacyContent content={content} />
        </LegalLayout>
      </main>
      <SiteFooter />
    </div>
  );
}
