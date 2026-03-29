// api/communicationTriggers.js
// Auto-send logic for grade-triggered parent communications.
// Called by store.js updateGrade() after writing to Supabase.
//
// IMPORTANT: This file runs server-side (called from within /api/ routes).
// It uses process.env.ANTHROPIC_API_KEY — NOT import.meta.env.
// It calls Anthropic directly (server-to-server is fine) rather than
// routing through the /api/ai proxy (which would be an HTTP loop).

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL         = 'claude-sonnet-4-20250514'

// ─── Default trigger settings (used if teacher hasn't configured yet) ─────────
export const DEFAULT_TRIGGER_SETTINGS = {
  missingAssignment:   false,
  anyGradePosted:      false,
  dfOnAssignment:      true,   // D or F on any single assignment
  dfOverallGrade:      true,   // D or F overall class grade
  letterGradeChange:   true,   // grade letter changes (up or down)
  preferredChannel:    'email', // 'email' | 'sms' | 'both'
  preferredLanguage:   'en',   // 'en' | 'es' (more to come)
}

// ─── Letter grade helper ───────────────────────────────────────────────────────
export function getLetter(pct) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

// ─── Server-side Anthropic helper ─────────────────────────────────────────────
// FIXED: uses process.env.ANTHROPIC_API_KEY (server env), not import.meta.env
async function callAnthropic(messages, system, max_tokens = 300) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[communicationTriggers] ANTHROPIC_API_KEY not set — skipping AI draft')
    return null
  }
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens, system, messages }),
    })
    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch (err) {
    console.error('[communicationTriggers] Anthropic call failed:', err.message)
    return null
  }
}

// ─── Translate message via Claude (server-side) ───────────────────────────────
async function translateMessage(text, targetLang) {
  if (targetLang === 'en' || !targetLang) return text
  const langNames = { es: 'Spanish', fr: 'French', zh: 'Chinese', pt: 'Portuguese', ar: 'Arabic' }
  const langName  = langNames[targetLang] || targetLang

  const result = await callAnthropic(
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

  return callAnthropic(
    [{ role: 'user', content: `Write a parent notification: ${situation}.` }],
    `You write school-to-parent communications for ${teacherName}. ${lengthGuide} Return only the message text.`,
    200
  )
}

// ─── Main trigger function — call this from store.updateGrade() ───────────────
// params: { student, assignment, newScore, oldScore, classGrade, oldClassGrade,
//           teacherSettings, teacherName, teacherEmail, schoolName }
export async function checkAndFireTriggers({
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
      const r = await fetch('/api/send-parent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      const r = await fetch('/api/send-parent-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: student.parentPhone, message: smsText }),
      })
      results.sms = await r.json()
    } catch (err) {
      results.sms = { error: err.message }
    }
  }

  return { fired: true, trigger: trigger.type, draft, results }
}

// ─── Supabase SQL to run once ─────────────────────────────────────────────────
// Run this in your Supabase SQL editor:
//
// CREATE TABLE IF NOT EXISTS communication_settings (
//   id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   teacher_id          uuid REFERENCES teachers(id) ON DELETE CASCADE,
//   missing_assignment  boolean DEFAULT false,
//   any_grade_posted    boolean DEFAULT false,
//   df_on_assignment    boolean DEFAULT true,
//   df_overall_grade    boolean DEFAULT true,
//   letter_grade_change boolean DEFAULT true,
//   preferred_channel   text    DEFAULT 'email',  -- 'email' | 'sms' | 'both'
//   preferred_language  text    DEFAULT 'en',
//   created_at          timestamptz DEFAULT now(),
//   updated_at          timestamptz DEFAULT now(),
//   UNIQUE(teacher_id)
// );
//
// ALTER TABLE communication_settings ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Teachers can manage own settings"
//   ON communication_settings FOR ALL
//   USING (true) WITH CHECK (true);
