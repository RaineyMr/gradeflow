// Demo mode - Supabase disabled for local development
// import { createClient } from '@supabase/supabase-js'

// let supabase = null
// if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
//   supabase = createClient(
//     import.meta.env.VITE_SUPABASE_URL,
//     import.meta.env.VITE_SUPABASE_ANON_KEY
//   )
// }

// export { supabase }

// Demo fallback - all Supabase calls return empty/demo data
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    upsert: () => ({ data: [], error: null }),
    eq: () => ({ data: [], error: null }),
    order: () => ({ data: [], error: null }),
    single: () => ({ data: null, error: null }),
  }),
  auth: {
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    getSession: () => Promise.resolve({ data: { session: null } }),
  }
}
