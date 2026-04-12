// api/lesson-plan.js
// GradeFlow Lesson Plan API (v2)
// Handles 10-section lesson plan model with CFS, proper lesson steps,
// optional add-ons, and per-section AI assist tracking.

import { createClient } from '@supabase/supabase-js'

const supabase = (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY)
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  : null

// Helper Functions
function handleApiError(res, error, message, statusCode = 500) {
  console.error('Lesson Plan API Error:', error)
  return res.status(statusCode).json({
    error: message || 'Internal server error',
    details: error.message
  })
}

function validateLessonData(data) {
  // Allow saving any lesson plan data, even completely empty ones
  // Just ensure we have a basic structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid lesson plan data')
  }
  
  return true
}

// Helper: Resolve legacy_id to UUID
async function resolveTeacherId(teacherId) {
  if (!teacherId || !supabase) return teacherId
  
  // If it's already a valid UUID, return as-is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId)) {
    return teacherId
  }
  
  // Try to resolve legacy_id to UUID
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('legacy_id', teacherId)
      .single()
    
    if (data && data.id) {
      console.log(`Resolved legacy_id "${teacherId}" to UUID "${data.id}"`)
      return data.id
    }
  } catch (err) {
    console.warn(`Could not resolve legacy_id "${teacherId}":`, err.message)
  }
  
  // If resolution failed, return original ID (might work if it's a demo ID)
  return teacherId
}

// Extract Teacher ID from Auth Header
function extractTeacherId(authHeader) {
  if (!authHeader) return null
  
  // For now, simplified extraction. In production, use proper JWT parsing
  // Format: "Bearer <token>"
  const token = authHeader.replace('Bearer ', '')
  
  // Handle demo account - allow demo token
  if (token === 'demo-token') {
    return 'demo-teacher'
  }
  
  // Return the token (could be UUID or legacy_id, will be resolved later)
  return token
}

// Main Handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const authHeader = req.headers.authorization
    
    // Allow demo access without auth for development
    if (!authHeader && process.env.NODE_ENV === 'development') {
      return handleCreateLesson(req, res, 'demo-teacher')
    }
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }
    
    let teacherId = extractTeacherId(authHeader)
    
    // Resolve legacy_id to UUID if needed
    if (teacherId && teacherId !== 'demo-teacher') {
      teacherId = await resolveTeacherId(teacherId)
    }
    
    const { method } = req
    
    switch (method) {
      case 'GET':
        return handleGetLessons(req, res, teacherId)
      case 'POST':
        return handleCreateLesson(req, res, teacherId)
      case 'PUT':
        return handleUpdateLesson(req, res, teacherId)
      case 'DELETE':
        return handleDeleteLesson(req, res, teacherId)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
    
  } catch (error) {
    return handleApiError(res, error)
  }
}

