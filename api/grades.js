// api/grades.js
// ─── Consolidated grading handler ──────────────────────────────────────────────
// Merges: grades/scan-entry.js
// Routes:
//   POST ?action=scan → Scan paper and extract + grade student responses

import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configure formidable for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to validate required fields
function validateRequiredFields(body) {
  const required = ['assignmentId', 'studentName', 'score', 'maxScore']
  const missing = required.filter(field => !body[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

// Helper function to find student by name (fuzzy matching)
async function findStudentByName(studentName, assignmentId) {
  try {
    // Get assignment to find teacher's class
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('class_id')
      .eq('id', assignmentId)
      .single()

    if (assignmentError || !assignment) {
      throw new Error('Assignment not found')
    }

    // Get all students in this class
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('role', 'student')
      .eq('class_id', assignment.class_id)

    if (studentsError) {
      throw new Error('Failed to fetch students')
    }

    // Try exact match first
    const fullName = studentName.toLowerCase().trim()
    let exactMatch = students.find(student => {
      const studentFullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      return studentFullName === fullName
    })

    if (exactMatch) {
      return exactMatch
    }

    // Try fuzzy matching with Levenshtein distance
    let bestMatch = null
    let bestScore = 0

    for (const student of students) {
      const studentFullName = `${student.first_name} ${student.last_name}`
      const similarity = calculateSimilarity(studentName, studentFullName)
      
      if (similarity > 0.8 && similarity > bestScore) {
        bestScore = similarity
        bestMatch = student
      }
    }

    return bestMatch
  } catch (error) {
    console.error('Error finding student:', error)
    return null
  }
}

// Simple Levenshtein distance implementation
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1, str2) {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// ─── Handle scan-to-grade ─────────────────────────────────────────────────────
async function handleScanEntry(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable({
    uploadDir: '/tmp',
    keepExtensions: true,
    multiples: false,
  })

  try {
    const [fields, files] = await form.parse(req)

    const assignmentId = fields.assignmentId?.[0]
    const studentName = fields.studentName?.[0]
    const score = parseFloat(fields.score?.[0])
    const maxScore = parseFloat(fields.maxScore?.[0])
    const answerKey = fields.answerKey?.[0] || ''

    // Validate required fields
    if (!assignmentId || !studentName || isNaN(score) || isNaN(maxScore)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' })
    }

    // Get file from upload
    const uploadedFile = files.image?.[0]
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(uploadedFile.filepath)
    const base64Image = fileBuffer.toString('base64')

    // Find student by name (with fuzzy matching)
    const student = await findStudentByName(studentName, assignmentId)
    if (!student) {
      return res.status(404).json({ error: 'Student not found or fuzzy match failed' })
    }

    // Create grade entry in database
    const { data, error } = await supabase
      .from('grades')
      .insert({
        assignment_id: assignmentId,
        student_id: student.id,
        score,
        max_score: maxScore,
        graded: true,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to save grade' })
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath)

    return res.status(200).json({
      success: true,
      grade: data[0],
      studentName: `${student.first_name} ${student.last_name}`,
      score,
      maxScore,
    })

  } catch (error) {
    console.error('Scan entry error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

// ─── Main router ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action

  if (action === 'scan') {
    return handleScanEntry(req, res)
  }

  return res.status(400).json({ error: 'Invalid grades action' })
}
