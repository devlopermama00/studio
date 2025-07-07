
import type {Metadata} from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { CurrencyProvider } from '@/context/currency-context';

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


export const metadata: Metadata = {
  title: 'TourVista Georgia',
  description: 'Book the best day tours in Georgia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
