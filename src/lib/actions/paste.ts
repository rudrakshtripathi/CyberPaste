'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { notFound } from 'next/navigation';

// In-memory store for pastes. Resets on server restart.
const pastes = new Map<string, StoredPaste>();

function cleanupExpiredPastes() {
  const now = Date.now();
  for (const [id, paste] of pastes.entries()) {
    if (paste.ttl > 0 && paste.createdAt + paste.ttl * 1000 < now) {
      pastes.delete(id);
    }
  }
}

export async function createPaste(
  tabs: StoredTab[],
  ttl: number,
  encrypted: boolean
): Promise<{ id: string }> {
  cleanupExpiredPastes();

  const id = generateId();
  const newPaste: StoredPaste = {
    id,
    createdAt: Date.now(),
    ttl,
    encrypted,
    views: 0,
    tabs,
  };

  pastes.set(id, newPaste);
  revalidatePath('/');
  return { id };
}

export async function getPaste(id: string): Promise<StoredPaste | null> {
  const paste = pastes.get(id);

  if (!paste) {
    return null;
  }

  const now = Date.now();
  if (paste.ttl > 0 && paste.createdAt + paste.ttl * 1000 < now) {
    pastes.delete(id);
    revalidatePath('/');
    return null;
  }

  paste.views += 1;
  pastes.set(id, paste);

  return { ...paste }; // Return a copy
}

export async function getActivePasteCount(): Promise<number> {
  cleanupExpiredPastes();
  return pastes.size;
}
