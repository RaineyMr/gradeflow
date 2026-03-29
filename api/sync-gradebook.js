import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { triggeredBy = 'teacher' } = req.body || {}

  // 1) Load all gradebook data
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*')

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')

  const { data: grades, error: gradesError } = await supabase
    .from('grades')
    .select('*')

  if (classesError || studentsError || assignmentsError || gradesError) {
    console.error('Sync load error:', {
      classesError,
      studentsError,
      assignmentsError,
      gradesError,
    })
    return res.status(500).json({ error: 'Failed to load gradebook data' })
  }

  // 2) Build generic payload
  const studentsByClass = {}
  for (const s of students || []) {
    if (!studentsByClass[s.class_id]) studentsByClass[s.class_id] = []
    studentsByClass[s.class_id].push(s)
  }

  const gradesByAssignment = {}
  for (const g of grades || []) {
    if (!gradesByAssignment[g.assignment_id]) gradesByAssignment[g.assignment_id] = []
    gradesByAssignment[g.assignment_id].push(g)
  }

  const payload = {
    classes: (classes || []).map(cls => {
      const classAssignments = (assignments || []).filter(a => a.class_id === cls.id)

      return {
        id: cls.id,
        name: `${cls.period} · ${cls.subject}`,
        students: (studentsByClass[cls.id] || []).map(s => ({
          id: s.id,
          name: s.name,
          email: s.email,
        })),
        assignments: classAssignments.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          maxPoints: (a.options && a.options.max_points) ?? 100,
          dueDate: a.due_date,
          grades: (gradesByAssignment[a.id] || []).map(g => ({
            studentId: g.student_id,
            score: g.score,
          })),
        })),
      }
    }),
  }

  // 3) For now: log payload to sync_logs (District Gradebook placeholder)
  const { error: logError } = await supabase
    .from('sync_logs')
    .insert({
      triggered_by: triggeredBy,
      payload,
    })

  if (logError) {
    console.error('Sync log error:', logError)
    return res.status(500).json({ error: 'Failed to log sync' })
  }

  // Later: call real SIS adapter here (PowerSchool, Canvas, etc.)

  return res.status(200).json({ ok: true })
}
