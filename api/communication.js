// api/communication.js
// ─── Consolidated communication handler ────────────────────────────────────────
// Merges: communication.js + communicationTriggers.js
// Routes by `type` field:
//   POST with type='email' → Send email via Resend
//   POST with type='sms' → Send SMS via Twilio
//   POST with type='check-triggers' → Check & fire grade-triggered messages

// LLM Proxy Configuration
const LLM_PROXY_BASE_URL = process.env.LLM_PROXY_BASE_URL || 'https://api.anthropic.com/v1/messages'
const LLM_PROXY_API_KEY = process.env.LLM_PROXY_API_KEY || process.env.ANTHROPIC_API_KEY
const FALLBACK_ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const FALLBACK_MODEL = 'claude-sonnet-4-20250514'

// ─── Default trigger settings ─────────────────────────────────────────────────
const DEFAULT_TRIGGER_SETTINGS = {
  missingAssignment:   false,
  anyGradePosted:      false,
  dfOnAssignment:      true,   // D or F on any single assignment
  dfOverallGrade:      true,   // D or F overall class grade
  letterGradeChange:   true,   // grade letter changes (up or down)
  preferredChannel:    'email', // 'email' | 'sms' | 'both'
  preferredLanguage:   'en',   // 'en' | 'es' (more to come)
}

// ─── Letter grade helper ───────────────────────────────────────────────────────
function getLetter(pct) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

