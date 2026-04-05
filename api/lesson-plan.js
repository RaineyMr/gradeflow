// api/lesson-plan.js
// ─── GradeFlow Lesson Plan API (v2) ──────────────────────────────────────────
// Handles the 10-section lesson plan model with CFS, proper lesson steps,
// optional add-ons, and per-section AI assist tracking.

import { supabase } from '../lib/supabase'

// ── Helper Functions ───────────────────────────────────────────────────────
function handleApiError(res, error, message, statusCode = 500) {
  console.error('Lesson Plan API Error:', error)
  return res.status(statusCode).json({ 
    error: message || 'Internal server error',
    details: error.message 
  })
}

function validateLessonData(data) {
  const required = ['header']
  const missing = required.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const headerRequired = ['title', 'subject', 'gradeLevel']
  const headerMissing = headerRequired.filter(f => !data.header[f] || data.header[f].toString().trim() === '')
  
  if (headerMissing.length > 0) {
    throw new Error(`Missing required header fields: ${headerMissing.join(', ')}`)
  }
  
  return true
}

// ── Extract Teacher ID from Auth Header ────────────────────────────────
function extractTeacherId(authHeader) {
  if (!authHeader) return null
  
  // For now, simplified extraction. In production, use proper JWT parsing
  // Format: "Bearer <token>"
  const token = authHeader.replace('Bearer ', '')
  // TODO: Parse JWT and extract user ID
  return token
}

// ── Main Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }
    
    const teacherId = extractTeacherId(authHeader)
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

