import { createClient } from '@supabase/supabase-js';

// Read env variables
const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!url) {
  throw new Error(
    'VITE_SUPABASE_URL is required. Please check your .env.local file.\n' +
    'Copy .env.local.example to .env.local and add your Supabase URL.'
  );
}

if (!anon) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY is required. Please check your .env.local file.\n' +
    'Copy .env.local.example to .env.local and add your Supabase anon key.'
  );
}

// Create and export real Supabase client only
export const supabase = createClient(url, anon);
