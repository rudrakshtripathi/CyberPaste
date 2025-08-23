'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { getPastesCollection } from '@/lib/lib/mongodb';
import { ObjectId } from 'mongodb';

// Document shape we store in Mongo
interface PasteDocument {
  _id: ObjectId;
  customId: string;
  createdAt: Date;
  expiresAt: Date | null;
  ttl: number; // seconds, 0 for never
  views: number;
  encrypted: boolean;
  tabs: StoredTab[];
}

// Convert a PasteDocument from Mongo to a StoredPaste for the app
function fromDocument(doc: PasteDocument): StoredPaste {
  return {
    id: doc.customId,
    createdAt: doc.createdAt.getTime(),
    ttl: doc.ttl,
    views: doc.views,
    encrypted: doc.encrypted,
    tabs: doc.tabs,
  };
}

export async function createPaste(
  tabs: StoredTab[],
  ttl: number, // in seconds
  encrypted: boolean
): Promise<{ id: string }> {
  const collection = await getPastesCollection();
  const id = generateId();
  const now = new Date();

  const newPaste: Omit<PasteDocument, '_id'> = {
    customId: id,
    createdAt: now,
    expiresAt: ttl > 0 ? new Date(now.getTime() + ttl * 1000) : null,
    ttl,
    encrypted,
    views: 0,
    tabs,
  };

  await collection.insertOne({ ...newPaste, _id: new ObjectId() });

  // No need to call cleanup here, Mongo's TTL index handles it automatically.
  
  revalidatePath('/');
  return { id };
}

export async function getPaste(id: string): Promise<StoredPaste | null> {
  const collection = await getPastesCollection();
  
  // Mongo's TTL index will have already removed expired documents.
  // No need for a manual time check here.
  const doc = await collection.findOneAndUpdate(
    { customId: id },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  );

  if (!doc) {
    return null;
  }

  return fromDocument(doc as PasteDocument);
}

export async function getActivePasteCount(): Promise<number> {
  try {
    const collection = await getPastesCollection();
    // This will count all non-expired documents.
    return await collection.countDocuments();
  } catch (error) {
    console.error('Failed to get active paste count:', error);
    // In case of a database connection error, we don't want to crash the whole app.
    // The header will just show 0 pastes.
    return 0;
  }
}
