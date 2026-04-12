// api/teacher/gradebook.js
// Handler for GET /api/teacher/gradebook?classId=<id>
// Fetches REAL data from Supabase
// Returns: { students, assignments, grades }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('DEBUG: API handler received req.query:', req.query)
  console.log('DEBUG: API handler received req.url:', req.url)
  console.log('DEBUG: classId from req.query.classId:', req.query.classId, 'typeof:', typeof req.query.classId)
  
  let { classId } = req.query

  // Fix for Vite proxy HMR issue that appends :1 suffix
  if (classId && typeof classId === 'string' && classId.includes(':')) {
    console.log('DEBUG: classId contains colon, stripping suffix:', classId)
    classId = classId.split(':')[0]
    console.log('DEBUG: classId after stripping:', classId)
  }

  if (!classId) {
    return res.status(400).json({ error: 'classId is required' })
  }

  try {
    // 1. Fetch real students from Supabase using your actual schema
    const { data: studentsData, error: studentError } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('class_id', classId)

    if (studentError) {
      console.error('Error fetching students:', studentError)
      return res.status(500).json({ error: 'Failed to fetch students' })
    }

    // 2. Fetch real assignments from Supabase
    const { data: assignmentsData, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, name, type, weight, due_date, assign_date')
      .eq('class_id', classId)

    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError)
      return res.status(500).json({ error: 'Failed to fetch assignments' })
    }

    // 3. Fetch real grades from Supabase for these students
    const studentIds = (studentsData || []).map(s => s.id)
    let gradesData = []
    if (studentIds.length > 0) {
      const { data: realGrades, error: gradeError } = await supabase
        .from('grades')
        .select('student_id, assignment_id, score, submitted, graded, ai_graded, ai_confidence, needs_review, created_at')

      if (gradeError) {
        console.error('Error fetching grades:', gradeError)
        // Don't fail here, just return empty grades
        gradesData = []
      } else {
        gradesData = realGrades || []
      }
    }

    // Transform data to match frontend expectations
    const students = (studentsData || []).map(s => {
      // Calculate student's average grade from grades
      const studentGrades = (gradesData || []).filter(g => g.student_id === s.id)
      const gradeValues = studentGrades.map(g => g.score).filter(score => score !== undefined)
      const avgGrade = gradeValues.length ? Math.round(gradeValues.reduce((a, b) => a + b) / gradeValues.length) : 0
      const letterGrade = avgGrade >= 90 ? 'A' : avgGrade >= 80 ? 'B' : avgGrade >= 70 ? 'C' : avgGrade >= 60 ? 'D' : 'F'
      
      return {
        id: s.id,
        classId: s.class_id || classId,
        name: s.name,
        email: s.email,
        grade: avgGrade,
        letter: letterGrade,
        flagged: false, // Default since column doesn't exist
        accommodations: null, // Default since column doesn't exist
      }
    })

    const assignments = (assignmentsData || []).map(a => ({
      id: a.id,
      classId: a.class_id || classId,
      name: a.name,
      type: a.type,
      weight: a.weight,
      dueDate: a.due_date,
      assignDate: a.assign_date,
      hasKey: false, // Default since column doesn't exist
      options: a.options || null, // Use options column instead of has_key
    }))

    const grades = (gradesData || []).map(g => ({
      studentId: g.student_id,
      assignmentId: g.assignment_id,
      score: g.score,
      submitted: g.submitted || false,
      graded: g.graded || true,
      ai_graded: g.ai_graded || false,
      ai_confidence: g.ai_confidence || null,
      needs_review: g.needs_review || false,
      created_at: g.created_at || null
    }))

    console.log(`Gradebook API: Fetched ${students.length} students, ${assignments.length} assignments, ${grades.length} grades for classId ${classId}`)

    return res.status(200).json({
      students,
      assignments,
      grades,
    })
  } catch (error) {
    console.error('Gradebook API error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
