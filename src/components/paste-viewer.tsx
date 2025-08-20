'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Copy, Download, Eye, File, Hash, Lock, Unlock } from 'lucide-react';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { StoredPaste, StoredTab } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { base64ToKey, decrypt } from '@/lib/crypto';
import Link from 'next/link';

interface PasteViewerProps {
  paste: StoredPaste;
}

export function PasteViewer({ paste }: PasteViewerProps) {
  const [decryptedTabs, setDecryptedTabs] = useState<StoredTab[] | null>(paste.encrypted ? null : paste.tabs);
  const [isDecrypting, setIsDecrypting] = useState(paste.encrypted);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (paste.encrypted) {
      const keyString = window.location.hash.substring(1).split('key=')[1];
      if (keyString) {
        const decryptContent = async () => {
          try {
            const key = await base64ToKey(keyString);
            const tabs = await Promise.all(
              paste.tabs.map(async (tab) => ({
                ...tab,
                content: await decrypt(tab.content, key),
              }))
            );
            setDecryptedTabs(tabs);
          } catch (error) {
            console.error('Decryption failed:', error);
            setDecryptionError('Decryption failed. The key may be invalid or the data is corrupt.');
          } finally {
            setIsDecrypting(false);
          }
        };
        decryptContent();
      } else {
        setIsDecrypting(false);
        setDecryptionError('This paste is encrypted. Provide the decryption key in the URL hash (e.g., #key=YOUR_KEY) to view it.');
      }
    }
  }, [paste]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Content copied to clipboard!' });
  };
  
  const handleDownload = (tab: StoredTab) => {
    const blob = new Blob([tab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab.name || 'pasty.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExpirationText = () => {
    if (paste.ttl === 0) return 'Never';
    const expirationDate = fromUnixTime(paste.createdAt / 1000 + paste.ttl);
    return `in ${formatDistanceToNow(expirationDate)}`;
  };

  const renderContent = () => {
    if (isDecrypting) {
      return <div className="text-center p-8">Decrypting transmission...</div>;
    }
    if (decryptionError) {
      return <div className="text-center p-8 text-destructive">{decryptionError}</div>;
    }
    if (!decryptedTabs) {
        return <div className="text-center p-8 text-destructive">Could not load paste content.</div>;
    }

    return (
      <Tabs defaultValue={decryptedTabs[0]?.name || '0'} className="relative">
        <TabsList>
          {decryptedTabs.map((tab, index) => (
            <TabsTrigger key={index} value={tab.name || String(index)}>
              {tab.name || `Pasty ${index + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>
        {decryptedTabs.map((tab, index) => (
          <TabsContent key={index} value={tab.name || String(index)}>
            <Card className="relative">
              <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                      <CardTitle>{tab.name}</CardTitle>
                      <CardDescription>Language: {tab.lang}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(tab.content)}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(tab)}><Download className="w-4 h-4" /></Button>
                  </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-black/50 p-4 rounded-md overflow-x-auto text-sm font-code">
                  <code>{tab.content}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  };
  
  return (
    <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline text-2xl neon-text">Incoming Transmission</CardTitle>
                <CardDescription>ID: {paste.id}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent"/><span>Expires: {getExpirationText()}</span></div>
                <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-accent"/><span>Views: {paste.views}</span></div>
                <div className="flex items-center gap-2">
                    {paste.encrypted ? <Lock className="w-4 h-4 text-accent"/> : <Unlock className="w-4 h-4 text-muted-foreground"/>}
                    <span>{paste.encrypted ? 'Encrypted' : 'Not Encrypted'}</span>
                </div>
                 <div className="flex items-center gap-2"><File className="w-4 h-4 text-accent"/><span>{paste.tabs.length} Pasties</span></div>
            </CardContent>
            <CardFooter className="gap-2">
                <Link href={`/raw/${paste.id}`} passHref legacyBehavior>
                    <a target="_blank" rel="noopener noreferrer">
                        <Button variant="outline"><Hash className="w-4 h-4 mr-2"/>Raw</Button>
                    </a>
                </Link>
                <Button onClick={() => router.push('/')}>Create New</Button>
            </CardFooter>
        </Card>
        {renderContent()}
    </div>
  );
}
