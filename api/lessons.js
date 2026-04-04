// api/lessons.js
// ─── GradeFlow Lessons CRUD API ─────────────────────────────────────────────
// Handles CRUD operations for lesson plans with enhanced features

import { supabase } from '../lib/supabase'

// ── Helper Functions ───────────────────────────────────────────────────────
function handleApiError(res, error, message, statusCode = 500) {
  console.error('Lessons API Error:', error)
  return res.status(statusCode).json({ 
    error: message || 'Internal server error',
    details: error.message 
  })
}

function validateLessonData(data) {
  const required = ['title', 'subject', 'gradeLevel']
  const missing = required.filter(field => !data[field] || data[field].trim() === '')
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
  
  return true
}

// ── Main Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { method } = req
    
    // Get user from auth header (simplified - you'll want proper JWT validation)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }
    
    // For now, extract teacher ID from auth header (replace with proper JWT parsing)
    const teacherId = authHeader.replace('Bearer ', '') // Simplified - use proper JWT validation
    
    switch (method) {
      
      case 'GET':
        await handleGetLessons(req, res, teacherId)
        break
        
      case 'POST':
        await handleCreateLesson(req, res, teacherId)
        break
        
      case 'PUT':
        await handleUpdateLesson(req, res, teacherId)
        break
        
      case 'DELETE':
        await handleDeleteLesson(req, res, teacherId)
        break
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
    
  } catch (error) {
    return handleApiError(res, error)
  }
}

