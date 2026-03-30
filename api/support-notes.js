import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    // TODO: Real auth - assume supportStaff via header/session for now
    // In production: verify Supabase session from cookies or JWT
    const staffId = req.headers['x-staff-id'] // Frontend sends from store.currentUser.id
    if (!staffId) {
      return res.status(401).json({ error: 'Missing staff ID' })
    }

    if (req.method === 'GET') {
      const { studentId } = req.query
      if (!studentId) {
        return res.status(400).json({ error: 'studentId required' })
      }

      // Check assignment
      const { data: assignment } = await supabase
        .from('support_staff_teams')
        .select('id')
        .eq('staff_id', staffId)
        .eq('student_id', studentId)
        .single()

      if (!assignment) {
        return res.status(403).json({ error: 'Not assigned to this student' })
      }

      const { data: notes, error } = await supabase
        .from('support_staff_notes')
        .select(`
          *,
          staff:teachers(name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ notes: notes || [] })

    } else if (req.method === 'POST') {
      const { student_id, note_type, content, visibility } = req.body
      if (!student_id || !content) {
        return res.status(400).json({ error: 'student_id and content required' })
      }

      // Check assignment
      const { data: assignment } = await supabase
        .from('support_staff_teams')
        .select('id')
        .eq('staff_id', staffId)
        .eq('student_id', student_id)
        .single()

      if (!assignment) {
        return res.status(403).json({ error: 'Not assigned to this student' })
      }

      const { data, error } = await supabase
        .from('support_staff_notes')
        .insert({
          student_id,
          staff_id: staffId,
          note_type,
          content,
          visibility,
        })
        .select(`
          *,
          staff:teachers(name)
        `)
        .single()

      if (error) throw error

      return res.status(201).json(data)

    } else if (req.method === 'PATCH') {
      const noteId = req.query.id
      const { content, note_type, visibility } = req.body
      if (!noteId) {
        return res.status(400).json({ error: 'id required' })
      }

      // Check ownership
      const { data: note } = await supabase
        .from('support_staff_notes')
        .select('staff_id')
        .eq('id', noteId)
        .eq('student_id', req.body.student_id) // Double-check student if provided
        .single()

      if (!note || note.staff_id !== staffId) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const { data: updated, error } = await supabase
        .from('support_staff_notes')
        .update({
          content,
          note_type,
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select(`
          *,
          staff:teachers(name)
        `)
        .single()

      if (error) throw error

      return res.status(200).json(updated)

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Support notes API error:', error)
    res.status(500).json({ error: error.message })
  }
}
