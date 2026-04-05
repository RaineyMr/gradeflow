// src/lib/lessonPlanAI.js
// ─── Lesson Plan AI Assist Handler ──────────────────────────────────────────
// Implements Mode A (Refine existing section) and Mode B (Generate from scratch)
// for all 10 lesson plan sections via /api/ai endpoint.

const SECTION_PROMPTS = {
  standards: {
    generate: `You are a curriculum specialist. Given the following lesson context, suggest 3-5 relevant learning standards (TEKS or Common Core) that align with this lesson.
    
Context:
- Title: {lessonTitle}
- Subject: {subject}
- Grade: {gradeLevel}
- Objectives: {objectives}

Return ONLY a JSON object with this exact structure:
{
  "standards": [
    "TEKS.SCIENCE.9.2.A",
    "TEKS.SCIENCE.9.3.B"
  ],
  "rationale": "Brief explanation of why these standards align with the lesson"
}`,

    refine: `You are a curriculum specialist. Review the selected standards below and suggest any improvements or additional standards that would better align with this lesson.

Current Standards:
{currentStandards}

Lesson Context:
- Title: {lessonTitle}
- Subject: {subject}
- Grade: {gradeLevel}
- Objectives: {objectives}

Return ONLY a JSON object with this exact structure:
{
  "standards": ["Updated list of standards"],
  "suggestions": "Specific suggestions for improvement or addition",
  "removed": ["Any standards to remove and why"],
  "added": ["Any new standards to add and why"]
}`
  },

  objectives: {
    generate: `You are an instructional designer. Generate 3-5 clear, measurable learning objectives using Bloom's Taxonomy for this lesson.

Lesson Context:
- Title: {lessonTitle}
- Subject: {subject}
- Grade: {gradeLevel}
- Standards: {standards}
- Lesson Steps: {lessonStepsHint}

Use action verbs (identify, explain, compare, create, etc.). Format as bullet points.

Return ONLY a JSON object with this structure:
{
  "objectives": [
    "Students will be able to identify...",
    "Students will be able to explain..."
  ],
  "bloomsLevel": "Application/Analysis/Synthesis based on the grade level and content"
}`,

    refine: `You are an instructional designer. Review and improve the following learning objectives to ensure they are specific, measurable, and aligned with the lesson content.

Current Objectives:
{currentObjectives}

Lesson Context:
- Title: {lessonTitle}
- Grade: {gradeLevel}
- Standards: {standards}

Provide suggestions for:
1. Clarity and specificity
2. Measurability
3. Alignment with standards
4. Age-appropriateness

Return ONLY JSON:
{
  "objectives": ["Improved objectives"],
  "feedback": "Detailed feedback on improvements",
  "bloomsLevel": "Identified Bloom's level"
}`
  },

  cfs: {
    generate: `You are a culturally responsive teaching specialist. Create success criteria and culturally responsive teaching notes for this lesson.

Lesson Context:
- Title: {lessonTitle}
- Subject: {subject}
- Grade: {gradeLevel}
- Objectives: {objectives}
- Learner Background: {learnerBackground}

Success Criteria should be observable, measurable outcomes.
CRT Notes should incorporate student backgrounds, diverse perspectives, and real-world connections.

Return ONLY JSON:
{
  "successCriteria": [
    "Students will be able to...",
    "Student work will demonstrate..."
  ],
  "culturallyResponsiveNotes": [
    "Incorporate examples from...",
    "Highlight contributions from...",
    "Connect to real-world issues..."
  ],
  "rationale": "How these criteria ensure equitable access and achievement"
}`,

    refine: `You are a culturally responsive teaching specialist. Review and enhance the success criteria and cultural responsiveness of this lesson.

Current Success Criteria:
{currentSuccessCriteria}

Current CRT Notes:
{currentCRTNotes}

Lesson Context:
- Title: {lessonTitle}
- Grade: {gradeLevel}

Suggestions should address:
1. Specificity and measurability of criteria
2. Depth of cultural responsiveness
3. Inclusion of diverse voices and perspectives
4. Real-world relevance

Return ONLY JSON:
{
  "successCriteria": ["Enhanced criteria"],
  "culturallyResponsiveNotes": ["Enhanced CRT notes"],
  "suggestions": "Specific improvements made"
}`
  },

  lessonSteps: {
    generate: `You are an experienced teacher. Design detailed lesson steps for this 45-minute lesson following the 6-step instructional model.

Lesson Context:
- Title: {lessonTitle}
- Grade: {gradeLevel}
- Subject: {subject}
- Objectives: {objectives}
- Accommodations to Consider: {accommodations}

Provide specific, actionable steps for each phase with timing estimates. Total should be ~45 minutes.

Return ONLY JSON:
{
  "warmUp": "5-10 min: Hook activity that...",
  "directInstruction": "10-15 min: Teacher-led instruction on...",
  "guidedPractice": "10 min: Students practice with support by...",
  "independentPractice": "10-15 min: Students work independently on...",
  "closure": "5 min: Summarize and connect to objectives by...",
  "extension": "For early finishers or advanced students: Challenge activity on...",
  "totalMinutes": 45
}`,

    refine: `You are an experienced teacher. Review and improve these lesson steps to be more engaging, inclusive, and aligned with the learning objectives.

Current Lesson Steps:
{currentLessonSteps}

Lesson Context:
- Objectives: {objectives}
- Grade: {gradeLevel}
- Common Student Misconceptions: {misconceptions}

Suggestions should improve:
1. Student engagement and relevance
2. Clarity of instructions
3. Differentiation opportunities
4. Pacing and time management
5. Assessment during each phase

Return ONLY JSON:
{
  "warmUp": "Improved warm-up",
  "directInstruction": "Improved instruction",
  "guidedPractice": "Improved practice",
  "independentPractice": "Improved practice",
  "closure": "Improved closure",
  "extension": "Improved extension",
  "suggestions": "List of improvements made",
  "totalMinutes": 45
}`
  },

  exitTicket: {
    generate: `You are an assessment specialist. Create an exit ticket (quick formative assessment) to check understanding of the lesson objectives.

Lesson Context:
- Title: {lessonTitle}
- Objectives: {objectives}
- Grade: {gradeLevel}

Exit Ticket should have 2-4 questions that:
1. Check understanding of main concept
2. Assess procedural fluency (if applicable)
3. Probe for misconceptions
4. Take 3-5 minutes max

Include a mix of question types (multiple choice, short answer, drawing).

Return ONLY JSON:
{
  "questions": [
    {
      "number": 1,
      "type": "open-ended or multiple-choice",
      "question": "Question text",
      "acceptableSolutions": ["Acceptable answer 1", "Acceptable answer 2"]
    }
  ],
  "timeEstimate": "3-5 minutes",
  "purpose": "Checks understanding of: ..."
}`,

    refine: `You are an assessment specialist. Review and improve this exit ticket to better assess the learning objectives.

Current Exit Ticket:
{currentExitTicket}

Lesson Objectives:
{objectives}

Grade Level: {gradeLevel}

Improvements should address:
1. Alignment with objectives
2. Clarity of wording (age-appropriate language)
3. Balance of question types
4. Feasibility within 5 minutes
5. Ability to identify misconceptions

Return ONLY JSON:
{
  "questions": ["Improved questions with rationale"],
  "suggestions": "Specific improvements made",
  "timeEstimate": "3-5 minutes"
}`
  },

  homework: {
    generate: `You are a teacher. Design a homework assignment that reinforces today's learning objectives and can be completed in 20-30 minutes.

Lesson Context:
- Title: {lessonTitle}
- Objectives: {objectives}
- Grade: {gradeLevel}
- What was covered: {lessonStepsSummary}

Assignment should:
1. Build on today's lesson without requiring new instruction
2. Provide meaningful practice of key concepts
3. Be appropriate for {gradeLevel}
4. Include clear expectations and due date

Return ONLY JSON:
{
  "assignmentDescription": "Detailed description of homework task",
  "objectives": "What skills/concepts this reinforces",
  "timeEstimate": "20-30 minutes",
  "resources": "Any materials students need",
  "suggestedDueDate": "E.g., due next class period",
  "pointsPossible": 50,
  "acceptanceCriteria": ["Clear criteria for completion"]
}`,

    refine: `You are a teacher. Review and improve this homework assignment to better support student learning.

Current Assignment:
{currentHomework}

Lesson Objectives:
{objectives}

Grade: {gradeLevel}
Students with Accommodations: {accommodations}

Improvements should address:
1. Clarity of expectations
2. Differentiation for varied learners
3. Feasibility in 20-30 minutes
4. Connection to lesson objectives
5. Accessibility for students with accommodations

Return ONLY JSON:
{
  "assignmentDescription": "Improved assignment",
  "differentiation": ["Modifications for different learners"],
  "suggestions": "Improvements made",
  "pointsPossible": 50
}`
  }
}

