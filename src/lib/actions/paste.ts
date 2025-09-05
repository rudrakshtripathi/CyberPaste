'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';

// Use a simple in-memory Map to store pastes
const pastes = new Map<string, StoredPaste>();

function cleanupExpiredPastes() {
  const now = Date.now();
  for (const [id, paste] of pastes.entries()) {
    if (paste.expiresAt && paste.expiresAt < now) {
      pastes.delete(id);
    }
  }
}

export async function createPaste(
  tabs: StoredTab[],
  ttl: number, // in seconds
  encrypted: boolean
): Promise<{ id: string }> {
  cleanupExpiredPastes();

  const id = generateId();
  const now = Date.now();
  const expiresAt = ttl > 0 ? now + ttl * 1000 : null;

  const newPaste: StoredPaste = {
    id,
    createdAt: now,
    ttl,
    encrypted,
    views: 0,
    tabs,
    expiresAt,
  };

  pastes.set(id, newPaste);
  revalidatePath('/'); // Revalidate the home page to update the active paste count
  return { id };
}

export async function getPaste(id: string): Promise<StoredPaste | null> {
  const paste = pastes.get(id);

  if (!paste) {
    return null;
  }

  // Check for expiration on access
  if (paste.expiresAt && paste.expiresAt < Date.now()) {
    pastes.delete(id);
    revalidatePath('/');
    return null;
  }

  return { ...paste }; // Return a copy to avoid mutation
}


export async function incrementPasteViews(id: string): Promise<number> {
    const paste = pastes.get(id);
    if (paste) {
        paste.views += 1;
        pastes.set(id, paste);
        revalidatePath('/');
        revalidatePath(`/p/${id}`);
        return paste.views;
    }
    return 0;
}


export async function getActivePasteCount(): Promise<number> {
  cleanupExpiredPastes();
  return pastes.size;
}