// Get Lessons
async function handleGetLessons(req, res, teacherId) {
  try {
    if (!supabase) {
      return res.status(200).json({ lessons: [], pagination: { limit: 20, offset: 0, hasMore: false } })
    }

    const { classId, limit = 20, offset = 0 } = req.query

    let query = supabase
      .from('lessons')
      .select(`
        *,
        lesson_standards(standard_id, standard_label),
        lesson_attachments(id, file_name, file_url),
        lesson_accommodations(id, student_id, accommodation_type, specific_needs, instructional_adjustments)
      `)
      .eq('teacher_id', teacherId)
    
    if (classId) {
      query = query.eq('class_id', classId)
    }
    
    const { data: lessons, error } = await query
      .order('lesson_date', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
    
    if (error) throw error
    
    return res.status(200).json({
      lessons: lessons || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: lessons && lessons.length === parseInt(limit)
      }
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch lessons')
  }
}

// Create Lesson - with demo fallback
async function handleCreateLesson(req, res, teacherId) {
  try {
    const lessonData = req.body
    
    // Validate
    validateLessonData(lessonData)
    
    // Supabase client is now global (declared at top)
    
    // For demo mode, still save to Supabase for persistence
    if (!supabase) {
      console.log('DEMO MODE: No Supabase connection - simulating lesson plan save')
      
      // Simulate a lesson record
      const mockLesson = {
        id: `demo-lesson-${Date.now()}`,
        teacher_id: teacherId,
        title: lessonData.header?.title || 'Untitled Lesson',
        subject: lessonData.header?.subject || '',
        grade_level: lessonData.header?.gradeLevel || '',
        lesson_date: lessonData.header?.date || new Date().toISOString().split('T')[0],
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return res.status(201).json({
        lesson: mockLesson,
        message: 'Lesson plan saved successfully (demo mode - no database)'
      })
    }
    
    // Map new 10-section model to lessons table columns
    const lessonRecord = {
      teacher_id: teacherId,
      class_id: lessonData.classId || null,
      
      // Section 1: Header (handle missing/empty header)
      title: lessonData.header?.title || 'Untitled Lesson',
      subject: lessonData.header?.subject || '',
      grade_level: lessonData.header?.gradeLevel || '',
      lesson_date: lessonData.header?.date || new Date().toISOString().split('T')[0],
      
      // Section 2: Standards (stored as array, relationships in lesson_standards table)
      standards: lessonData.standards || [],
      
      // Section 3: Objectives
      objectives: lessonData.objectives || '',
      
      // Section 4: CFS (Success Criteria + Culturally Responsive)
      criteria_for_success: lessonData.cfs?.successCriteria || '',
      cultural_notes: lessonData.cfs?.culturalNotes || '',
      
      // Section 5: Lesson Steps (5 substeps + optional enrichment/extension)
      warm_up: lessonData.lessonSteps?.warmUp || '',
      direct_instruction: lessonData.lessonSteps?.directInstruction || '',
      guided_practice: lessonData.lessonSteps?.guidedPractice || '',
      independent_practice: lessonData.lessonSteps?.independentPractice || '',
      closure: lessonData.lessonSteps?.closure || '',
      enrichment_activities: lessonData.lessonSteps?.enrichment || lessonData.optionalAddOns?.enrichment || '',
      
      // Section 6: Exit Ticket
      exit_ticket: lessonData.exitTicket || '',
      
      // Section 7: Homework
      homework_assignment: lessonData.homework?.assignment || '',
      homework_due_date: lessonData.homework?.dueDate || null,
      homework_max_points: lessonData.homework?.maxPoints ? parseInt(lessonData.homework?.maxPoints) : null,
      
      // Section 8: Accommodations (text field; specific accommodations in lesson_accommodations table)
      accommodations_notes: lessonData.accommodations || '',
      
      // Section 9: Attachments (file references in lesson_attachments table)
      // (handled separately below)
      
      // Section 10: Optional Add-Ons (supplemental links and reflections only)
      supplemental_links: lessonData.optionalAddOns?.supplementalLinks || '',
      teacher_reflections: lessonData.optionalAddOns?.reflections || '',
      
      // Metadata
      status: 'draft',
      ai_calls_count: 0,
      ai_tokens_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert([lessonRecord])
      .select()
      .single()
    
    if (lessonError) throw lessonError
    
    // Handle standards (many-to-many)
    if (lessonData.standards && lessonData.standards.length > 0) {
      const standardsToInsert = lessonData.standards.map(standard => ({
        lesson_id: lesson.id,
        standard_id: typeof standard === 'string' ? standard : standard.standard_id || standard,
        standard_source: 'TEKS', // Default; can be inferred from standard_id format
        standard_label: typeof standard === 'string' ? standard : standard.standard_label || standard.description || standard
      }))
      
      const { error: stdError } = await supabase
        .from('lesson_standards')
        .insert(standardsToInsert)
      
      if (stdError) {
        console.error('Standards insertion error:', stdError)
        // Don't fail entire request if standards fail
      }
    }
    
    // Handle attachments (many-to-many)
    if (lessonData.attachments && lessonData.attachments.length > 0) {
      const attachmentsToInsert = lessonData.attachments.map((file, idx) => ({
        lesson_id: lesson.id,
        file_name: file.name || `attachment_${idx}`,
        file_type: file.type || 'unknown',
        file_url: file.url || file.path || '',
        uploaded_at: new Date().toISOString()
      }))
      
      const { error: attError } = await supabase
        .from('lesson_attachments')
        .insert(attachmentsToInsert)
      
      if (attError) {
        console.error('Attachments insertion error:', attError)
      }
    }
    
    return res.status(201).json({
      lesson,
      message: 'Lesson plan created successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to create lesson plan', 400)
  }
}

// Update Lesson
async function handleUpdateLesson(req, res, teacherId) {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { lessonId } = req.query
    const lessonData = req.body

    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID required' })
    }
    
    // Verify ownership
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, teacher_id')
      .eq('id', lessonId)
      .single()
    
    if (fetchError) throw fetchError
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    if (existingLesson.teacher_id !== teacherId) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Build update object
    const updateRecord = {
      updated_at: new Date().toISOString()
    }
    
    // Section 1: Header
    if (lessonData.header) {
      if (lessonData.header.title !== undefined) updateRecord.title = lessonData.header.title
      if (lessonData.header.subject !== undefined) updateRecord.subject = lessonData.header.subject
      if (lessonData.header.gradeLevel !== undefined) updateRecord.grade_level = lessonData.header.gradeLevel
      if (lessonData.header.date !== undefined) updateRecord.lesson_date = lessonData.header.date
    }
    
    // Section 2: Standards
    if (lessonData.standards !== undefined) {
      updateRecord.standards = lessonData.standards
      
      // Update lesson_standards table
      await supabase.from('lesson_standards').delete().eq('lesson_id', lessonId)
      
      if (lessonData.standards.length > 0) {
        const standardsToInsert = lessonData.standards.map(standard => ({
          lesson_id: lessonId,
          standard_id: typeof standard === 'string' ? standard : standard.standard_id || standard,
          standard_source: 'TEKS',
          standard_label: typeof standard === 'string' ? standard : standard.standard_label || standard
        }))
        
        await supabase.from('lesson_standards').insert(standardsToInsert)
      }
    }
    
    // Section 3: Objectives
    if (lessonData.objectives !== undefined) updateRecord.objectives = lessonData.objectives
    
    // Section 4: CFS
    if (lessonData.cfs) {
      if (lessonData.cfs.successCriteria !== undefined) updateRecord.criteria_for_success = lessonData.cfs.successCriteria
      if (lessonData.cfs.culturalNotes !== undefined) updateRecord.cultural_notes = lessonData.cfs.culturalNotes
    }
    
    // Section 5: Lesson Steps (5 substeps)
    if (lessonData.lessonSteps) {
      if (lessonData.lessonSteps.warmUp !== undefined) updateRecord.warm_up = lessonData.lessonSteps.warmUp
      if (lessonData.lessonSteps.directInstruction !== undefined) updateRecord.direct_instruction = lessonData.lessonSteps.directInstruction
      if (lessonData.lessonSteps.guidedPractice !== undefined) updateRecord.guided_practice = lessonData.lessonSteps.guidedPractice
      if (lessonData.lessonSteps.independentPractice !== undefined) updateRecord.independent_practice = lessonData.lessonSteps.independentPractice
      if (lessonData.lessonSteps.closure !== undefined) updateRecord.closure = lessonData.lessonSteps.closure
      if (lessonData.lessonSteps.enrichment !== undefined) updateRecord.enrichment_activities = lessonData.lessonSteps.enrichment
    }
    
    // Section 6: Exit Ticket
    if (lessonData.exitTicket !== undefined) updateRecord.exit_ticket = lessonData.exitTicket
    
    // Section 7: Homework
    if (lessonData.homework) {
      if (lessonData.homework.assignment !== undefined) updateRecord.homework_assignment = lessonData.homework.assignment
      if (lessonData.homework.dueDate !== undefined) updateRecord.homework_due_date = lessonData.homework.dueDate
      if (lessonData.homework.maxPoints !== undefined) updateRecord.homework_max_points = lessonData.homework.maxPoints ? parseInt(lessonData.homework.maxPoints) : null
    }
    
    // Section 8: Accommodations
    if (lessonData.accommodations !== undefined) updateRecord.accommodations_notes = lessonData.accommodations
    
    // Section 9: Attachments
    if (lessonData.attachments !== undefined) {
      await supabase.from('lesson_attachments').delete().eq('lesson_id', lessonId)
      
      if (lessonData.attachments.length > 0) {
        const attachmentsToInsert = lessonData.attachments.map((file, idx) => ({
          lesson_id: lessonId,
          file_name: file.name || `attachment_${idx}`,
          file_type: file.type || 'unknown',
          file_url: file.url || file.path || '',
          uploaded_at: new Date().toISOString()
        }))
        
        await supabase.from('lesson_attachments').insert(attachmentsToInsert)
      }
    }
    
    // Section 10: Optional Add-Ons (supplemental links and reflections only)
    if (lessonData.optionalAddOns) {
      if (lessonData.optionalAddOns.supplementalLinks !== undefined) updateRecord.supplemental_links = lessonData.optionalAddOns.supplementalLinks
      if (lessonData.optionalAddOns.reflections !== undefined) updateRecord.teacher_reflections = lessonData.optionalAddOns.reflections
    }
    
    // Update status/publish
    if (lessonData.status !== undefined) {
      updateRecord.status = lessonData.status
      if (lessonData.status === 'published') {
        updateRecord.published_at = new Date().toISOString()
      }
    }
    
    // Perform update
    const { data: updated, error: updateError } = await supabase
      .from('lessons')
      .update(updateRecord)
      .eq('id', lessonId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return res.status(200).json({
      lesson: updated,
      message: 'Lesson plan updated successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to update lesson plan', 400)
  }
}

// Delete Lesson (soft delete/archive)
async function handleDeleteLesson(req, res, teacherId) {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { lessonId } = req.query

    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID required' })
    }
    
    // Verify ownership
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, teacher_id')
      .eq('id', lessonId)
      .single()
    
    if (fetchError) throw fetchError
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    if (existingLesson.teacher_id !== teacherId) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Soft delete (archive)
    const { error: deleteError } = await supabase
      .from('lessons')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', lessonId)
    
    if (deleteError) throw deleteError
    
    return res.status(200).json({
      message: 'Lesson plan archived successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to archive lesson plan', 400)
  }
}