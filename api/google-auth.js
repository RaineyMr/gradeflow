// api/google-auth.js
// Redirects teacher to Google OAuth consent screen
// Called when teacher clicks "Connect Google Classroom"

export default function handler(req, res) {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://gradeflow-omega.vercel.app/api/google-callback'

  if (!clientId) {
    return res.status(500).json({ error: 'Google Client ID not configured' })
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      'openid',
      'email',
      'profile',
    ].join(' '),
    access_type:   'offline',  // get refresh token
    prompt:        'consent',  // always show consent to get refresh token
    // Pass teacher ID via state so we know who to store tokens for
    state: req.query.teacherId || 'demo-teacher',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  res.redirect(authUrl)
}
