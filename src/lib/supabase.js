import { createClient } from '@supabase/supabase-js';

// Read env variables
const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If either is missing → demo mode
const isDemoMode = !url || !anon;

// Export a fake supabase client in demo mode
let supabase;

if (isDemoMode) {
  console.warn("⚠ Running in DEMO MODE — Supabase disabled.");

  supabase = {
    from() {
      return {
        select() {
          return Promise.resolve({ data: [], error: null });
        },
        insert() {
          return Promise.resolve({ data: null, error: null });
        },
        update() {
          return Promise.resolve({ data: null, error: null });
        },
        delete() {
          return Promise.resolve({ data: null, error: null });
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        single() {
          return Promise.resolve({ data: null, error: null });
        }
      };
    }
  };
} else {
  // Real Supabase client
  supabase = createClient(url, anon);
}

export { supabase, isDemoMode };
