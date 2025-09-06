
'use client';

import React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { EXPIRATION_OPTIONS } from '@/lib/constants';
import { Clock, Lock, Unlock, Plus } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isEncrypted: boolean;
  setIsEncrypted: (value: boolean) => void;
  setExpiration: (value: string) => void;
  onAddTab: () => void;
}

export function CommandPalette({
  open,
  setOpen,
  isEncrypted,
  setIsEncrypted,
  setExpiration,
  onAddTab,
}: CommandPaletteProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => setIsEncrypted(!isEncrypted))}>
            {isEncrypted ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            <span>{isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddTab)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Pasty (Tab)</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Expiration">
          {EXPIRATION_OPTIONS.map((opt) => (
            <CommandItem key={opt.value} onSelect={() => runCommand(() => setExpiration(opt.value))}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Set Expiration: {opt.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