// ── Get Lessons ────────────────────────────────────────────────────────
async function handleGetLessons(req, res, teacherId) {
  try {
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

// ── Create Lesson ──────────────────────────────────────────────────────
async function handleCreateLesson(req, res, teacherId) {
  try {
    const lessonData = req.body
    
    // Validate
    validateLessonData(lessonData)
    
    // Map new 10-section model to lessons table columns
    const lessonRecord = {
      teacher_id: teacherId,
      class_id: lessonData.classId || null,
      
      // Section 1: Header
      title: lessonData.header.title,
      subject: lessonData.header.subject,
      grade_level: lessonData.header.gradeLevel,
      lesson_date: lessonData.header.date || new Date().toISOString().split('T')[0],
      
      // Section 2: Standards (stored as array, relationships in lesson_standards table)
      standards: lessonData.standards || [],
      
      // Section 3: Objectives
      objectives: lessonData.objectives || '',
      
      // Section 4: CFS (Success Criteria + Culturally Responsive)
      criteria_for_success: lessonData.cfs?.successCriteria || '',
      cultural_notes: lessonData.cfs?.culturalNotes || '',
      
      // Section 5: Lesson Steps (6 substeps)
      warm_up: lessonData.lessonSteps?.warmUp || '',
      direct_instruction: lessonData.lessonSteps?.directInstruction || '',
      guided_practice: lessonData.lessonSteps?.guidedPractice || '',
      independent_practice: lessonData.lessonSteps?.independentPractice || '',
      closure: lessonData.lessonSteps?.closure || '',
      extension: lessonData.lessonSteps?.extension || '',
      
      // Section 6: Exit Ticket
      exit_ticket: lessonData.exitTicket || '',
      
      // Section 7: Homework
      homework_assignment: lessonData.homework?.assignment || '',
      homework_due_date: lessonData.homework?.dueDate || null,
      homework_max_points: lessonData.homework?.maxPoints ? parseInt(lessonData.homework.maxPoints) : null,
      
      // Section 8: Accommodations (text field; specific accommodations in lesson_accommodations table)
      accommodations_notes: lessonData.accommodations || '',
      
      // Section 9: Attachments (file references in lesson_attachments table)
      // (handled separately below)
      
      // Section 10: Optional Add-Ons
      enrichment_activities: lessonData.optionalAddOns?.enrichment || '',
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
        // Don't fail the entire request if standards fail
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

// ── Update Lesson ──────────────────────────────────────────────────────
async function handleUpdateLesson(req, res, teacherId) {
  try {
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
    
    // Section 5: Lesson Steps
    if (lessonData.lessonSteps) {
      if (lessonData.lessonSteps.warmUp !== undefined) updateRecord.warm_up = lessonData.lessonSteps.warmUp
      if (lessonData.lessonSteps.directInstruction !== undefined) updateRecord.direct_instruction = lessonData.lessonSteps.directInstruction
      if (lessonData.lessonSteps.guidedPractice !== undefined) updateRecord.guided_practice = lessonData.lessonSteps.guidedPractice
      if (lessonData.lessonSteps.independentPractice !== undefined) updateRecord.independent_practice = lessonData.lessonSteps.independentPractice
      if (lessonData.lessonSteps.closure !== undefined) updateRecord.closure = lessonData.lessonSteps.closure
      if (lessonData.lessonSteps.extension !== undefined) updateRecord.extension = lessonData.lessonSteps.extension
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
    
    // Section 10: Optional Add-Ons
    if (lessonData.optionalAddOns) {
      if (lessonData.optionalAddOns.enrichment !== undefined) updateRecord.enrichment_activities = lessonData.optionalAddOns.enrichment
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

// ── Delete Lesson (soft delete/archive) ────────────────────────────────
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
      </div>
      {children}
    </div>
  )
}

// ─── 1. LESSON HEADER ──────────────────────────────────────────────────────
function LessonHeaderSection({ data, onChange }) {
  return (
    <Section title="Lesson Header">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Lesson Title *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange('header', { ...data, title: e.target.value })}
            placeholder="e.g., Photosynthesis Basics"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Date *
          </label>
          <input
            type="date"
            value={data.date || ''}
            onChange={(e) => onChange('header', { ...data, date: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Subject *
          </label>
          <input
            type="text"
            value={data.subject || ''}
            onChange={(e) => onChange('header', { ...data, subject: e.target.value })}
            placeholder="e.g., Biology, Mathematics, English"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Grade Level *
          </label>
          <select
            value={data.gradeLevel || ''}
            onChange={(e) => onChange('header', { ...data, gradeLevel: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          >
            <option value="">Select Grade Level</option>
            {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </Section>
  )
}

// ─── 2. STANDARDS ──────────────────────────────────────────────────────────
function StandardsSection({ data, onChange, onAIGenerate }) {
  const [showPicker, setShowPicker] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('standards', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="2. Standards"
      onAIGenerate={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Search TEKS / Common Core Standards
        </label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${C.blue}`,
            background: C.inner,
            color: C.blue,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showPicker ? '▲ Hide Picker' : '▼ Browse Standards'}
        </button>
      </div>

      {showPicker && (
        <StandardsSelector
          topic={data.title}
          maxSelections={5}
          showRecommendations
          onStandardsChange={(standards) => {
            onChange('standards', standards)
            setShowPicker(false)
          }}
        />
      )}

      {data.standards && data.standards.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
            Selected ({data.standards.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.standards.map((std, i) => (
              <span
                key={i}
                style={{
                  background: `${C.blue}20`,
                  color: C.blue,
                  border: `1px solid ${C.blue}40`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {std}
                <button
                  onClick={() => onChange('standards', data.standards.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 14, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── 3. OBJECTIVES ────────────────────────────────────────────────────────
function ObjectivesSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('objectives', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="3. Learning Objectives"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
        By the end of this lesson, students will be able to...
      </label>
      <textarea
        value={data.objectives || ''}
        onChange={(e) => onChange('objectives', e.target.value)}
        placeholder="e.g., - Identify the three main parts of a plant cell
- Explain how photosynthesis converts light to chemical energy
- Compare cellular respiration and photosynthesis"
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, monospace',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </Section>
  )
}

// ─── 4. CFS (Culturally Responsive Teaching & Success Criteria) ──────────
function CFSSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('cfs', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="4. Success Criteria & Culturally Responsive Teaching"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Success Criteria: Students will demonstrate understanding by...
        </label>
        <textarea
          value={data.successCriteria || ''}
          onChange={(e) => onChange('cfs', { ...data, successCriteria: e.target.value })}
          placeholder="e.g., - Correctly label plant cell structures on a diagram
- Write a 3-sentence explanation of photosynthesis
- Score 80% or higher on exit ticket"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Culturally Responsive Notes (optional)
        </label>
        <textarea
          value={data.culturalNotes || ''}
          onChange={(e) => onChange('cfs', { ...data, culturalNotes: e.target.value })}
          placeholder="e.g., Use examples from students' local ecosystems
- Incorporate diverse scientists' contributions
- Connect to real-world environmental justice issues"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>
    </Section>
  )
}

// ─── 5. LESSON STEPS (6 Substeps) ─────────────────────────────────────────
function LessonStepsSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('lessonSteps', mode, data)
    setGenerating(false)
  }

  const steps = [
    { key: 'warmUp', label: 'Warm-Up / Hook', hint: 'Activate prior knowledge & engage students' },
    { key: 'directInstruction', label: 'Direct Instruction', hint: 'Teacher-led instruction & modeling' },
    { key: 'guidedPractice', label: 'Guided Practice', hint: 'Students practice with teacher support' },
    { key: 'independentPractice', label: 'Independent Practice', hint: 'Students work independently' },
    { key: 'closure', label: 'Closure', hint: 'Summarize key concepts & connect to objectives' },
    { key: 'extension', label: 'Extension (if time)', hint: 'Enrichment or challenge activities' },
  ]

  return (
    <Section
      title="5. Lesson Steps"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      {steps.map((step, i) => (
        <div key={step.key} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>
            {i + 1}. {step.label}
          </label>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, margin: '4px 0 8px 0' }}>
            {step.hint}
          </p>
          <textarea
            value={data.lessonSteps?.[step.key] || ''}
            onChange={(e) => onChange('lessonSteps', { ...data.lessonSteps, [step.key]: e.target.value })}
            placeholder={`Describe ${step.label.toLowerCase()}...`}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 80,
              lineHeight: 1.5,
            }}
          />
          {i < steps.length - 1 && (
            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
          )}
        </div>
      ))}
    </Section>
  )
}

// ─── 6. EXIT TICKET ───────────────────────────────────────────────────────
function ExitTicketSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('exitTicket', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="6. Exit Ticket"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
        Quick formative assessment to check student understanding before leaving class.
      </p>
      <textarea
        value={data.exitTicket || ''}
        onChange={(e) => onChange('exitTicket', e.target.value)}
        placeholder="e.g., Question 1: In your own words, explain what photosynthesis is.
Question 2: Name one way photosynthesis differs from cellular respiration.
Question 3: Draw and label the parts of a plant cell involved in photosynthesis."
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          background: C.inner,
          color: C.text,
          outline: 'none',
          minHeight: 120,
          lineHeight: 1.5,
        }}
      />
    </Section>
  )
}

// ─── 7. HOMEWORK ──────────────────────────────────────────────────────────
function HomeworkSection({ data, onChange, onAIGenerate }) {
  const [generating, setGenerating] = React.useState(false)

  const handleAIGenerate = async (mode) => {
    setGenerating(true)
    await onAIGenerate('homework', mode, data)
    setGenerating(false)
  }

  return (
    <Section
      title="7. Homework & Practice"
      onAIGenerate={handleAIGenerate}
      onAIRefine={handleAIGenerate}
      isGenerating={generating}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
          Assignment Description *
        </label>
        <textarea
          value={data.homework?.assignment || ''}
          onChange={(e) => onChange('homework', { ...data.homework, assignment: e.target.value })}
          placeholder="Describe the homework assignment..."
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.inner,
            color: C.text,
            outline: 'none',
            minHeight: 100,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Due Date
          </label>
          <input
            type="date"
            value={data.homework?.dueDate || ''}
            onChange={(e) => onChange('homework', { ...data.homework, dueDate: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
            Max Points (optional)
          </label>
          <input
            type="number"
            value={data.homework?.maxPoints || ''}
            onChange={(e) => onChange('homework', { ...data.homework, maxPoints: e.target.value })}
            placeholder="e.g., 50"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </Section>
  )
}

// ─── 8. ACCOMMODATIONS ────────────────────────────────────────────────────
function AccommodationsSection_Builtin({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>♿ 8. Student Accommodations & Modifications</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Specify lesson-specific accommodations and modifications for students with IEPs, 504 plans, or ELL needs.
          </p>
          <textarea
            value={data.accommodations || ''}
            onChange={(e) => onChange('accommodations', e.target.value)}
            placeholder="e.g., - Provide visual aids for plant cell diagram
- Simplify vocabulary for ELL students
- Allow extended time for exit ticket
- Offer oral response option instead of written"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: C.inner,
              color: C.text,
              outline: 'none',
              minHeight: 120,
              lineHeight: 1.5,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── 9. ATTACHMENTS ───────────────────────────────────────────────────────
function AttachmentsSection_Builtin({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>📎 9. Attachments & Resources</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Worksheets, answer keys, rubrics, images, PDFs, or external links.
          </p>
          <div style={{
            border: `2px dashed ${C.border}`,
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            background: C.inner,
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Tap to upload files
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              PDF, Word, Image, or any file type
            </div>
          </div>

          {data.attachments && data.attachments.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase' }}>
                Attached Files ({data.attachments.length})
              </div>
              {data.attachments.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: C.inner,
                    borderRadius: 6,
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span>📄 {file.name || `File ${i + 1}`}</span>
                  <button
                    onClick={() => {
                      const updated = data.attachments.filter((_, idx) => idx !== i)
                      onChange('attachments', updated)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.red,
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 10. OPTIONAL ADD-ONS ─────────────────────────────────────────────────
function OptionalAddOnsSection({ data, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.inner,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>⭐ 10. Optional Add-Ons</span>
        <span style={{ color: C.muted, fontSize: 13 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Enrichment Activities (for early finishers)
            </label>
            <textarea
              value={data.enrichment || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, enrichment: e.target.value })}
              placeholder="e.g., - Research photosynthesis in different plant types
- Create a photosynthesis comic strip
- Design an experiment to test light requirements"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Supplemental Resources & Links
            </label>
            <textarea
              value={data.supplementalLinks || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, supplementalLinks: e.target.value })}
              placeholder="e.g., - Khan Academy: Plant Cells (https://...)
- National Geographic: Photosynthesis Explainer
- YouTube: Amoeba Sisters Photosynthesis Video"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: 'block' }}>
              Notes & Reflections
            </label>
            <textarea
              value={data.reflections || ''}
              onChange={(e) => onChange('optionalAddOns', { ...data, reflections: e.target.value })}
              placeholder="e.g., - Pacing notes
- Student misconceptions to watch for
- What went well / what to improve next time"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.inner,
                color: C.text,
                outline: 'none',
                minHeight: 100,
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BuildFromScratch Component ────────────────────────────────────────────
function BuildFromScratch({ onBack }) {
  const [lessonData, setLessonData] = React.useState({
    header: { title: '', date: '', subject: '', gradeLevel: '' },
    standards: [],
    objectives: '',
    cfs: { successCriteria: '', culturalNotes: '' },
    lessonSteps: {
      warmUp: '',
      directInstruction: '',
      guidedPractice: '',
      independentPractice: '',
      closure: '',
      extension: '',
    },
    exitTicket: '',
    homework: { assignment: '', dueDate: '', maxPoints: '' },
    accommodations: '',
    attachments: [],
    optionalAddOns: { enrichment: '', supplementalLinks: '', reflections: '' },
  })

  const [saving, setSaving] = React.useState(false)

  function handleSectionChange(section, value) {
    setLessonData(prev => ({
      ...prev,
      [section]: value,
    }))
  }

  async function handleAIAssist(section, mode, sectionData) {
    console.log(`AI ${mode} for ${section}:`, sectionData)
    // TODO: Call /api/ai with intent "lesson-plan-section"
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      })

      if (!response.ok) throw new Error('Save failed')
      alert('Lesson plan saved!')
      onBack()
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: 'Inter, Arial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
              📝 Build Lesson Plan
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0 0' }}>
              Create comprehensive lesson plan
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onBack}
              style={{
                background: C.inner,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !lessonData.header.title.trim()}
              style={{
                background: lessonData.header.title.trim() ? C.blue : C.muted,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: lessonData.header.title.trim() && !saving ? 'pointer' : 'not-allowed',
                opacity: (lessonData.header.title.trim() && !saving) ? 1 : 0.6,
              }}
            >
              {saving ? '💾 Saving...' : '💾 Save Lesson Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
        <LessonHeaderSection data={lessonData.header} onChange={handleSectionChange} />
        <StandardsSection data={lessonData.standards} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ObjectivesSection data={lessonData.objectives} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <CFSSection data={lessonData.cfs} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <LessonStepsSection data={lessonData.lessonSteps} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <ExitTicketSection data={lessonData.exitTicket} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <HomeworkSection data={lessonData.homework} onChange={handleSectionChange} onAIGenerate={handleAIAssist} />
        <AccommodationsSection_Builtin data={lessonData.accommodations} onChange={handleSectionChange} />
        <AttachmentsSection_Builtin data={lessonData.attachments} onChange={handleSectionChange} />
        <OptionalAddOnsSection data={lessonData.optionalAddOns} onChange={handleSectionChange} />
      </div>
    </div>
  )
}
function UploadDoc({ onBack }) {
  const { setAccommodations } = useStore()
  const fileRef = useRef()
  const [file,           setFile]           = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [extracting,     setExtracting]     = useState(false)
  const [done,           setDone]           = useState(false)
  const [extractResult,  setExtractResult]  = useState(null) // { count, noAccommodationsFound }
  const [extractError,   setExtractError]   = useState('')

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    setExtractError('')
    setExtractResult(null)

    // Simulate document processing
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setDone(true)

    // Attempt AI accommodation extraction
    setExtracting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const dataUrl   = ev.target.result
          const base64    = dataUrl.split(',')[1]
          const mediaType = f.type || 'image/jpeg'

          // For text files (CSV, plain text), pass as textContent instead
          const isText = f.type.includes('text') || f.name.endsWith('.csv') || f.name.endsWith('.txt')

          let result
          if (isText) {
            // Decode base64 back to text for CSV/txt files
            const textContent = atob(base64)
            result = await extractAccommodations({ textContent })
          } else {
            result = await extractAccommodations({ imageBase64: base64, mediaType })
          }

          if (result?.noAccommodationsFound || !result?.students?.length) {
            setExtractResult({ count: 0, noAccommodationsFound: true })
          } else {
            setAccommodations(result.students)
            setExtractResult({ count: result.students.length })
          }
        } catch (err) {
          setExtractError('Could not extract accommodation data. You can add it manually in any lesson plan.')
        }
        setExtracting(false)
      }
      reader.readAsDataURL(f)
    } catch (err) {
      setExtractError('Could not read file for accommodation extraction.')
      setExtracting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Reading your document..." />

  if (done) return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>

      <div style={{ background:'#0f2a1a', border:`1px solid ${C.green}40`, borderRadius:14, padding:'14px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>📄</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{file?.name}</div>
          <div style={{ color:C.green, fontSize:11 }}>✓ Uploaded successfully</div>
        </div>
      </div>

      {/* Accommodation extraction result */}
      {extracting && (
        <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'12px 14px', marginBottom:14, fontSize:12, color:C.purple }}>
          ✨ Scanning for student accommodations...
        </div>
      )}

      {!extracting && extractResult && extractResult.count > 0 && (
        <div style={{ background:`${C.purple}12`, border:`1px solid ${C.purple}30`, borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.purple, marginBottom:4 }}>
            ✨ Found {extractResult.count} student{extractResult.count !== 1 ? 's' : ''} with accommodations
          </div>
          <div style={{ fontSize:11, color:C.muted }}>
            Accommodation data has been loaded. Open any lesson plan to review, edit, and get AI-suggested adjustments.
          </div>
        </div>
      )}

      {!extracting && extractResult?.noAccommodationsFound && (
        <div style={{ background:`${C.amber}10`, border:`1px solid ${C.amber}25`, borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.amber, marginBottom:4 }}>No accommodation data found</div>
          <div style={{ fontSize:11, color:C.muted }}>
            The document doesn't appear to contain accommodation indicators (IEP, 504, ELL). You can add students and their needs manually in any lesson plan.
          </div>
        </div>
      )}

      {!extracting && extractError && (
        <div style={{ background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:12, padding:'12px 14px', marginBottom:14, fontSize:12, color:C.red }}>
          {extractError}
        </div>
      )}

      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Your document has been imported and is ready to use.</p>

      <button onClick={onBack} style={{ background:'var(--school-color)', border:'none', borderRadius:999, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
        Go to Lesson Plans
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px' }}>
      <button onClick={onBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>📄 Upload Lesson Plan / Roster</h1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:8 }}>PDF · Word · CSV · Excel · Google Doc · Any format</p>
      <p style={{ color:C.purple, fontSize:12, fontWeight:600, marginBottom:20 }}>
        ✨ GradeFlow will automatically scan for student accommodations (IEP, 504, ELL) and load them into your lesson plans.
      </p>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,image/*" onChange={handleFile} style={{ display:'none' }} />
      <button onClick={() => fileRef.current?.click()}
        style={{ width:'100%', background:C.card, border:`2px dashed ${C.border}`, borderRadius:18, padding:'40px 20px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:48 }}>📤</span>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Tap to choose file</span>
        <span style={{ fontSize:12, color:C.muted }}>PDF · Word · CSV · Excel · Google Doc · Image</span>
      </button>
    </div>
  )
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
export default function LessonPlan({ initialMode, classId, onBack }) {
  const { goBack, getTodayLesson } = useStore()
  const handleBack  = onBack || goBack
  const todayLesson = classId ? getTodayLesson(classId) : null
  const startMode   = initialMode === 'view' && todayLesson ? 'view' : (initialMode && initialMode !== 'view' ? initialMode : 'menu')
  const [mode, setMode] = useState(startMode)

  if (mode === 'view' && todayLesson) return <LessonView lesson={todayLesson} onBack={handleBack} onEdit={() => setMode('build')} />
  if (mode === 'ai')     return <AIPlanGenerator   onBack={() => setMode('menu')} />
  if (mode === 'build')  return <BuildFromScratch onBack={() => setMode('menu')} />
  if (mode === 'upload') return <UploadDoc        onBack={() => setMode('menu')} />

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', padding:'20px 16px', paddingBottom:80 }}>
      <button onClick={handleBack} style={{ background:C.inner, border:'none', borderRadius:10, padding:'8px 14px', color:C.text, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20 }}>← Back</button>
      <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Lesson Plans</h1>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 24px' }}>Create · Upload · AI-generate</p>

      {[
        { id:'ai',     icon:'✨', label:'AI Generate',       desc:'Fill in subject, grade, topic → full lesson plan',  color:C.purple },
        { id:'build',  icon:'📝', label:'Build from Scratch', desc:'Write your own lesson plan with guided sections',   color:C.blue   },
        { id:'upload', icon:'📤', label:'Upload Document',   desc:'PDF · Word · CSV · Image — AI scans for accommodations', color:C.teal },
      ].map(item => (
        <button key={item.id} onClick={() => setMode(item.id)}
          style={{ width:'100%', background:C.card, border:`1px solid ${item.color}22`, borderRadius:16, padding:16, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, marginBottom:12 }}
          onMouseEnter={e => e.currentTarget.style.borderColor=item.color}
          onMouseLeave={e => e.currentTarget.style.borderColor=`${item.color}22`}>
          <div style={{ width:48, height:48, borderRadius:12, background:`${item.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2 }}>{item.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{item.desc}</div>
          </div>
          <span style={{ marginLeft:'auto', color:C.muted, fontSize:18 }}>›</span>
        </button>
      ))}
    </div>
  )
}
