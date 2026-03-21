// api/ai.js
// ─── GradeFlow AI Backend Proxy ───────────────────────────────────────────────
// Sits between the browser and Anthropic.
// The API key NEVER touches the frontend — it lives only in Vercel env vars.
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL         = 'claude-sonnet-4-20250514'

// ── Simple rate limiting (in-memory, resets on cold start) ────────────────────
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX        = 20

function checkRateLimit(ip) {
  const now   = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  rateLimitMap.set(ip, entry)
  return true
}

// ── Build Anthropic request body by intent ────────────────────────────────────
function buildRequestBody(intent, body) {
  const base = { model: MODEL }

  switch (intent) {

    case 'general': {
      const { system, prompt, max_tokens = 1000 } = body
      return {
        ...base, max_tokens,
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content: prompt }],
      }
    }

    case 'search': {
      const { system, prompt, max_tokens = 1000 } = body
      return {
        ...base, max_tokens,
        ...(system ? { system } : {}),
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }
    }

    case 'grade': {
      const { imageBase64, mediaType = 'image/jpeg', assignmentName = 'Unknown', answerKey = '' } = body
      return {
        ...base, max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            {
              type: 'text',
              text: `Grade this paper.${answerKey ? ` Answer key: ${answerKey}` : ''} Assignment: ${assignmentName}

Return ONLY valid JSON:
{
  "score": 85,
  "grade": "B",
  "feedback": "...",
  "corrections": [{ "question": 1, "studentAnswer": "...", "correctAnswer": "...", "points": -5 }]
}`,
            },
          ],
        }],
      }
    }

    case 'extractRoster': {
      const { imageBase64, mediaType = 'image/jpeg' } = body
      return {
        ...base, max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            { type: 'text', text: 'Extract all student names from this roster. Return ONLY valid JSON: {"students":[{"name":"","id":""}]}' },
          ],
        }],
      }
    }

    case 'extractAnswers': {
      const { imageBase64, mediaType = 'image/jpeg' } = body
      return {
        ...base, max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            { type: 'text', text: 'Extract the answer key from this document. Return ONLY valid JSON: {"answers":[{"question":1,"answer":"A"}]}' },
          ],
        }],
      }
    }

    case 'lessonPlan': {
      const { subject, grade, topic, duration = 50, standards = '' } = body
      return {
        ...base, max_tokens: 2000,
        system: 'You are an expert curriculum designer. Generate detailed, practical lesson plans.',
        messages: [{
          role: 'user',
          content: `Generate a ${duration}-minute lesson plan for:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
${standards ? `Standards: ${standards}` : ''}

Return ONLY valid JSON:
{
  "title": "",
  "objective": "",
  "materials": [],
  "warmup": { "duration": 5, "activity": "" },
  "instruction": { "duration": 20, "steps": [] },
  "practice": { "duration": 15, "activity": "" },
  "assessment": { "duration": 10, "method": "" },
  "homework": ""
}`,
        }],
      }
    }

    case 'studyTips': {
      const { studentName, subject, score, recentGrades = [] } = body
      const gradesText = recentGrades.length
        ? recentGrades.map(g => `${g.assignment}: ${g.score ?? 'ungraded'}`).join(', ')
        : 'No recent grades available'
      return {
        ...base, max_tokens: 800,
        system: 'You are a supportive academic coach. Give practical, encouraging, specific study tips.',
        messages: [{
          role: 'user',
          content: `Generate personalized study tips for this student:
Name: ${studentName}
Subject: ${subject}
Current Grade: ${score}%
Recent assignments: ${gradesText}

Return ONLY valid JSON with this exact structure:
{
  "tip": "One encouraging summary sentence about their progress",
  "actions": ["Specific action 1", "Specific action 2", "Specific action 3", "Specific action 4", "Specific action 5"],
  "timeEstimate": "X hours per week"
}`,
        }],
      }
    }

    default:
      throw new Error(`Unknown intent: ${intent}`)
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set in environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { intent, ...rest } = req.body || {}

  if (!intent) {
    return res.status(400).json({ error: 'Missing required field: intent' })
  }

  let requestBody
  try {
    requestBody = buildRequestBody(intent, rest)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return res.status(response.status).json({
        error: data?.error?.message || 'Anthropic API error',
      })
    }

    return res.status(200).json(data)

  } catch (err) {
    console.error('AI proxy error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