// ─── Server-side LLM helper with proxy support ───────────────────────────────
async function callLLM(messages, system, max_tokens = 300) {
  const model = 'openai/gpt-4o' // Use OpenAI for communication tasks
  console.log(`[communication] Using model: ${model}`)
  
  // Try proxy first
  if (process.env.LLM_PROXY_BASE_URL && process.env.LLM_PROXY_API_KEY) {
    try {
      const response = await fetch(`${process.env.LLM_PROXY_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_PROXY_API_KEY}`,
        },
        body: JSON.stringify({ model, max_tokens, messages }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[communication] Proxy success - model: ${model}`)
        return data.choices?.[0]?.message?.content || null
      } else {
        const error = await response.json()
        console.error(`[communication] Proxy error: ${response.status} - ${error?.error?.message || 'Unknown error'}`)
        
        // Don't fallback on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return null
        }
      }
    } catch (err) {
      console.error('[communication] Proxy call failed:', err.message)
    }
  }

  // Fallback to direct Anthropic if proxy fails or not configured
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(`[communication] Falling back to direct Anthropic API`)
    
    try {
      const res = await fetch(FALLBACK_ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: FALLBACK_MODEL, max_tokens, system, messages }),
      })
      const data = await res.json()
      return data.content?.[0]?.text || null
    } catch (err) {
      console.error('[communication] Fallback call failed:', err.message)
      return null
    }
  }

  console.warn('[communication] No LLM service available — skipping AI draft')
  return null
}

// ─── Translate message via Claude (server-side) ───────────────────────────────
async function translateMessage(text, targetLang) {
  if (targetLang === 'en' || !targetLang) return text
  const langNames = { es: 'Spanish', fr: 'French', zh: 'Chinese', pt: 'Portuguese', ar: 'Arabic' }
  const langName  = langNames[targetLang] || targetLang

  const result = await callLLM(
    [{ role: 'user', content: `Translate this school communication to ${langName}. Return only the translated text, no explanation:\n\n${text}` }],
    'You translate school communications accurately and naturally.',
    500
  )
  return result || text
}

// ─── Generate AI draft for a trigger (server-side) ────────────────────────────
async function generateDraft(trigger, studentName, subject, score, teacherName, channel) {
  const isShort = channel === 'sms'
  const lengthGuide = isShort
    ? 'Under 160 characters total. Very concise.'
    : 'Under 4 sentences. Warm and professional.'

  const triggerDescriptions = {
    dfOnAssignment:    `${studentName} scored ${score}% on a ${subject} assignment (D or F grade)`,
    dfOverallGrade:    `${studentName}'s overall ${subject} grade has dropped to ${score}% (D or F)`,
    letterGradeChange: `${studentName}'s ${subject} grade has changed to ${score}%`,
    missingAssignment: `${studentName} has a missing assignment in ${subject}`,
    anyGradePosted:    `${studentName} received ${score}% on a ${subject} assignment`,
  }

  const situation = triggerDescriptions[trigger] || `update about ${studentName} in ${subject}`

  return callLLM(
    [{ role: 'user', content: `Write a parent notification: ${situation}.` }],
    `You write school-to-parent communications for ${teacherName}. ${lengthGuide} Return only the message text.`,
    200
  )
}

// ─── Check and fire triggers ───────────────────────────────────────────────────
async function checkAndFireTriggers({
  student,
  assignment,
  newScore,
  oldScore,
  classGrade,
  oldClassGrade,
  teacherSettings = DEFAULT_TRIGGER_SETTINGS,
  teacherName     = 'Your Teacher',
  teacherEmail    = 'teacher@school.edu',
  schoolName      = 'GradeFlow',
}) {
  const settings = { ...DEFAULT_TRIGGER_SETTINGS, ...teacherSettings }
  const triggers = []

  const newLetter      = getLetter(newScore)
  const oldLetter      = oldScore != null ? getLetter(oldScore) : null
  const newClassLetter = getLetter(classGrade)
  const oldClassLetter = oldClassGrade != null ? getLetter(oldClassGrade) : null

  // 1. D or F on assignment
  if (settings.dfOnAssignment && (newLetter === 'D' || newLetter === 'F')) {
    triggers.push({ type: 'dfOnAssignment', score: newScore })
  }

  // 2. D or F overall class grade
  if (settings.dfOverallGrade && (newClassLetter === 'D' || newClassLetter === 'F')) {
    if (oldClassLetter !== newClassLetter) {
      triggers.push({ type: 'dfOverallGrade', score: classGrade })
    }
  }

  // 3. Letter grade change (up or down)
  if (settings.letterGradeChange && oldLetter && newLetter !== oldLetter) {
    triggers.push({ type: 'letterGradeChange', score: newScore })
  }

  // 4. Any grade posted
  if (settings.anyGradePosted) {
    triggers.push({ type: 'anyGradePosted', score: newScore })
  }

  if (triggers.length === 0) return { fired: false }

  // Use highest-priority trigger only (avoid spamming)
  const priority = ['dfOverallGrade', 'dfOnAssignment', 'letterGradeChange', 'anyGradePosted']
  const trigger  = triggers.sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type))[0]

  // Generate draft
  const draftEn = await generateDraft(
    trigger.type,
    student.name,
    assignment?.subject || 'class',
    trigger.score,
    teacherName,
    settings.preferredChannel,
  )

  if (!draftEn) return { fired: false, reason: 'Draft generation failed' }

  // Translate if needed
  const lang  = settings.preferredLanguage || 'en'
  const draft = await translateMessage(draftEn, lang)

  const subject = `Update about ${student.name} — ${assignment?.subject || 'class'}`
  const channel = settings.preferredChannel

  const results = {}

  // Send email
  if ((channel === 'email' || channel === 'both') && student.parentEmail) {
    try {
      const r = await fetch('/api/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          to:          student.parentEmail,
          subject,
          body:        draft,
          teacherName,
          teacherEmail,
          studentName: student.name,
          schoolName,
        }),
      })
      results.email = await r.json()
    } catch (err) {
      results.email = { error: err.message }
    }
  }

  // Send SMS
  if ((channel === 'sms' || channel === 'both') && student.parentPhone) {
    // SMS draft is shorter — re-generate if needed
    const smsDraft = settings.preferredChannel === 'both'
      ? await generateDraft(trigger.type, student.name, assignment?.subject || 'class', trigger.score, teacherName, 'sms')
      : draft

    const smsText = await translateMessage(smsDraft || draft, lang)

    try {
      const r = await fetch('/api/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sms',
          to: student.parentPhone,
          message: smsText
        }),
      })
      results.sms = await r.json()
    } catch (err) {
      results.sms = { error: err.message }
    }
  }

  return { fired: true, trigger: trigger.type, draft, results }
}

// ─── Email handler ────────────────────────────────────────────────────────────
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

// ─── SMS handler ──────────────────────────────────────────────────────────────
async function handleSMS(req, res) {
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

// ─── Main router ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { type } = req.body

  if (type === 'email') {
    return handleEmail(req, res)
  } else if (type === 'sms') {
    return handleSMS(req, res)
  } else if (type === 'check-triggers') {
    return res.status(200).json(await checkAndFireTriggers(req.body))
  } else {
    return res.status(400).json({ error: 'Invalid communication type. Use "email", "sms", or "check-triggers"' })
  }
}

// ─── Export helpers for use from other api routes ────────────────────────────
export { checkAndFireTriggers, DEFAULT_TRIGGER_SETTINGS, getLetter }
