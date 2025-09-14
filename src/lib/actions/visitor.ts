'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // service key (server only)
const supabase = createClient(supabaseUrl, supabaseKey);

const VISITOR_COUNT_OFFSET = 452;

/**
 * Increment and get visitor count
 */
export async function getVisitorCount(): Promise<number> {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('increment_visitor_count');

    if (rpcErr) {
        console.error('Error incrementing visitor count:', rpcErr);
        // Fallback to fetching current count if RPC fails
        const { data, error } = await supabase
            .from('visitors')
            .select('count')
            .single();
        
        if (error || !data) {
            console.error('Error fetching visitor count:', error);
            return 0 + VISITOR_COUNT_OFFSET;
        }
        return data.count + VISITOR_COUNT_OFFSET;
    }

    return rpcData + VISITOR_COUNT_OFFSET;
}
