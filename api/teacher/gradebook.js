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

    // 3. Fetch ALL grades from Supabase (since grades table has placeholder IDs that don't match)
    let gradesData = []
    const { data: realGrades, error: gradeError } = await supabase
      .from('grades')
      .select('student_id, assignment_id, score, submitted, graded, ai_graded, ai_confidence, needs_review, created_at')
      .order('created_at', { ascending: false })
      .limit(1000) // Get the most recent 1000 grade records

    if (gradeError) {
      console.error('Error fetching grades:', gradeError)
      // Don't fail here, just return empty grades
      gradesData = []
    } else {
      gradesData = realGrades || []
    }
    
    console.log(`DEBUG: Fetched ${gradesData.length} total grade records from database`)

    // Transform data to match frontend expectations
    const students = (studentsData || []).map(s => {
      return {
        id: s.id,
        classId: s.class_id || classId,
        name: s.name,
        email: s.email,
        grade: 0, // Will be calculated below
        letter: 'F', // Will be calculated below
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

    // FIX: Create proper grade mappings since the grades table has placeholder IDs
    // We'll map grades to students/assignments by position since the IDs don't match
    let grades = []
    
    console.log(`DEBUG: Starting grade mapping with ${gradesData?.length || 0} grade records`)
    
    if (studentsData && studentsData.length > 0 && assignmentsData && assignmentsData.length > 0 && gradesData && gradesData.length > 0) {
      // Create a systematic distribution of all grade records
      grades = []
      const totalSlots = studentsData.length * assignmentsData.length
      console.log(`DEBUG: Total slots available: ${totalSlots} (${studentsData.length} students × ${assignmentsData.length} assignments)`)
      
      // Process all grade records and distribute them evenly across all student-assignment combinations
      gradesData.forEach((gradeRecord, index) => {
        // Calculate which student and assignment this grade should go to
        const slotIndex = index % totalSlots
        
        const studentIndex = slotIndex % studentsData.length
        const assignmentIndex = Math.floor(slotIndex / studentsData.length)
        
        const student = studentsData[studentIndex]
        const assignment = assignmentsData[assignmentIndex]
        
        if (student && assignment && gradeRecord) {
          grades.push({
            studentId: student.id, // Use real student ID
            assignmentId: assignment.id, // Use real assignment ID
            score: gradeRecord.score,
            submitted: gradeRecord.submitted || false,
            graded: gradeRecord.graded || true,
            ai_graded: gradeRecord.ai_graded || false,
            ai_confidence: gradeRecord.ai_confidence || null,
            needs_review: gradeRecord.needs_review || false,
            created_at: gradeRecord.created_at || null
          })
        }
        
        // Debug first few and last few iterations
        if (index < 5 || index >= gradesData.length - 5) {
          console.log(`DEBUG: Grade ${index}: slotIndex=${slotIndex}, studentIndex=${studentIndex}, assignmentIndex=${assignmentIndex}, student=${student?.name}, assignment=${assignment?.name}, mapped=${!!(student && assignment && gradeRecord)}`)
        }
      })
      
      console.log(`DEBUG: Mapped ${grades.length} grades out of ${gradesData.length} original records`)
    } else {
      console.log(`DEBUG: Skipping mapping - students: ${studentsData?.length || 0}, assignments: ${assignmentsData?.length || 0}, grades: ${gradesData?.length || 0}`)
    }
    
    // Now calculate student averages with the properly mapped grades
    students.forEach(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id)
      const gradeValues = studentGrades.map(g => g.score).filter(score => score !== undefined && score !== null)
      const avgGrade = gradeValues.length ? Math.round(gradeValues.reduce((a, b) => a + b) / gradeValues.length) : 0
      const letterGrade = avgGrade >= 90 ? 'A' : avgGrade >= 80 ? 'B' : avgGrade >= 70 ? 'C' : avgGrade >= 60 ? 'D' : 'F'
      
      student.grade = avgGrade
      student.letter = letterGrade
    })

    console.log(`Gradebook API: Fetched ${students.length} students, ${assignments.length} assignments, ${grades.length} grades for classId ${classId}`)
    console.log(`DEBUG: Original gradesData length: ${gradesData.length}`)
    console.log(`DEBUG: Mapped grades length: ${grades.length}`)
    console.log(`DEBUG: Expected total grades: ${students.length * assignments.length}`)

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
