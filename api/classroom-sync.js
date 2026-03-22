// api/classroom-sync.js
// Pulls roster + assignments + grades from Google Classroom into Supabase.
// Handles token refresh automatically.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL       || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// ─── Token helpers ─────────────────────────────────────────────────────────────
async function getValidToken(teacherId) {
  const { data, error } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('teacher_id', teacherId)
    .single()

  if (error || !data) throw new Error('No Google Classroom connection found. Please reconnect.')

  // Refresh if expired (or expiring within 5 minutes)
  const expiresAt = new Date(data.expires_at)
  const now       = new Date()
  const fiveMin   = 5 * 60 * 1000

  if (expiresAt - now < fiveMin && data.refresh_token) {
    return await refreshAccessToken(teacherId, data.refresh_token)
  }

  return data.access_token
}

async function refreshAccessToken(teacherId, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }).toString(),
  })

  if (!res.ok) throw new Error('Token refresh failed. Please reconnect Google Classroom.')

  const { access_token, expires_in } = await res.json()
  const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString()

  await supabase
    .from('google_tokens')
    .update({ access_token, expires_at: expiresAt })
    .eq('teacher_id', teacherId)

  return access_token
}

// ─── Google Classroom API helpers ─────────────────────────────────────────────
async function classroomGet(path, token) {
  const res = await fetch(`https://classroom.googleapis.com${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Classroom API error ${res.status}: ${err}`)
  }
  return res.json()
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId = '00000000-0000-0000-0000-000000000001', courseId } = req.body || {}

  try {
    const token = await getValidToken(teacherId)

    const summary = {
      courses:     [],
      students:    0,
      assignments: 0,
      grades:      0,
      errors:      [],
    }

    // ── Step 1: Get courses (classes) ────────────────────────────────────────
    const coursesData = await classroomGet('/v1/courses?courseStates=ACTIVE', token)
    const courses     = coursesData.courses || []

    if (courses.length === 0) {
      return res.status(200).json({ success: true, summary: { ...summary, message: 'No active courses found in Google Classroom.' } })
    }

    // Filter to specific course if provided
    const targetCourses = courseId
      ? courses.filter(c => c.id === courseId)
      : courses

    for (const course of targetCourses) {
      const courseResult = { id: course.id, name: course.name, students: 0, assignments: 0, grades: 0 }

      // ── Step 2: Upsert class into Supabase ─────────────────────────────────
      const { data: classRow } = await supabase
        .from('classes')
        .upsert({
          google_course_id: course.id,
          teacher_id:       teacherId,
          subject:          course.name,
          period:           course.section || '1st',
          color:            '#3b7ef4',
          class_code:       course.enrollmentCode || course.id,
        }, { onConflict: 'google_course_id' })
        .select()
        .single()

      const classId = classRow?.id

      // ── Step 3: Pull roster (students) ─────────────────────────────────────
      try {
        const rosterData = await classroomGet(`/v1/courses/${course.id}/students`, token)
        const gcStudents = rosterData.students || []

        for (const gcStudent of gcStudents) {
          const profile = gcStudent.profile
          await supabase
            .from('students')
            .upsert({
              google_user_id: profile.id,
              name:           profile.name?.fullName || 'Unknown',
              email:          profile.emailAddress || '',
              class_id:       classId,
            }, { onConflict: 'google_user_id' })
          courseResult.students++
        }
      } catch (err) {
        summary.errors.push(`Roster error for ${course.name}: ${err.message}`)
      }

      // ── Step 4: Pull assignments (coursework) ───────────────────────────────
      try {
        const cwData        = await classroomGet(`/v1/courses/${course.id}/courseWork`, token)
        const courseWork    = cwData.courseWork || []

        for (const cw of courseWork) {
          const { data: assignRow } = await supabase
            .from('assignments')
            .upsert({
              google_coursework_id: cw.id,
              class_id:             classId,
              name:                 cw.title,
              type:                 'assignment',
              max_score:            cw.maxPoints || 100,
              due_date:             cw.dueDate
                ? `${cw.dueDate.year}-${String(cw.dueDate.month).padStart(2,'0')}-${String(cw.dueDate.day).padStart(2,'0')}`
                : null,
            }, { onConflict: 'google_coursework_id' })
            .select()
            .single()

          const assignmentId = assignRow?.id
          courseResult.assignments++

          // ── Step 5: Pull grades (student submissions) ──────────────────────
          try {
            const subsData  = await classroomGet(
              `/v1/courses/${course.id}/courseWork/${cw.id}/studentSubmissions?states=TURNED_IN,RETURNED`,
              token
            )
            const submissions = subsData.studentSubmissions || []

            for (const sub of submissions) {
              if (sub.assignedGrade == null && sub.draftGrade == null) continue

              const score    = sub.assignedGrade ?? sub.draftGrade
              const maxScore = cw.maxPoints || 100

              // Find student by google_user_id
              const { data: studentRow } = await supabase
                .from('students')
                .select('id')
                .eq('google_user_id', sub.userId)
                .single()

              if (studentRow && assignmentId) {
                await supabase
                  .from('grades')
                  .upsert({
                    student_id:    studentRow.id,
                    assignment_id: assignmentId,
                    score,
                    max_score:     maxScore,
                    graded:        true,
                  }, { onConflict: 'student_id,assignment_id' })
                courseResult.grades++
              }
            }
          } catch (err) {
            summary.errors.push(`Grades error for ${cw.title}: ${err.message}`)
          }
        }
      } catch (err) {
        summary.errors.push(`Assignments error for ${course.name}: ${err.message}`)
      }

      summary.courses.push(courseResult)
      summary.students    += courseResult.students
      summary.assignments += courseResult.assignments
      summary.grades      += courseResult.grades
    }

    // Update last sync time
    await supabase
      .from('google_tokens')
      .update({ last_sync: new Date().toISOString() })
      .eq('teacher_id', teacherId)

    return res.status(200).json({ success: true, summary })

  } catch (err) {
    console.error('Classroom sync error:', err)
    return res.status(500).json({ error: err.message || 'Sync failed' })
  }
}
