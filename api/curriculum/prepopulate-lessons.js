// api/curriculum/prepopulate-lessons.js
// ─── GradeFlow Curriculum Prepopulation API ──────────────────────────────────────────
// Prepopulates teacher lesson plan calendars with lessons from curriculum standards
// Handles TEKS and Louisiana standards, date distribution, and conflict resolution

import { supabase } from '../../lib/supabase'

// ── Helper Functions ───────────────────────────────────────────────────────
function handleApiError(res, error, message, statusCode = 500) {
  console.error('Curriculum Prepopulation API Error:', error)
  return res.status(statusCode).json({ 
    error: message || 'Internal server error',
    details: error.message 
  })
}

function validateRequest(data) {
  const required = ['teacher_id', 'class_id', 'start_date', 'end_date']
  const missing = required.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  // Validate dates
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD format.')
  }
  
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date.')
  }
  
  // Validate lessons per standard
  const lessonsPerStandard = parseInt(data.lessons_per_standard) || 1
  if (lessonsPerStandard < 1 || lessonsPerStandard > 5) {
    throw new Error('Lessons per standard must be between 1 and 5.')
  }
  
  return {
    ...data,
    start_date: startDate,
    end_date: endDate,
    lessons_per_standard: lessonsPerStandard
  }
}

// Generate school days (exclude weekends and holidays)
function generateSchoolDays(startDate, endDate) {
  const schoolDays = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Simple holiday check - can be enhanced with actual school calendar
      const month = currentDate.getMonth() + 1
      const day = currentDate.getDate()
      
      // Basic US holidays (can be customized per district)
      const isHoliday = 
        (month === 7 && day === 4) || // July 4
        (month === 12 && day === 25) || // Christmas
        (month === 1 && day === 1) || // New Year's
        (month === 11 && day >= 22 && day <= 28) // Thanksgiving week (approximate)
      
      if (!isHoliday) {
        schoolDays.push(new Date(currentDate))
      }
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return schoolDays
}

// Distribute dates evenly across available school days
function distributeLessonDates(schoolDays, lessonCount) {
  if (schoolDays.length < lessonCount) {
    throw new Error(`Not enough school days available. Need ${lessonCount} days, but only ${schoolDays.length} school days in date range.`)
  }
  
  const dates = []
  const interval = Math.floor(schoolDays.length / lessonCount)
  
  for (let i = 0; i < lessonCount; i++) {
    const dayIndex = Math.min(i * interval, schoolDays.length - 1)
    dates.push(schoolDays[dayIndex])
  }
  
  return dates
}

