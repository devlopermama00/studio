import { Mountain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function TourVistaLogo({ className, onClick }: { className?: string; onClick?: () => void; }) {
  return (
    <Link href="/" onClick={onClick} className={cn("flex items-center gap-2 text-xl font-bold font-headline", className)}>
      <div className="p-1.5 bg-primary text-primary-foreground rounded-md">
        <Mountain className="h-5 w-5" />
      </div>
      <span>TourVista</span>
      <span className="text-primary">Georgia</span>
    </Link>
  );
}