// ─── Main AI Assist Handler ────────────────────────────────────────────────
export async function handleLessonPlanAIAssist(section, mode, lessonData) {
  if (!SECTION_PROMPTS[section]) {
    throw new Error(`Unknown lesson plan section: ${section}`)
  }

  if (!['generate', 'refine'].includes(mode)) {
    throw new Error(`Unknown AI mode: ${mode}. Must be 'generate' or 'refine'`)
  }

  const promptTemplate = SECTION_PROMPTS[section][mode]
  const prompt = buildPrompt(promptTemplate, section, lessonData)

  try {
    // Call /api/ai with intent-based routing
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'lesson-plan-section',
        section,
        mode,
        prompt,
        metadata: {
          lessonTitle: lessonData.header?.title,
          subject: lessonData.header?.subject,
          gradeLevel: lessonData.header?.gradeLevel,
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'AI request failed')
    }

    const result = await response.json()
    
    // Parse and validate JSON response
    let parsed = result.content
    if (typeof parsed === 'string') {
      parsed = safeParseJSON(parsed)
    }

    if (!parsed) {
      throw new Error('Failed to parse AI response as JSON')
    }

    return {
      success: true,
      section,
      mode,
      data: parsed,
      tokensUsed: result.tokensUsed || 0,
      timestamp: new Date().toISOString()
    }

  } catch (err) {
    console.error(`AI assist failed for ${section} (${mode}):`, err)
    return {
      success: false,
      section,
      mode,
      error: err.message
    }
  }
}

