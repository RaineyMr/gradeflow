// src/lib/ai.js
// ─── GradeFlow Frontend AI Helper ────────────────────────────────────────────
// ALL AI calls go through this file.
// This file NEVER contains an API key — it calls /api/ai (your secure backend).
// ─────────────────────────────────────────────────────────────────────────────

const API_ENDPOINT = '/api/ai'

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function callProxy(intent, payload = {}) {
  const response = await fetch(API_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ intent, ...payload }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `API error ${response.status}`)
  }

  return data
}

// ── Parse text from Anthropic response ───────────────────────────────────────
function extractText(data) {
  if (!data?.content) return ''
  return data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

// ── Parse JSON from Anthropic response (strips markdown fences) ──────────────
function extractJSON(data) {
  const text  = extractText(data)
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 200)}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function callAI(prompt, system = '', max_tokens = 1000) {
  const data = await callProxy('general', { prompt, system, max_tokens })
  return extractText(data)
}

export async function callAIWithSearch(prompt, system = '', max_tokens = 1000) {
  const data = await callProxy('search', { prompt, system, max_tokens })
  return extractText(data)
}

export async function gradeWork(imageBase64, mediaType, assignmentName, answerKey = '') {
  const data = await callProxy('grade', { imageBase64, mediaType, assignmentName, answerKey })
  return extractJSON(data)
}

/**
 * Scan a graded paper and extract the student name + teacher-written score.
 * Used by Camera.jsx to read what the teacher already wrote on the paper.
 * 
 * Returns:
 * {
 *   studentName: string | null,
 *   earnedPoints: number | null,
 *   totalPoints: number | null,
 *   documentType: 'test' | 'quiz' | 'homework' | 'participation' | 'worksheet',
 *   assignmentTitle: string | null,
 *   confidence: 'high' | 'low',
 *   rawText: string (what the teacher wrote)
 * }
 */
export async function scanGradedDocument(imageBase64, mediaType) {
  const data = await callProxy('scanScore', { imageBase64, mediaType })
  return extractJSON(data)
}

export async function extractRoster(imageBase64, mediaType) {
  const data = await callProxy('extractRoster', { imageBase64, mediaType })
  return extractJSON(data)
}

export async function extractAnswers(imageBase64, mediaType) {
  const data = await callProxy('extractAnswers', { imageBase64, mediaType })
  return extractJSON(data)
}

export async function generateLessonPlan({ subject, grade, topic, duration = 50, standards = '' }) {
  const data = await callProxy('lessonPlan', { subject, grade, topic, duration, standards })
  return extractJSON(data)
}

/**
 * Generate personalized study tips for a student.
 * Returns: { tip: string, actions: string[], timeEstimate: string }
 */
export async function generateStudyTips({ studentName, subject, score, recentGrades = [] }) {
  const data = await callProxy('studyTips', { studentName, subject, score, recentGrades })
  return extractJSON(data)
}

/**
 * Extract student accommodation data from a roster document.
 * Accepts either an image/PDF (base64 + mediaType) or plain text content.
 *
 * Returns:
 * {
 *   students: [
 *     {
 *       name: string,
 *       accommodationType: 'IEP' | '504' | 'ELL' | 'Gifted' | 'Other',
 *       specificNeeds: string[],
 *       notes: string
 *     }
 *   ],
 *   noAccommodationsFound?: boolean
 * }
 */
export async function extractAccommodations({ imageBase64, mediaType, textContent }) {
  const data = await callProxy('extractAccommodations', { imageBase64, mediaType, textContent })
  return extractJSON(data)
}

/**
 * Generate lesson-specific instructional adjustments for students with accommodations.
 * Call this after generating a lesson plan, passing the lesson context + student list.
 *
 * @param {object} params
 * @param {string} params.topic      - Lesson topic
 * @param {string} params.subject    - Subject
 * @param {string} params.grade      - Grade level
 * @param {Array}  params.students   - Array of { name, accommodationType, specificNeeds[] }
 *
 * Returns:
 * {
 *   adjustments: [
 *     { studentName: string, adjustments: string[] }
 *   ]
 * }
 */
export async function generateLessonAccommodations({ topic, subject, grade, students }) {
  if (!students || students.length === 0) return { adjustments: [] }
  const data = await callProxy('lessonAccommodations', { topic, subject, grade, students })
  return extractJSON(data)
}

