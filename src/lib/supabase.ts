import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
  throw new Error('Missing Supabase environment variables');
}

console.log('[Supabase] Initializing client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export function getOrCreateClientId(): string {
  const stored = localStorage.getItem('client_id');
  if (stored) return stored;

  const newId = crypto.randomUUID();
  localStorage.setItem('client_id', newId);
  return newId;
}
