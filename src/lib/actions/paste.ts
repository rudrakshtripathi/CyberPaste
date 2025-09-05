'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { pastesCollection } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

async function cleanupExpiredPastes() {
  const now = Date.now();
  const snapshot = await pastesCollection.where('expiresAt', '<', now).get();
  if (snapshot.empty) {
    return;
  }
  
  const batch = pastesCollection.firestore.batch();
  snapshot.docs.forEach(doc => {
    // We only delete pastes with an expiration (ttl > 0).
    if (doc.data().ttl > 0) {
      batch.delete(doc.ref);
    }
  });
  await batch.commit();
}


export async function createPaste(
  tabs: StoredTab[],
  ttl: number, // in seconds
  encrypted: boolean
): Promise<{ id: string }> {
  await cleanupExpiredPastes();

  const id = generateId();
  const now = Date.now();
  const expiresAt = ttl > 0 ? now + ttl * 1000 : null;

  const newPaste: StoredPaste & { expiresAt: number | null } = {
    id,
    createdAt: now,
    ttl,
    encrypted,
    views: 0,
    tabs,
    expiresAt,
  };

  await pastesCollection.doc(id).set(newPaste);
  revalidatePath('/');
  return { id };
}

export async function getPaste(id: string): Promise<StoredPaste | null> {
  const docRef = pastesCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const paste = doc.data() as StoredPaste;
  
  // Check for expiration
  if (paste.ttl > 0 && paste.createdAt + paste.ttl * 1000 < Date.now()) {
    // The paste has expired, delete it and return null
    await docRef.delete();
    return null;
  }

  // Increment view count
  await docRef.update({ views: FieldValue.increment(1) });
  
  // Return the paste data (views will be the old value, which is fine)
  return paste;
}

export async function getActivePasteCount(): Promise<number> {
  try {
    await cleanupExpiredPastes();
    const snapshot = await pastesCollection.get();
    // We only count non-expired documents
    const now = Date.now();
    let count = 0;
    snapshot.forEach(doc => {
        const paste = doc.data() as StoredPaste;
        if (!paste.ttl || (paste.createdAt + paste.ttl * 1000) > now) {
            count++;
        }
    });
    return count;
  } catch (error) {
    console.error("Failed to get active paste count:", error);
    return 0; // Return 0 on error to avoid crashing the header
  }
}
