'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';

// In-memory store for pastes
const pastes = new Map<string, StoredPaste>();

async function cleanupExpiredPastes() {
  const now = Date.now();
  for (const [id, paste] of pastes.entries()) {
    if (paste.ttl > 0 && paste.createdAt + paste.ttl * 1000 < now) {
      pastes.delete(id);
    }
  }
}

export async function createPaste(
  tabs: StoredTab[],
  ttl: number, // in seconds
  encrypted: boolean
): Promise<{ id: string }> {
  await cleanupExpiredPastes();

  const id = generateId();
  const now = Date.now();

  const newPaste: StoredPaste = {
    id,
    createdAt: now,
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

  // Check for expiration
  if (paste.ttl > 0 && paste.createdAt + paste.ttl * 1000 < Date.now()) {
    pastes.delete(id); // Clean up expired paste on access
    revalidatePath('/');
    return null;
  }
  
  return paste;
}

export async function incrementPasteViews(id: string): Promise<number> {
    const paste = pastes.get(id);
    if (!paste) {
        // This case should ideally not be hit if getPaste is called first.
        // Silently fail to avoid crashing the client view.
        return 0;
    }
    const updatedPaste = { ...paste, views: paste.views + 1 };
    pastes.set(id, updatedPaste);
    revalidatePath('/'); // Revalidate to update active paste count in header
    revalidatePath(`/p/${id}`); // Revalidate the paste page itself
    return updatedPaste.views;
}

export async function getActivePasteCount(): Promise<number> {
    await cleanupExpiredPastes();
    return pastes.size;
}