// ── Main Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract and validate request data
    const requestData = validateRequest(req.body)
    const { teacher_id, class_id, start_date, end_date, lessons_per_standard, skip_existing = true } = requestData

    // Verify teacher authentication (simplified - use proper JWT in production)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Verify teacher owns the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, teacher_id, subject, grade_level')
      .eq('id', class_id)
      .eq('teacher_id', teacher_id)
      .single()

    if (classError || !classData) {
      return handleApiError(res, classError, 'Class not found or access denied', 404)
    }

    // Get class grade level and subject for standards filtering
    const { subject, grade_level } = classData
    if (!subject || !grade_level) {
      return res.status(400).json({ 
        error: 'Class must have subject and grade_level set before prepopulating lessons' 
      })
    }

    // Get matching standards for this class
    const { data: standards, error: standardsError } = await supabase
      .from('standards_catalog')
      .select('*')
      .eq('subject', subject)
      .contains('grade_levels', [grade_level])
      .order('standard_id')

    if (standardsError) {
      return handleApiError(res, standardsError, 'Failed to retrieve standards')
    }

    if (!standards || standards.length === 0) {
      return res.status(404).json({ 
        error: `No standards found for ${subject} - ${grade_level}` 
      })
    }

    // Check for existing lessons in date range
    const { data: existingLessons, error: existingError } = await supabase
      .from('lessons')
      .select('id, lesson_date')
      .eq('teacher_id', teacher_id)
      .eq('class_id', class_id)
      .gte('lesson_date', start_date.toISOString().split('T')[0])
      .lte('lesson_date', end_date.toISOString().split('T')[0])

    if (existingError) {
      return handleApiError(res, existingError, 'Failed to check existing lessons')
    }

    const existingDates = existingLessons?.map(lesson => lesson.lesson_date) || []
    const schoolDays = generateSchoolDays(start_date, end_date)
    
    // Filter out existing lesson dates if skip_existing is true
    const availableDates = skip_existing 
      ? schoolDays.filter(date => !existingDates.includes(date.toISOString().split('T')[0]))
      : schoolDays

    // Calculate total lessons needed
    const totalLessons = standards.length * lessons_per_standard
    
    if (availableDates.length < totalLessons) {
      return res.status(400).json({ 
        error: `Not enough available school days. Need ${totalLessons} lessons, but only ${availableDates.length} days available (${existingDates.length} already have lessons).`,
        details: {
          totalLessons,
          availableDates: availableDates.length,
          existingLessons: existingDates.length,
          standards: standards.length,
          lessonsPerStandard: lessons_per_standard
        }
      })
    }

    // Generate lesson dates
    const lessonDates = distributeLessonDates(availableDates, totalLessons)

    // Create lesson shells
    const lessonsToCreate = []
    let dateIndex = 0

    for (const standard of standards) {
      for (let i = 0; i < lessons_per_standard; i++) {
        const lessonDate = lessonDates[dateIndex++]
        
        const lessonShell = {
          teacher_id,
          class_id,
          title: `Lesson: ${standard.standard_label.substring(0, 50)}${standard.standard_label.length > 50 ? '...' : ''}`,
          subject,
          grade_level,
          lesson_date: lessonDate.toISOString().split('T')[0],
          duration_minutes: 45, // Default 45-minute lessons
          status: 'draft',
          standards: JSON.stringify([{
            standard_id: standard.standard_id,
            standard_source: standard.standard_source,
            standard_label: standard.standard_label
          }]),
          // Empty placeholders for lesson sections
          objectives: '',
          criteria_for_success: '',
          warm_up: '',
          direct_instruction: '',
          guided_practice: '',
          independent_practice: '',
          differentiation: '',
          checks_for_understanding: '',
          exit_ticket: '',
          homework: '',
          plan_data: JSON.stringify({
            sections: {
              objectives: { content: '', ai_assisted: false },
              criteria_for_success: { content: '', ai_assisted: false },
              warm_up: { content: '', ai_assisted: false },
              direct_instruction: { content: '', ai_assisted: false },
              guided_practice: { content: '', ai_assisted: false },
              independent_practice: { content: '', ai_assisted: false },
              differentiation: { content: '', ai_assisted: false },
              checks_for_understanding: { content: '', ai_assisted: false },
              exit_ticket: { content: '', ai_assisted: false },
              homework: { content: '', ai_assisted: false }
            }
          })
        }

        lessonsToCreate.push(lessonShell)
      }
    }

    // Batch insert lessons
    const { data: createdLessons, error: insertError } = await supabase
      .from('lessons')
      .insert(lessonsToCreate)
      .select('id, lesson_date, title')

    if (insertError) {
      return handleApiError(res, insertError, 'Failed to create lessons')
    }

    // Create lesson_standards junction records
    const lessonStandards = []
    for (let i = 0; i < createdLessons.length; i++) {
      const lesson = createdLessons[i]
      const standardIndex = Math.floor(i / lessons_per_standard)
      const standard = standards[standardIndex]
      
      lessonStandards.push({
        lesson_id: lesson.id,
        standard_id: standard.standard_id,
        standard_source: standard.standard_source,
        standard_label: standard.standard_label
      })
    }

    if (lessonStandards.length > 0) {
      const { error: junctionError } = await supabase
        .from('lesson_standards')
        .insert(lessonStandards)

      if (junctionError) {
        return handleApiError(res, junctionError, 'Failed to link standards to lessons')
      }
    }

    // Return success response
    const response = {
      success: true,
      created_count: createdLessons.length,
      lesson_ids: createdLessons.map(lesson => lesson.id),
      standards_used: standards.length,
      lessons_per_standard,
      date_range: {
        start: start_date.toISOString().split('T')[0],
        end: end_date.toISOString().split('T')[0]
      },
      skipped_existing: skip_existing ? existingDates.length : 0,
      warnings: []
    }

    // Add warnings if applicable
    if (existingDates.length > 0 && skip_existing) {
      response.warnings.push(`Skipped ${existingDates.length} existing lessons`)
    }

    if (availableDates.length > totalLessons) {
      response.warnings.push(`${availableDates.length - totalLessons} school days remain unused`)
    }

    return res.status(201).json(response)

  } catch (error) {
    return handleApiError(res, error, error.message || 'Internal server error')
  }
}
