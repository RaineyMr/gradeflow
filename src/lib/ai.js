const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

async function callClaude(prompt, systemPrompt = '') {
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
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export async function generateLessonPlan({ subject, grade, topic, standard }) {
  const prompt = `Generate a complete lesson plan for:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
Standard/TEKS: ${standard || 'Not specified'}

Return ONLY a JSON object with these exact keys:
{
  "summary": "2-3 sentence plain summary",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "standards": "Standard code and description",
  "swbat": ["Students will be able to...1", "...2", "...3"],
  "successCriteria": ["Criteria 1", "Criteria 2"],
  "supplies": ["Supply 1", "Supply 2"],
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ..."],
  "worksheet": "Brief description of student worksheet",
  "exitTicket": "Exit ticket question"
}`
  const text = await callClaude(prompt)
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

export async function generateParentMessage({ studentName, subject, score, trigger, teacherName, tone = 'warm' }) {
  const prompt = `Write a parent message for a teacher.
Student: ${studentName}
Subject: ${subject}
Score/Situation: ${score}
Trigger: ${trigger}
Teacher: ${teacherName}
Tone: ${tone} and professional

Return ONLY a JSON object:
{
  "negative": "The concerning message text (2-3 sentences max)",
  "positive": "A positive/encouraging version of this same situation (2-3 sentences max)",
  "toneLabel": "${tone}"
}`
  const text = await callClaude(prompt)
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

export async function gradeShortAnswer({ question, studentAnswer, rubric }) {
  const prompt = `Grade this student response:
Question: ${question}
Student Answer: ${studentAnswer}
Rubric/Expected: ${rubric || 'Use your best judgment'}

Return ONLY a JSON object:
{
  "score": 85,
  "maxScore": 100,
  "feedback": "Brief specific feedback",
  "confidence": "high|medium|low",
  "needsReview": true or false
}`
  const text = await callClaude(prompt)
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

export async function generateStudyTips({ studentName, subject, score, recentGrades }) {
  const prompt = `Generate personalized study tips for a student.
Student: ${studentName}
Struggling subject: ${subject}
Current score: ${score}%
Recent grades: ${JSON.stringify(recentGrades)}

Return ONLY a JSON object:
{
  "tip": "Main personalized recommendation (1-2 sentences)",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "timeEstimate": "e.g. 15 min/day"
}`
  const text = await callClaude(prompt)
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

export async function generateTestQuestions({ subject, grade, topic, standard, count = 10, types = ['multiple_choice'] }) {
  const prompt = `Generate ${count} test questions for:
Subject: ${subject}, Grade: ${grade}, Topic: ${topic}
Question types: ${types.join(', ')}

Return ONLY a JSON array:
[
  {
    "type": "multiple_choice",
    "question": "Question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A",
    "points": 10
  }
]`
  const text = await callClaude(prompt)
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return []
  }
}
