
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EXPIRATION_OPTIONS, LANGUAGES } from '@/lib/constants';
import { createPaste } from '@/lib/actions/paste';
import { EditorTab } from '@/lib/types';
import { encrypt, generateKey, keyToBase64 } from '@/lib/crypto';
import { ShareDialog } from './share-dialog';
import { SyntaxFixerButton } from './syntax-fixer-button';

const createNewTab = (): EditorTab => ({
  id: '', 
  name: 'pasty.txt',
  lang: 'plaintext',
  content: '',
});

export function PasteEditor() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [expiration, setExpiration] = useState<string>(EXPIRATION_OPTIONS[3].value); // Default to 1 Month
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialTab = { ...createNewTab(), id: crypto.randomUUID() };
    setTabs([initialTab]);
    setActiveTab(initialTab.id);
  }, []);

  const handleAddTab = () => {
    const newTab = { ...createNewTab(), id: crypto.randomUUID() };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleRemoveTab = (idToRemove: string) => {
    if (tabs.length === 1) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot remove the last tab.' });
      return;
    }
    const newTabs = tabs.filter((tab) => tab.id !== idToRemove);
    setTabs(newTabs);
    if (activeTab === idToRemove) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTab = (id: string, updates: Partial<EditorTab>) => {
    setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (tabs.some(tab => !tab.content.trim())) {
        toast({ variant: 'destructive', title: 'Empty Pasty', description: 'Cannot save empty content.' });
        setIsLoading(false);
        return;
      }

      let dataToSave = tabs.map(({ id, ...rest }) => rest);
      let url = '';

      if (isEncrypted) {
        const key = await generateKey();
        const encryptedTabs = await Promise.all(
          dataToSave.map(async (tab) => ({
            ...tab,
            content: await encrypt(tab.content, key),
          }))
        );
        dataToSave = encryptedTabs;
        const { id } = await createPaste(dataToSave, Number(expiration), true);
        const b64Key = await keyToBase64(key);
        url = `/p/${id}#key=${b64Key}`;
      } else {
        const { id } = await createPaste(dataToSave, Number(expiration), false);
        url = `/p/${id}`;
      }

      setShareUrl(window.location.origin + url);

    } catch (error) {
      console.error('Failed to save paste:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save paste. Connection lost.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (tabs.length === 0) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl neon-text">New Transmission</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative">
            <div className="flex items-end border-b border-border">
              <TabsList className="bg-transparent p-0 border-0 rounded-none">
                {tabs.map((tab) => (
                  <div key={tab.id} className="relative group">
                    <TabsTrigger
                      value={tab.id}
                      className="pr-8 data-[state=active]:bg-card/50 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    >
                      {tab.name || 'Untitled'}
                    </TabsTrigger>
                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTab(tab.id);
                        }}
                        className="absolute top-1/2 right-1 -translate-y-1/2 p-0.5 rounded hover:bg-destructive/50 opacity-50 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${tab.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                  </div>
                ))}
              </TabsList>
              <Button variant="ghost" size="sm" onClick={handleAddTab} className="ml-2 mb-1">
                <Plus className="w-4 h-4 mr-2" /> Add Pasty
              </Button>
            </div>

            {tabs.map((tab, index) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${tab.id}`}>Filename</Label>
                    <Input
                      id={`name-${tab.id}`}
                      value={tab.name}
                      onChange={(e) => updateTab(tab.id, { name: e.target.value })}
                      placeholder="e.g., script.js"
                      className="font-mono"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`lang-${tab.id}`}>Language</Label>
                    <Select
                      value={tab.lang}
                      onValueChange={(value) => updateTab(tab.id, { lang: value })}
                    >
                      <SelectTrigger id={`lang-${tab.id}`}>
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 self-end">
                     <SyntaxFixerButton
                        code={tab.content}
                        language={tab.lang}
                        onFixed={(fixedCode) => updateTab(tab.id, { content: fixedCode })}
                     />
                  </div>
                </div>
                <Textarea
                  value={tab.content}
                  onChange={(e) => updateTab(tab.id, { content: e.target.value })}
                  className="min-h-[400px] font-code bg-black/50 text-base"
                  placeholder="> Paste your code here..."
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="grid grid-cols-2 md:flex md:items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch id="encryption" checked={isEncrypted} onCheckedChange={setIsEncrypted} />
              <Label htmlFor="encryption" className="flex items-center gap-2">
                Encrypt
              </Label>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto neon-glow transition-all hover:shadow-lg hover:shadow-primary/50">
            {isLoading ? 'Transmitting...' : 'Create Paste'}
          </Button>
        </CardFooter>
      </Card>
      {shareUrl && (
        <ShareDialog
          url={shareUrl}
          onOpenChange={(open) => {
            if (!open) setShareUrl(null);
          }}
        />
      )}
    </>
  );
}
