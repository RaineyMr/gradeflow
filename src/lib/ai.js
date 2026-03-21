// src/lib/ai.js
// ─── GradeFlow Frontend AI Helper ────────────────────────────────────────────
// ALL AI calls go through this file.
// This file NEVER contains an API key — it calls /api/ai (your secure backend).
//
// Usage:
//   import { callAI, gradeWork, extractRoster, extractAnswers, generateLessonPlan } from '../lib/ai'
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

// ── Parse JSON from Anthropic response (strips markdown fences) ───────────────
function extractJSON(data) {
  const text = extractText(data)
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

/**
 * General AI call — use for chat, summaries, explanations, etc.
 * @param {string} prompt
 * @param {string} [system] - optional system prompt
 * @param {number} [max_tokens]
 * @returns {Promise<string>} - text response
 */
export async function callAI(prompt, system = '', max_tokens = 1000) {
  const data = await callProxy('general', { prompt, system, max_tokens })
  return extractText(data)
}

/**
 * General AI call with web search enabled.
 * @param {string} prompt
 * @param {string} [system]
 * @param {number} [max_tokens]
 * @returns {Promise<string>} - text response
 */
export async function callAIWithSearch(prompt, system = '', max_tokens = 1000) {
  const data = await callProxy('search', { prompt, system, max_tokens })
  return extractText(data)
}

/**
 * Grade a student paper from a base64 image.
 * @param {string} imageBase64
 * @param {string} mediaType - e.g. 'image/jpeg'
 * @param {string} assignmentName
 * @param {string} [answerKey]
 * @returns {Promise<{score, grade, feedback, corrections}>}
 */
export async function gradeWork(imageBase64, mediaType, assignmentName, answerKey = '') {
  const data = await callProxy('grade', { imageBase64, mediaType, assignmentName, answerKey })
  return extractJSON(data)
}

/**
 * Extract student names from a roster image.
 * @param {string} imageBase64
 * @param {string} mediaType
 * @returns {Promise<{students: Array<{name, id}>}>}
 */
export async function extractRoster(imageBase64, mediaType) {
  const data = await callProxy('extractRoster', { imageBase64, mediaType })
  return extractJSON(data)
}

/**
 * Extract answer key from a document image.
 * @param {string} imageBase64
 * @param {string} mediaType
 * @returns {Promise<{answers: Array<{question, answer}>}>}
 */
export async function extractAnswers(imageBase64, mediaType) {
  const data = await callProxy('extractAnswers', { imageBase64, mediaType })
  return extractJSON(data)
}

/**
 * Generate a lesson plan.
 * @param {object} params - { subject, grade, topic, duration, standards }
 * @returns {Promise<object>} - structured lesson plan
 */
export async function generateLessonPlan({ subject, grade, topic, duration = 50, standards = '' }) {
  const data = await callProxy('lessonPlan', { subject, grade, topic, duration, standards })
  return extractJSON(data)
}
