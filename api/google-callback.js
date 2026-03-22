// api/google-callback.js
// Handles redirect from Google after teacher approves access.
// Exchanges auth code for tokens, stores in Supabase, redirects to app.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL       || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { code, state: teacherId, error } = req.query

  // Google OAuth error (user denied access)
  if (error) {
    console.error('Google OAuth error:', error)
    return res.redirect(`${getAppUrl()}?classroom_error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return res.redirect(`${getAppUrl()}?classroom_error=no_code`)
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI || 'https://gradeflow-omega.vercel.app/api/google-callback'

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }).toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Token exchange error:', err)
      return res.redirect(`${getAppUrl()}?classroom_error=token_exchange_failed`)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokens

    const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString()

    // Store tokens in Supabase
    // If teacherId is 'demo-teacher', store under a known demo ID
    const storedTeacherId = teacherId === 'demo-teacher'
      ? '00000000-0000-0000-0000-000000000001'
      : teacherId

    const { error: dbError } = await supabase
      .from('google_tokens')
      .upsert({
        teacher_id:    storedTeacherId,
        access_token,
        refresh_token: refresh_token || null,
        expires_at:    expiresAt,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'teacher_id' })

    if (dbError) {
      console.error('Supabase store error:', dbError)
      // Still redirect back — sync might still work with token in session
    }

    // Redirect back to app with success flag
    return res.redirect(`${getAppUrl()}?classroom_connected=true`)

  } catch (err) {
    console.error('Callback error:', err)
    return res.redirect(`${getAppUrl()}?classroom_error=server_error`)
  }
}

function getAppUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://gradeflow-omega.vercel.app'
}