// ── Get Lessons ───────────────────────────────────────────────────────
async function handleGetLessons(req, res, teacherId) {
  try {
    const { classId, status, limit = 20, offset = 0 } = req.query
    
    let query = supabase
      .from('lessons')
      .select(`
        *,
        lesson_standards(standard_id, standard_label),
        lesson_attachments(id, file_name, file_type),
        lesson_accommodations(id, student_id, accommodation_type, specific_needs)
      `)
      .eq('teacher_id', teacherId)
    
    // Apply filters
    if (classId) query = query.eq('class_id', classId)
    if (status) query = query.eq('status', status)
    
    // Apply joins
    query = query
      .leftJoin('lesson_standards', 'lessons.id', 'lesson_standards.lesson_id')
      .leftJoin('lesson_attachments', 'lessons.id', 'lesson_attachments.lesson_id')
      .leftJoin('lesson_accommodations', 'lessons.id', 'lesson_accommodations.lesson_id')
    
    const { data: lessons, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(limit))
    
    if (error) throw error
    
    return res.status(200).json({
      lessons,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: lessons.length === parseInt(limit)
      }
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch lessons')
  }
}

// ── Create Lesson ───────────────────────────────────────────────────
async function handleCreateLesson(req, res, teacherId) {
  try {
    const lessonData = req.body
    
    // Validate required fields
    validateLessonData(lessonData)
    
    // Create lesson with basic info
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        teacher_id: teacherId,
        class_id: lessonData.classId,
        title: lessonData.title,
        subject: lessonData.subject,
        grade_level: lessonData.gradeLevel,
        lesson_date: lessonData.date || new Date().toISOString().split('T')[0],
        duration_minutes: lessonData.durationMinutes || 45,
        standards: lessonData.standards || [],
        objectives: lessonData.objectives || '',
        criteria_for_success: lessonData.criteriaForSuccess || '',
        warm_up: lessonData.steps?.warmUp || '',
        direct_instruction: lessonData.steps?.directInstruction || '',
        guided_practice: lessonData.steps?.guidedPractice || '',
        independent_practice: lessonData.steps?.independentPractice || '',
        differentiation: lessonData.steps?.differentiation || '',
        checks_for_understanding: lessonData.steps?.checksForUnderstanding || '',
        exit_ticket: lessonData.steps?.exitTicket || '',
        homework: lessonData.homework?.text || '',
        status: 'draft',
        ai_calls_count: 0,
        ai_tokens_used: 0
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Handle standards if provided
    if (lessonData.standards && lessonData.standards.length > 0) {
      const standardsToInsert = lessonData.standards.map(standard => ({
        lesson_id: lesson.id,
        standard_id: typeof standard === 'string' ? standard : standard.standard_id,
        standard_source: typeof standard === 'string' ? 'TEKS' : standard.standard_source || 'TEKS',
        standard_label: typeof standard === 'string' ? standard : standard.standard_label || standard.description
      }))
      
      const { error: standardsError } = await supabase
        .from('lesson_standards')
        .insert(standardsToInsert)
      
      if (standardsError) console.error('Standards insertion error:', standardsError)
    }
    
    // Handle accommodations if provided
    if (lessonData.accommodations?.students && lessonData.accommodations.students.length > 0) {
      const accommodationsToInsert = lessonData.accommodations.students.map(student => ({
        lesson_id: lesson.id,
        student_id: student.id, // You'll need to map student names to IDs
        accommodation_type: student.accommodationType,
        specific_needs: Array.isArray(student.specificNeeds) 
          ? student.specificNeeds.join(', ') 
          : student.specificNeeds || '',
        instructional_adjustments: student.suggestedAdjustments || '',
        is_override: true // These are lesson-specific overrides
      }))
      
      const { error: accommodationsError } = await supabase
        .from('lesson_accommodations')
        .insert(accommodationsToInsert)
      
      if (accommodationsError) console.error('Accommodations insertion error:', accommodationsError)
    }
    
    return res.status(201).json({
      lesson,
      message: 'Lesson created successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to create lesson')
  }
}

// ── Update Lesson ───────────────────────────────────────────────────
async function handleUpdateLesson(req, res, teacherId) {
  try {
    const { lessonId } = req.query
    const updateData = req.body
    
    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID required' })
    }
    
    // First verify ownership
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
    
    // Update lesson
    const updateFields = {}
    
    // Map frontend fields to database columns
    if (updateData.title !== undefined) updateFields.title = updateData.title
    if (updateData.subject !== undefined) updateFields.subject = updateData.subject
    if (updateData.gradeLevel !== undefined) updateFields.grade_level = updateData.gradeLevel
    if (updateData.date !== undefined) updateFields.lesson_date = updateData.date
    if (updateData.durationMinutes !== undefined) updateFields.duration_minutes = updateData.durationMinutes
    if (updateData.standards !== undefined) updateFields.standards = updateData.standards
    if (updateData.objectives !== undefined) updateFields.objectives = updateData.objectives
    if (updateData.criteriaForSuccess !== undefined) updateFields.criteria_for_success = updateData.criteriaForSuccess
    
    // Handle steps object
    if (updateData.steps) {
      if (updateData.steps.warmUp !== undefined) updateFields.warm_up = updateData.steps.warmUp
      if (updateData.steps.directInstruction !== undefined) updateFields.direct_instruction = updateData.steps.directInstruction
      if (updateData.steps.guidedPractice !== undefined) updateFields.guided_practice = updateData.steps.guidedPractice
      if (updateData.steps.independentPractice !== undefined) updateFields.independent_practice = updateData.steps.independentPractice
      if (updateData.steps.differentiation !== undefined) updateFields.differentiation = updateData.steps.differentiation
      if (updateData.steps.checksForUnderstanding !== undefined) updateFields.checks_for_understanding = updateData.steps.checksForUnderstanding
      if (updateData.steps.exitTicket !== undefined) updateFields.exit_ticket = updateData.steps.exitTicket
    }
    
    if (updateData.homework?.text !== undefined) updateFields.homework = updateData.homework.text
    if (updateData.status !== undefined) updateFields.status = updateData.status
    if (updateData.published_at !== undefined) updateFields.published_at = updateData.status === 'published' ? new Date().toISOString() : null
    
    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update(updateFields)
      .eq('id', lessonId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return res.status(200).json({
      lesson: updatedLesson,
      message: 'Lesson updated successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to update lesson')
  }
}

// ── Delete Lesson ───────────────────────────────────────────────────
async function handleDeleteLesson(req, res, teacherId) {
  try {
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
    
    // Soft delete by archiving
    const { data, error } = await supabase
      .from('lessons')
      .update({ 
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', lessonId)
    
    if (error) throw error
    
    return res.status(200).json({
      message: 'Lesson archived successfully'
    })
    
  } catch (error) {
    return handleApiError(res, error, 'Failed to archive lesson')
  }
}
