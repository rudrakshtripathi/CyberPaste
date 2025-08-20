import Link from 'next/link';
import { getActivePasteCount } from '@/lib/actions/paste';

export async function Header() {
  const activeCount = await getActivePasteCount();

  return (
    <header className="py-2 px-4 md:px-8 border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-headline text-2xl font-bold neon-text flex flex-col justify-center glitch" data-text="CyberPaste" aria-label="CyberPaste Home">
            <span className="hidden md:block">CYBER PASTE</span>
            <span className="md:hidden">CyberPaste</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm font-mono text-accent">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active Signals</div>
          </div>
        </div>
      </div>
    </header>
  );
}
