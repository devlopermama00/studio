
'use client';

import Image from 'next/image';
import { Mountain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/providers';

export function TourVistaLogo({ className, onClick }: { className?: string; onClick?: () => void; }) {
  const settings = useSettings();
  const logoUrl = settings.logoUrl;
  const siteName = settings.siteName || 'DayTourGuides';

  if (logoUrl) {
    return (
      <Link href="/" onClick={onClick} className={cn("relative h-12 w-40", className)}>
        <Image
          src={logoUrl}
          alt={`${siteName} logo`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="160px"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" onClick={onClick} className={cn("flex items-center gap-2 text-xl font-bold font-headline", className)}>
      <div className="p-1.5 bg-primary text-primary-foreground rounded-md">
        <Mountain className="h-5 w-5" />
      </div>
      <span>{siteName}</span>
      <span className="text-primary">Georgia</span>
    </Link>
  );
}
