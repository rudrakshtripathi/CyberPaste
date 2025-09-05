'use server';

import { revalidatePath } from 'next/cache';
import { StoredPaste, StoredTab } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // service key (server only)
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Map DB row + tabs into StoredPaste
 */
function mapPasteRow(row: any, tabs: any[]): StoredPaste {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    ttl: row.ttl,
    views: row.views,
    encrypted: row.encrypted,
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
    tabs: tabs.map((t) => ({
      name: t.name,
      lang: t.lang,
      content: t.content,
    })),
  };
}

/**
 * Create a new paste with tabs
 */
export async function createPaste(
  tabs: StoredTab[],
  ttl: number, // seconds
  encrypted: boolean
): Promise<{ id: string }> {
  const id = generateId(); // shortid (e.g. nanoid, shortid)
  const now = new Date();
  const expiresAt = ttl > 0 ? new Date(now.getTime() + ttl * 1000) : null;

  // Insert paste
  const { error: pasteErr } = await supabase.from('stored_pastes').insert({
    id,
    ttl,
    views: 0,
    encrypted,
    created_at: now.toISOString(),
    expires_at: expiresAt ? expiresAt.toISOString() : null,
  });
  if (pasteErr) throw pasteErr;

  // Insert tabs
  if (tabs.length > 0) {
    const { error: tabErr } = await supabase.from('stored_tabs').insert(
      tabs.map((t) => ({
        paste_id: id,
        name: t.name,
        lang: t.lang,
        content: t.content,
      }))
    );
    if (tabErr) throw tabErr;
  }

  revalidatePath('/');
  return { id };
}

/**
 * Get a paste with its tabs
 */
export async function getPaste(id: string): Promise<StoredPaste | null> {
  const { data: pasteRow, error: pasteErr } = await supabase
    .from('stored_pastes')
    .select('*')
    .eq('id', id)
    .single();
  if (pasteErr || !pasteRow) return null;

  // expiration check
  if (pasteRow.expires_at && new Date(pasteRow.expires_at).getTime() < Date.now()) {
    await supabase.from('stored_pastes').delete().eq('id', id);
    revalidatePath('/');
    return null;
  }

  const { data: tabs, error: tabErr } = await supabase
    .from('stored_tabs')
    .select('*')
    .eq('paste_id', id);
  if (tabErr) throw tabErr;

  return mapPasteRow(pasteRow, tabs || []);
}

/**
 * Increment views counter (atomic via RPC)
 */
export async function incrementPasteViews(id: string): Promise<number> {
  const { error: rpcErr } = await supabase.rpc('increment_views', { paste_id: id });
  if (rpcErr) throw rpcErr;

  const { data, error } = await supabase
    .from('stored_pastes')
    .select('views')
    .eq('id', id)
    .single();
  if (error || !data) return 0;

  revalidatePath('/');
  revalidatePath(`/p/${id}`);
  return data.views;
}

/**
 * Count active (non-expired) pastes
 */
export async function getActivePasteCount(): Promise<number> {
  const nowIso = new Date().toISOString();

  const { count, error } = await supabase
    .from('stored_pastes')
    .select('id', { count: 'exact', head: true })
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

  if (error) throw error;
  return count ?? 0;
}
