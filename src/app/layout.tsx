
import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { CurrencyProvider } from '@/context/currency-context';
import { getSettings } from '@/lib/settings-data';

const fontHeadline = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '700'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.siteName || 'TourVista Georgia',
    description: settings.siteDescription || 'Book the best day tours in Georgia.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  const themeStyle: React.CSSProperties = {};
  if (settings.primaryColor) {
    themeStyle['--primary' as any] = settings.primaryColor;
  }
  if (settings.accentColor) {
    themeStyle['--accent' as any] = settings.accentColor;
  }

  return (
    <html lang="en" suppressHydrationWarning style={themeStyle}>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        fontHeadline.variable,
        fontBody.variable
      )}>
        <CurrencyProvider>
            {children}
        </CurrencyProvider>
        <Toaster />
      </body>
    </html>
  );
}