// ─── Helper: Build Prompt from Template ────────────────────────────────────
function buildPrompt(template, section, lessonData) {
  let prompt = template

  // Common replacements
  const replacements = {
    '{lessonTitle}': lessonData.header?.title || 'Untitled Lesson',
    '{subject}': lessonData.header?.subject || '',
    '{gradeLevel}': lessonData.header?.gradeLevel || '',
    '{standards}': lessonData.standards ? lessonData.standards.join(', ') : 'Not yet selected',
    '{objectives}': lessonData.objectives || 'Not yet written',
    '{currentObjectives}': lessonData.objectives || '',
    '{currentSuccessCriteria}': lessonData.cfs?.successCriteria || '',
    '{currentCRTNotes}': lessonData.cfs?.culturalNotes || '',
    '{currentLessonSteps}': formatLessonSteps(lessonData.lessonSteps),
    '{lessonStepsHint}': generateLessonStepsHint(lessonData),
    '{currentExitTicket}': lessonData.exitTicket || '',
    '{currentHomework}': lessonData.homework?.assignment || '',
    '{accommodations}': 'To be provided by teacher',
    '{misconceptions}': 'Common grade-level misconceptions',
    '{learnerBackground}': 'Diverse student backgrounds and experiences',
    '{lessonStepsSummary}': generateLessonStepsSummary(lessonData.lessonSteps),
  }

  // Replace all placeholders
  Object.entries(replacements).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(key, 'g'), value)
  })

  return prompt
}

// ─── Helper: Safe JSON Parse ──────────────────────────────────────────────
function safeParseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (e1) {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    } catch (e2) {
      return null
    }
  }
  return null
}

// ─── Helper: Format Lesson Steps ───────────────────────────────────────────
function formatLessonSteps(steps) {
  if (!steps) return 'No steps defined yet'
  
  const parts = []
  if (steps.warmUp) parts.push(`1. Warm-Up: ${steps.warmUp.substring(0, 100)}...`)
  if (steps.directInstruction) parts.push(`2. Direct Instruction: ${steps.directInstruction.substring(0, 100)}...`)
  if (steps.guidedPractice) parts.push(`3. Guided Practice: ${steps.guidedPractice.substring(0, 100)}...`)
  if (steps.independentPractice) parts.push(`4. Independent Practice: ${steps.independentPractice.substring(0, 100)}...`)
  if (steps.closure) parts.push(`5. Closure: ${steps.closure.substring(0, 100)}...`)
  if (steps.extension) parts.push(`6. Extension: ${steps.extension.substring(0, 100)}...`)
  
  return parts.length ? parts.join('\n') : 'No steps defined yet'
}

// ─── Helper: Generate Lesson Steps Hint ────────────────────────────────────
function generateLessonStepsHint(lessonData) {
  if (!lessonData.objectives) return 'Objectives will be available after they are created'
  
  return `Based on objectives: ${lessonData.objectives.substring(0, 150)}...`
}

// ─── Helper: Generate Lesson Steps Summary ─────────────────────────────────
function generateLessonStepsSummary(steps) {
  if (!steps || !Object.values(steps).some(s => s)) return 'No steps defined yet'
  
  return [
    steps.warmUp && `Warm-up: ${steps.warmUp.substring(0, 60)}...`,
    steps.directInstruction && `Instruction: ${steps.directInstruction.substring(0, 60)}...`,
    steps.guidedPractice && `Guided practice: ${steps.guidedPractice.substring(0, 60)}...`,
    steps.independentPractice && `Independent work: ${steps.independentPractice.substring(0, 60)}...`,
  ].filter(Boolean).join('\n')
}

// ─── Export for use in components ──────────────────────────────────────────
export default {
  handleLessonPlanAIAssist,
  SECTION_PROMPTS
}
