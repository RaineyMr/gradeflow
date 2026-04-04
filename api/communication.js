// api/communication.js
// Combined email and SMS communication handler

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { type, ...payload } = req.body

  if (type === 'email') {
    return handleEmail(payload, res)
  } else if (type === 'sms') {
    return handleSMS(payload, res)
  } else {
    return res.status(400).json({ error: 'Invalid communication type. Use "email" or "sms"' })
  }
}

async function handleEmail(req, res) {
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
  } = req

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

async function handleSMS(req, res) {
  const accountSid  = process.env.TWILIO_ACCOUNT_SID
  const authToken   = process.env.TWILIO_AUTH_TOKEN
  const fromNumber  = process.env.TWILIO_PHONE_NUMBER

  // Graceful stub — returns success in demo mode so UI still works
  if (!accountSid || !authToken || !fromNumber) {
    console.log('[SMS STUB] Twilio not configured — would have sent:', req?.to, req?.message?.slice(0, 60))
    return res.status(200).json({ success: true, stub: true, message: 'SMS queued (Twilio not yet configured)' })
  }

  const { to, message } = req

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, message' })
  }

  // Enforce 160-char SMS limit
  const smsBody = message.slice(0, 160)

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type':  'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To:   to,
          Body: smsBody,
        }).toString(),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Twilio error:', err)
      return res.status(response.status).json({ error: 'Failed to send SMS', detail: err })
    }

    const data = await response.json()
    return res.status(200).json({ success: true, sid: data.sid })
  } catch (err) {
    console.error('SMS send error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
