// api/teacher/gradebook.js
// Handler for GET /api/teacher/gradebook?classId=<id>
// Fetches REAL data from Supabase
// Returns: { students, assignments, grades }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { classId } = req.query

  if (!classId) {
    return res.status(400).json({ error: 'classId is required' })
  }

  try {
    const numClassId = Number(classId)

    // 1. Fetch students for this class
    const { data: studentsData, error: studentError } = await supabase
      .from('students')
      .select('id, class_id, name, email, grade, flagged, accommodations')
      .eq('class_id', numClassId)

    if (studentError) {
      console.error('Error fetching students:', studentError)
      return res.status(500).json({ error: 'Failed to fetch students' })
    }

    // 2. Fetch assignments for this class
    const { data: assignmentsData, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, class_id, name, type, category_id, assign_date, due_date, weight')
      .eq('class_id', numClassId)

    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError)
      return res.status(500).json({ error: 'Failed to fetch assignments' })
    }

    // 3. Fetch all grades for students in this class
    const studentIds = (studentsData || []).map(s => s.id)
    
    let gradesData = []
    if (studentIds.length > 0) {
      const { data: grades, error: gradeError } = await supabase
        .from('grades')
        .select('student_id, assignment_id, score')
        .in('student_id', studentIds)

      if (gradeError) {
        console.error('Error fetching grades:', gradeError)
        // Don't fail here, just return empty grades
        gradesData = []
      } else {
        gradesData = grades || []
      }
    }

    // Transform Supabase data to match frontend expectations
    const students = (studentsData || []).map(s => ({
      id: s.id,
      classId: s.class_id,
      name: s.name,
      email: s.email,
      grade: s.grade || 0,
      letter: s.grade >= 90 ? 'A' : s.grade >= 80 ? 'B' : s.grade >= 70 ? 'C' : s.grade >= 60 ? 'D' : 'F',
      flagged: s.flagged || false,
      accommodations: s.accommodations || null,
    }))

    const assignments = (assignmentsData || []).map(a => ({
      id: a.id,
      classId: a.class_id,
      name: a.name,
      type: a.type,
      categoryId: a.category_id,
      date: a.assign_date,
      dueDate: a.due_date,
      weight: a.weight,
      hasKey: false,
    }))

    const grades = (gradesData || []).map(g => ({
      studentId: g.student_id,
      assignmentId: g.assignment_id,
      score: g.score,
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
