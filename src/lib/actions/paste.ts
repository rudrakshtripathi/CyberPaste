'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

const db = getDb();
const pastesCollection = db.collection('pastes');

async function cleanupExpiredPastes() {
  const now = Date.now();
  const snapshot = await pastesCollection.where('expiresAt', '<', now).get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    // We only delete if it's not a permanent paste (ttl > 0)
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

  const newPaste: StoredPaste = {
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
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  const paste = docSnap.data() as StoredPaste;

  // Check for expiration
  if (paste.expiresAt && paste.expiresAt < Date.now()) {
    await docRef.delete(); // Clean up expired paste on access
    revalidatePath('/');
    return null;
  }
  
  return paste;
}

export async function incrementPasteViews(id: string): Promise<number> {
    const docRef = pastesCollection.doc(id);
    
    // We run a transaction to safely increment the views.
    const newViews = await db.runTransaction(async (transaction) => {
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists) {
            return 0; // Paste doesn't exist
        }
        const currentViews = docSnap.data()?.views || 0;
        const newCount = currentViews + 1;
        transaction.update(docRef, { views: newCount });
        return newCount;
    });

    revalidatePath('/');
    revalidatePath(`/p/${id}`);
    return newViews;
}

export async function getActivePasteCount(): Promise<number> {
    await cleanupExpiredPastes();
    const snapshot = await pastesCollection.get();
    return snapshot.size;
}