'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';

// In-memory store for pastes. This will be reset on every server restart.
const pastes = new Map<string, StoredPaste>();

function cleanupExpiredPastes() {
  const now = Date.now();
  for (const [id, paste] of pastes.entries()) {
    // Check if TTL is set (not 0) and if it has expired
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
  // Clean up expired pastes before creating a new one
  cleanupExpiredPastes();

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
  revalidatePath('/'); // Update the active paste count in the header
  return { id };
}

export async function getPaste(id: string): Promise<StoredPaste | null> {
  // It's good practice to run cleanup on read as well
  cleanupExpiredPastes();

  const paste = pastes.get(id);

  if (!paste) {
    return null;
  }

  // Increment view count
  paste.views += 1;
  pastes.set(id, paste);

  return paste;
}

export async function getActivePasteCount(): Promise<number> {
  cleanupExpiredPastes();
  return pastes.size;
}
