import Link from 'next/link';
import { getActivePasteCount } from '@/lib/actions/paste';
import { Github, Linkedin, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
          <Link
            href="/"
            className="font-headline text-3xl md:text-4xl font-bold neon-text glitch"
            data-text="CyberPaste"
            aria-label="CyberPaste Home"
          >
            CyberPaste
          </Link>
        </div>

        <div className="justify-self-end">
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="https://github.com/your-username" target="_blank" aria-label="GitHub Profile">
                      <Github className="h-5 w-5 text-accent hover:text-primary transition-colors" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" asChild>
                    <Link href="https://linkedin.com/in/your-profile" target="_blank" aria-label="LinkedIn Profile">
                      <Linkedin className="h-5 w-5 text-accent hover:text-primary transition-colors" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>LinkedIn</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" asChild>
                    <Link href="https://your-portfolio.com" target="_blank" aria-label="Portfolio Website">
                      <Briefcase className="h-5 w-5 text-accent hover:text-primary transition-colors" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Portfolio</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
