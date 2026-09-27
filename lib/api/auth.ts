import { createClient } from '@supabase/supabase-js'

export async function getAccessToken() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Admin authentication is not configured')
  const supabase = createClient(url, key)
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
