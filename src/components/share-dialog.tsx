'use client';

import { Check, Copy, QrCode } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ShareDialogProps {
  url: string;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ url, onOpenChange }: ShareDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}&bgcolor=121212&color=39FF14&qzone=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateNew = () => {
    onOpenChange(false);
    router.push('/');
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline neon-text">Transmission Successful</DialogTitle>
          <DialogDescription>
            Your paste is live. Share the link with anyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {showQr ? (
            <img src={qrUrl} alt="QR Code" className="rounded-lg border-2 border-primary p-2" />
          ) : (
            <div className="flex items-center space-x-2 w-full">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">Link</Label>
                    <Input id="link" value={url} readOnly className="font-mono"/>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start gap-2">
            <Button type="button" variant="outline" onClick={() => setShowQr(!showQr)}>
                <QrCode className="mr-2 h-4 w-4"/>
                {showQr ? "Hide QR Code" : "Show QR Code"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCreateNew}>
                Create New Paste
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
