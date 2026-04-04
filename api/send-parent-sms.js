// api/send-parent-sms.js
// Twilio SMS — server-side only. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_PHONE_NUMBER to Vercel env vars to activate.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const accountSid  = process.env.TWILIO_ACCOUNT_SID
  const authToken   = process.env.TWILIO_AUTH_TOKEN
  const fromNumber  = process.env.TWILIO_PHONE_NUMBER

  // Graceful stub — returns success in demo mode so UI still works
  if (!accountSid || !authToken || !fromNumber) {
    console.log('[SMS STUB] Twilio not configured — would have sent:', req.body?.to, req.body?.message?.slice(0, 60))
    return res.status(200).json({ success: true, stub: true, message: 'SMS queued (Twilio not yet configured)' })
  }

  const { to, message } = req.body

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
