// api/teacher/gradebook.js
// Handler for GET /api/teacher/gradebook?classId=<id>
// Returns: { students, assignments, grades }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { classId } = req.query

  if (!classId) {
    return res.status(400).json({ error: 'classId is required' })
  }

  try {
    // Demo data - structured to match what Gradebook.jsx expects
    const DEMO_STUDENTS = [
      { id: 1, classId: 1, name: 'Aaliyah Brooks', grade: 95, letter: 'A', flagged: false, accommodations: null },
      { id: 2, classId: 1, name: 'Marcus Thompson', grade: 58, letter: 'F', flagged: true, accommodations: ['504 plan - Extended time'] },
      { id: 3, classId: 1, name: 'Sofia Rodriguez', grade: 82, letter: 'B', flagged: false, accommodations: null },
      { id: 4, classId: 1, name: 'Jordan Williams', grade: 74, letter: 'C', flagged: false, accommodations: null },
      { id: 5, classId: 1, name: 'Priya Patel', grade: 91, letter: 'A', flagged: false, accommodations: null },
      { id: 6, classId: 2, name: 'Noah Johnson', grade: 88, letter: 'B', flagged: false, accommodations: ['504 plan - Extended time'] },
      { id: 7, classId: 2, name: 'Emma Davis', grade: 96, letter: 'A', flagged: false, accommodations: null },
      { id: 8, classId: 3, name: 'Liam Martinez', grade: 61, letter: 'D', flagged: true, accommodations: ['504 plan - Extended time', 'Calculator access'] },
      { id: 9, classId: 3, name: 'Zoe Anderson', grade: 55, letter: 'F', flagged: true, accommodations: ['504 plan - Extended time'] },
      { id: 10, classId: 4, name: 'Ethan Brown', grade: 79, letter: 'C', flagged: false, accommodations: null },
    ]

    const DEMO_ASSIGNMENTS = [
      { id: 1, classId: 1, name: 'Ch.3 Quiz', type: 'quiz', categoryId: 2, date: '2024-10-14', dueDate: '2024-10-14', hasKey: true },
      { id: 2, classId: 1, name: 'Ch.3 Homework', type: 'homework', categoryId: 3, date: '2024-10-12', dueDate: '2024-10-12', hasKey: true },
      { id: 3, classId: 1, name: 'Unit Test 1', type: 'test', categoryId: 1, date: '2024-10-10', dueDate: '2024-10-10', hasKey: false },
      { id: 4, classId: 1, name: 'Participation', type: 'participation', categoryId: 4, date: '2024-10-01', dueDate: '2024-10-31', hasKey: false },
    ]

    const DEMO_GRADES = [
      { studentId: 1, assignmentId: 1, score: 95 },
      { studentId: 1, assignmentId: 2, score: 98 },
      { studentId: 1, assignmentId: 3, score: 92 },
      { studentId: 2, assignmentId: 1, score: 58 },
      { studentId: 2, assignmentId: 2, score: 72 },
      { studentId: 2, assignmentId: 3, score: 45 },
      { studentId: 3, assignmentId: 1, score: 84 },
      { studentId: 3, assignmentId: 2, score: 88 },
      { studentId: 4, assignmentId: 1, score: 76 },
      { studentId: 5, assignmentId: 1, score: 93 },
    ]

    // Filter by classId
    const students = DEMO_STUDENTS.filter(s => s.classId === Number(classId))
    const assignments = DEMO_ASSIGNMENTS.filter(a => a.classId === Number(classId))

    console.log(`Gradebook API: Fetched ${students.length} students and ${assignments.length} assignments for classId ${classId}`)

    return res.status(200).json({
      students,
      assignments,
      grades: DEMO_GRADES,
    })
  } catch (error) {
    console.error('Gradebook API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
