import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full flex-1">
      <h1 className="text-8xl md:text-9xl font-bold font-headline neon-text glitch" data-text="404">
        404
      </h1>
      <p className="mt-4 text-xl md:text-2xl text-muted-foreground">Signal Lost in the Noise</p>
      <p className="mt-2 text-accent max-w-md">
        The paste you are looking for does not exist, has expired, or has been lost to the digital void.
      </p>
      <Link href="/">
        <Button variant="ghost" className="mt-8 text-primary hover:bg-primary/10 hover:text-primary">
          Return to Terminal
        </Button>
      </Link>
    </div>
  );
}
