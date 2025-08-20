import Link from 'next/link';
import { getActivePasteCount } from '@/lib/actions/paste';

export async function Header() {
  const activeCount = await getActivePasteCount();

  return (
    <header className="py-2 px-4 md:px-8 border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto grid grid-cols-3 items-center">
        <div className="flex items-center gap-4 justify-start">
          <div className="text-center">
            <div className="text-sm font-mono text-accent">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active Signals</div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="font-headline text-3xl md:text-4xl font-bold neon-text glitch" data-text="CyberPaste" aria-label="CyberPaste Home">
            CyberPaste
          </Link>
        </div>

        <div className="justify-self-end">
          {/* Placeholder for right-side content if needed */}
        </div>
      </div>
    </header>
  );
}
