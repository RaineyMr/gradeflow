const KEY = () => import.meta.env.VITE_ANTHROPIC_KEY
const MODEL = 'claude-sonnet-4-20250514'

async function post(body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`)
  return res.json()
}

export function parseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  try { const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

export async function callClaude(prompt, systemPrompt = '', maxTokens = 1000) {
  const data = await post({ model: MODEL, max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: prompt }] })
  return data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') || ''
}

export async function callClaudeWithSearch(prompt, maxTokens = 1000) {
  const data = await post({
    model: MODEL, max_tokens: maxTokens,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
  })
  return data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') || ''
}

export async function generateLessonPlan({ subject, grade, topic, standard, state = 'Texas', textbook }) {
  const prompt = `Create a complete lesson plan:
Subject: ${subject}, Grade: ${grade}, Topic: ${topic}
Standard: ${standard || 'auto-select from TEKS'}, State: ${state}
Textbook: ${textbook || 'generic'}

Return ONLY valid JSON:
{
  "title":"","summary":"","objectives":[],"standards":[],"swbat":[],
  "successCriteria":[],"supplies":[],"steps":[{"title":"","description":"","duration":""}],
  "worksheet":{"title":"","questions":[]},"exitTicket":{"question":"","sampleAnswer":""},
  "answerKey":[]
}`
  const text = await callClaudeWithSearch(prompt, 2500)
  return parseJSON(text)
}

export async function suggestTextbooks(subject, grade) {
  const text = await callClaudeWithSearch(`List 4 popular textbooks for ${subject} ${grade} grade. JSON: {"textbooks":["..."]}`, 400)
  return parseJSON(text)?.textbooks || []
}

export async function suggestTopics(subject, grade) {
  const text = await callClaudeWithSearch(`List 6 important lesson topics for ${subject} ${grade} grade. JSON: {"topics":["..."]}`, 400)
  return parseJSON(text)?.topics || []
}

export async function suggestStandards(subject, grade, state = 'Texas') {
  const text = await callClaudeWithSearch(`List 4 ${state} TEKS standards for ${subject} ${grade} grade. JSON: {"standards":["..."]}`, 400)
  return parseJSON(text)?.standards || []
}

export async function generateParentMessage({ studentName, subject, score, trigger, teacherName, tone = 'Warm & Friendly' }) {
  const prompt = `Write two parent messages for ${studentName}:
Subject: ${subject}, Score/Trigger: ${score || trigger}, Teacher: ${teacherName}
Tone: ${tone}
Return ONLY valid JSON:
{"negative":"...message expressing concern...","positive":"...message celebrating progress...","toneLabel":"${tone}"}`
  const text = await callClaude(prompt, 'You are a professional school communications assistant.', 600)
  return parseJSON(text) || { negative: '', positive: '', toneLabel: tone }
}

export async function gradeShortAnswer({ question, studentAnswer, rubric }) {
  const prompt = `Grade this short answer:
Question: ${question}
Student answer: ${studentAnswer}
Rubric: ${rubric || 'Standard accuracy-based rubric'}
Return ONLY valid JSON: {"score":0,"maxScore":10,"feedback":"","confidence":"high|medium|low","needsReview":false}`
  const text = await callClaude(prompt, 'You are an expert teacher grading student work.', 500)
  return parseJSON(text) || { score: 0, maxScore: 10, feedback: 'Could not grade.', confidence: 'low', needsReview: true }
}

export async function generateStudyTips({ studentName, subject, score, recentGrades = [] }) {
  const prompt = `Generate 3 study tips for ${studentName}:
Subject: ${subject}, Current score: ${score}%
Recent grades: ${recentGrades.join(', ')}
Return ONLY valid JSON: {"tips":[{"tip":"","actions":["",""],"timeEstimate":""}]}`
  const text = await callClaude(prompt, 'You are a supportive academic coach.', 600)
  return parseJSON(text)?.tips || []
}

export async function generateTestQuestions({ subject, grade, topic, count = 5 }) {
  const prompt = `Generate ${count} multiple choice questions for ${subject} ${grade} grade, topic: ${topic}.
Return ONLY valid JSON: {"questions":[{"text":"","options":{"A":"","B":"","C":"","D":""},"correct":"A","explanation":""}]}`
  const text = await callClaude(prompt, 'You are a curriculum expert.', 1500)
  return parseJSON(text)?.questions || []
}

export async function scanGradedDocument(base64Image, mediaType = 'image/jpeg') {
  const data = await post({
    model: MODEL, max_tokens: 800,
    system: 'You are an expert at reading graded school papers. Detect the scoring format and return valid JSON.',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
        { type: 'text', text: 'Grade this paper. Return ONLY valid JSON: {"studentName":"","score":0,"maxScore":100,"percentage":0,"format":"","feedback":"","confidence":"high|medium|low"}' },
      ],
    }],
  })
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || ''
  return parseJSON(text)
}
