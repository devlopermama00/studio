
import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn, toHslString } from "@/lib/utils"
import { getSettings } from '@/lib/settings-data';
import { Providers } from '@/context/providers';

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
    const primaryHsl = toHslString(settings.primaryColor);
    if (primaryHsl) {
      themeStyle['--primary' as any] = primaryHsl;
    }
  }
  if (settings.accentColor) {
    const accentHsl = toHslString(settings.accentColor);
    if (accentHsl) {
        themeStyle['--accent' as any] = accentHsl;
    }
  }
  if (settings.foregroundColor) {
    const foregroundHsl = toHslString(settings.foregroundColor);
    if (foregroundHsl) {
      themeStyle['--foreground' as any] = foregroundHsl;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning style={themeStyle}>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        fontHeadline.variable,
        fontBody.variable
      )}>
        <Providers settings={settings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
