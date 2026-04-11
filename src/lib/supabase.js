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
          return {
            eq() {
              return this;
            },
            order() {
              return this;
            },
            single() {
              return Promise.resolve({ data: null, error: null });
            },
            then(resolve) {
              // Handle the full chain like .from('schools').select('*')
              return Promise.resolve({ data: [], error: null }).then(resolve);
            }
          };
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
    },
    // Add auth methods for demo mode
    auth: {
      signInWithOAuth: async ({ provider }) => {
        console.log(`🔗 Demo: Simulating ${provider} OAuth flow`);
        return {
          data: { provider, url: '#' },
          error: null
        };
      },
      getSession: async () => {
        // Return a mock session for demo purposes
        return {
          data: {
            session: {
              user: {
                id: 'demo-oauth-user',
                email: 'demo.teacher@houstonsd.org',
                user_metadata: {
                  full_name: 'Demo Teacher',
                  avatar_url: 'https://ui-avatars.com/api/?name=Demo+Teacher&background=4285F4&color=fff'
                }
              }
            }
          },
          error: null
        };
      },
      signOut: async () => {
        console.log('🔓 Demo: Signed out');
        return { error: null };
      },
      onAuthStateChange: () => {
        // Return unsubscribe function
        return () => {};
      }
    }
  };
} else {
  // Real Supabase client
  supabase = createClient(url, anon);
}

export { supabase, isDemoMode };
