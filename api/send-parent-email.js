// api/send-parent-email.js
// Secure server-side email via Resend — API key never reaches the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Resend API key not configured' })

  const {
    to,           // parent email
    subject,
    body,         // already translated if needed
    teacherName,
    teacherEmail, // used as Reply-To
    studentName,
    schoolName,
  } = req.body

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' })
  }

  // Build clean HTML from plain text body
  const htmlBody = body
    .split('\n')
    .map(line => line.trim() ? `<p style="margin:0 0 12px;line-height:1.6;">${line}</p>` : '')
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f6f8;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;borderRadius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#003057;padding:24px 28px;">
      <div style="color:#B3A369;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">
        ${schoolName || 'GradeFlow'}
      </div>
      <div style="color:#fff;font-size:20px;font-weight:800;">Message from ${teacherName || 'Your Teacher'}</div>
    </div>
    <!-- Body -->
    <div style="padding:28px;color:#1a2035;font-size:15px;">
      ${htmlBody}
    </div>
    <!-- Footer -->
    <div style="background:#f4f6f8;padding:16px 28px;font-size:11px;color:#6b7494;border-top:1px solid #e8ecf0;">
      This message was sent via GradeFlow on behalf of ${teacherName || 'your teacher'}.
      Reply directly to this email to reach them.
      ${studentName ? `<br>Regarding: ${studentName}` : ''}
    </div>
  </div>
</body>
</html>`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     'GradeFlow <notifications@gradeflow.app>',
        reply_to: teacherEmail || undefined,
        to:       [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Resend error:', err)
      return res.status(response.status).json({ error: 'Failed to send email', detail: err })
    }

    const data = await response.json()
    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    console.error('Email send error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
