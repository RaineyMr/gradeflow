const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

// Base call — no web search, used for generation tasks
async function callClaude(prompt, systemPrompt = '', maxTokens = 1500) {
  if (!ANTHROPIC_KEY) {
    throw new Error('No Anthropic API key. Add VITE_ANTHROPIC_KEY to your Vercel environment variables.')
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// Web search call — uses Claude's web_search tool to pull live results
async function callClaudeWithSearch(prompt, maxTokens = 1500) {
  if (!ANTHROPIC_KEY) {
    throw new Error('No Anthropic API key. Add VITE_ANTHROPIC_KEY to your Vercel environment variables.')
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }
  const data = await response.json()
  // Collect all text blocks from the response (web search may return multiple)
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
  return text
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    // Try to find a JSON array or object inside the text
    const arrMatch = text.match(/\[[\s\S]*\]/)
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (arrMatch) { try { return JSON.parse(arrMatch[0]) } catch {} }
    if (objMatch) { try { return JSON.parse(objMatch[0]) } catch {} }
    return null
  }
}

// ─── Lesson Plan ──────────────────────────────────────────────────────────────

export async function generateLessonPlan({ subject, grade, topic, standard, state, textbook }) {
  const context = [
    state && `State: ${state}`,
    textbook && `Textbook: ${textbook}`,
    standard && `Standard: ${standard}`
  ].filter(Boolean).join(', ')

  const text = await callClaude(
    `Generate a complete lesson plan for:
Subject: ${subject}, Grade: ${grade}, Topic: ${topic}${context ? ', ' + context : ''}

Return ONLY valid JSON with these exact keys (no markdown, no extra text):
{"summary":"2-3 sentence plain summary","objectives":["obj1","obj2","obj3"],"standards":"Standard code and description","swbat":["Students will be able to...1","...2"],"successCriteria":["criteria1","criteria2"],"supplies":["supply1","supply2"],"steps":["Step 1: ...","Step 2: ...","Step 3: ...","Step 4: ...","Step 5: ..."],"worksheet":"Brief worksheet description","exitTicket":"Exit ticket question"}`
  )
  const result = parseJSON(text)
  if (!result) throw new Error('AI returned an unexpected response. Please try again.')
  return result
}

// ─── Autocomplete — web search powered ───────────────────────────────────────

export async function suggestTextbooks({ state, subject, grade }) {
  if (!state || !subject || !grade) return []
  try {
    const text = await callClaudeWithSearch(
      `Search for the most commonly state-adopted or widely used textbooks for ${subject} in ${grade} in ${state} public schools.
      
After searching, return ONLY a valid JSON array of up to 6 textbook names with publishers, like:
["Go Math! Grade 3 — Houghton Mifflin Harcourt", "Eureka Math Grade 3 — Great Minds"]

No markdown. No extra text. Just the JSON array.`
    )
    return parseJSON(text) || []
  } catch {
    return []
  }
}

export async function suggestTopics({ state, subject, grade, textbook }) {
  if (!subject || !grade) return []
  try {
    const query = textbook
      ? `Search for the table of contents or chapter list for "${textbook}" to find the specific lessons and topics it covers.`
      : `Search for the typical ${grade} ${subject} curriculum topics and chapter titles used in ${state || 'US'} schools.`

    const text = await callClaudeWithSearch(
      `${query}

Return ONLY a valid JSON array of up to 8 specific lesson or chapter topics, like:
["Chapter 3: Adding Fractions with Like Denominators", "Lesson 4.2: Comparing Decimals"]

No markdown. No extra text. Just the JSON array.`
    )
    return parseJSON(text) || []
  } catch {
    return []
  }
}

export async function suggestStandards({ state, subject, grade, topic }) {
  if (!state || !topic) return []
  try {
    const text = await callClaudeWithSearch(
      `Search for the official ${state} state academic standards${state === 'Texas' ? ' (TEKS)' : ''} for ${grade} ${subject} that apply to the lesson topic: "${topic}".

Return ONLY a valid JSON array of up to 4 specific standard codes with descriptions, like:
["TEKS 3.3A — Represent fractions greater than zero and less than or equal to one", "CCSS.MATH.3.NF.A.1 — Understand a fraction 1/b"]

No markdown. No extra text. Just the JSON array.`
    )
    return parseJSON(text) || []
  } catch {
    return []
  }
}

// ─── Parent Messages ──────────────────────────────────────────────────────────

export async function generateParentMessage({ studentName, subject, score, trigger, teacherName, tone = 'warm' }) {
  const text = await callClaude(
    `Write a parent message for teacher ${teacherName}.
Student: ${studentName}, Subject: ${subject}, Situation: ${trigger}, Score: ${score}, Tone: ${tone}

Return ONLY valid JSON (no markdown):
{"negative":"Concerning message 2-3 sentences","positive":"Positive/encouraging version 2-3 sentences","toneLabel":"${tone}"}`
  )
  const result = parseJSON(text)
  if (!result) throw new Error('AI returned an unexpected response.')
  return result
}

// ─── Grading ──────────────────────────────────────────────────────────────────

export async function gradeShortAnswer({ question, studentAnswer, rubric }) {
  const text = await callClaude(
    `Grade this student response:
Question: ${question}
Student Answer: ${studentAnswer}
Rubric: ${rubric || 'Use best judgment'}

Return ONLY valid JSON:
{"score":85,"maxScore":100,"feedback":"Brief specific feedback","confidence":"high|medium|low","needsReview":false}`
  )
  return parseJSON(text)
}

// ─── Study Tips ───────────────────────────────────────────────────────────────

export async function generateStudyTips({ studentName, subject, score, recentGrades }) {
  const text = await callClaude(
    `Personalized study tips for:
Student: ${studentName}, Subject: ${subject}, Score: ${score}%, Recent: ${JSON.stringify(recentGrades)}

Return ONLY valid JSON:
{"tip":"Main recommendation 1-2 sentences","actions":["Action 1","Action 2","Action 3"],"timeEstimate":"e.g. 15 min/day"}`
  )
  return parseJSON(text)
}

// ─── Test Questions ───────────────────────────────────────────────────────────

export async function generateTestQuestions({ subject, grade, topic, count = 10 }) {
  const text = await callClaude(
    `Generate ${count} multiple choice test questions for:
Subject: ${subject}, Grade: ${grade}, Topic: ${topic}

Return ONLY a valid JSON array:
[{"type":"multiple_choice","question":"Question text?","options":["A) option","B) option","C) option","D) option"],"answer":"A","points":10}]`
  )
  return parseJSON(text) || []
}
