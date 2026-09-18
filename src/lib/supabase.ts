import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Only create a real client if both env vars look valid.
// This prevents the "Invalid supabaseUrl" crash when credentials are not yet configured.
function createSupabaseClient(): SupabaseClient {
  if (supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  // Return a no-op proxy that mimics the Supabase client surface.
  // All calls will resolve to empty data so the app renders without crashing.
  // Replace the env vars in .env.local with real Supabase credentials to enable auth.
  const noop = () => ({
    data: { user: null, session: null },
    error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'),
  })
  const chain = () => ({ select: chain, eq: chain, maybeSingle: noop, upsert: noop })
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: {}, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: {}, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: () => chain(),
  } as unknown as SupabaseClient
}

export const supabase = createSupabaseClient()
