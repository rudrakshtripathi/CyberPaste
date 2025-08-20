'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full flex-1">
      <h2 className="text-4xl font-bold font-headline text-destructive glitch" data-text="Bad Signal">
        Bad Signal
      </h2>
      <p className="mt-4 text-xl text-muted-foreground">A transmission error occurred.</p>
      <p className="mt-2 text-accent max-w-md">
        {error.message || 'The paste data could not be processed.'}
      </p>
      <Button onClick={() => reset()} variant="destructive" className="mt-8">
        Attempt Re-sync
      </Button>
    </div>
  );
}
