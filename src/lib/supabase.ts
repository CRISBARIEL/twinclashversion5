import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getOrCreateClientId(): string {
  const stored = localStorage.getItem('client_id');
  if (stored) return stored;

  const newId = crypto.randomUUID();
  localStorage.setItem('client_id', newId);
  return newId;
}
