import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppwwkvbwhtzzderaxdon.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function getConnection() {
  return supabase;
}

export default supabase; 