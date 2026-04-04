import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import BottomNav from '../components/ui/BottomNav'
import StandardsSelector from '../components/standards/StandardsSelector'
import AccommodationsSection from '../components/lesson/AccommodationsSection'

const C = {
  bg: '#ffffff',
  card: '#ffffff',
  inner: '#f8f9fa',
  text: '#1a1a1a',
  muted: '#6c757d',
  border: '#e0e0e0',
  green: '#22c97a',
  blue: '#3b7ef4',
  amber: '#f5a623',
  purple: '#9b6ef5',
  teal: '#0fb8a0',
  red: '#f04a4a',
}

// ─── Lesson Header Component ─────────────────────────────────────────────────────
function LessonHeader({ lessonData, onChange, currentUser }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Lesson Header
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Lesson Name / Title *
          </label>
          <input
            type="text"
            value={lessonData.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Enter lesson title..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Date *
          </label>
          <input
            type="date"
            value={lessonData.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Subject *
          </label>
          <input
            type="text"
            value={lessonData.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            placeholder="e.g., Mathematics, ELA, Science..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Grade Level *
          </label>
          <input
            type="text"
            value={lessonData.gradeLevel || ''}
            onChange={(e) => onChange('gradeLevel', e.target.value)}
            placeholder="e.g., 9th Grade, Algebra II..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Standards Component ───────────────────────────────────────────────────────
function StandardsSection({ standards, onStandardsChange, lessonData }) {
  const [showStandards, setShowStandards] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Standards
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Search TEKS / Common Core / State Standards
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by: textbook, curriculum, pacing guide, unit, keyword, or standard code..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
              paddingRight: 120
            }}
          />
          <button
            onClick={() => setShowStandards(!showStandards)}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              background: C.blue,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showStandards ? 'Hide' : 'Search'}
          </button>
        </div>
      </div>
      
      {showStandards && lessonData.subject && (
        <div style={{ marginBottom: 16 }}>
          <StandardsSelector 
            topic={lessonData.title}
            maxSelections={5}
            showRecommendations={true}
            schoolName={currentUser?.schoolName}
            onStandardsChange={(standards) => {
              const standardsArray = Array.isArray(standards) ? standards : []
              onStandardsChange(standardsArray)
            }}
          />
        </div>
      )}
      
      {/* Selected Standards Tags */}
      {standards && standards.length > 0 && (
        <div>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 8 
          }}>
            Selected Standards ({standards.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {standards.map((standard, index) => (
              <span
                key={index}
                style={{
                  background: `${C.blue}15`,
                  color: C.blue,
                  border: `1px solid ${C.blue}30`,
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {standard.code ? `${standard.code}${standard.description ? ' - ' + standard.description : ''}` : standard}
                <button
                  onClick={() => {
                    const newStandards = standards.filter((_, i) => i !== index)
                    onStandardsChange(newStandards)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.blue,
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Objectives Component ───────────────────────────────────────────────────────
function ObjectivesSection({ objectives, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Objectives
      </div>
      
      <label style={{ 
        display: 'block', 
        fontSize: 12, 
        fontWeight: 600, 
        color: C.muted, 
        marginBottom: 8 
      }}>
        Learning Objectives
      </label>
      
      <textarea
        value={objectives || ''}
        onChange={(e) => onChange('objectives', e.target.value)}
        placeholder="What will students be able to do by the end of this lesson?"
        style={{
          width: '100%',
          padding: '12px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 14,
          minHeight: 120,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, Arial, sans-serif',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={() => console.log('Generate objectives with AI')}
        style={{
          marginTop: 12,
          background: C.blue,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        ✨ AI Generate
      </button>
    </div>
  )
}

// ─── Criteria for Success Component ─────────────────────────────────────────────
function SuccessCriteriaSection({ criteria, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Criteria for Success
      </div>
      
      <label style={{ 
        display: 'block', 
        fontSize: 12, 
        fontWeight: 600, 
        color: C.muted, 
        marginBottom: 8 
      }}>
        Success Criteria / Rubric
      </label>
      
      <textarea
        value={criteria || ''}
        onChange={(e) => onChange('successCriteria', e.target.value)}
        placeholder="How will you measure whether students have met the objectives?"
        style={{
          width: '100%',
          padding: '12px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 14,
          minHeight: 120,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, Arial, sans-serif',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={() => console.log('Generate criteria with AI')}
        style={{
          marginTop: 12,
          background: C.blue,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        ✨ AI Generate
      </button>
    </div>
  )
}

// ─── Lesson Steps Component ─────────────────────────────────────────────────────
function LessonStepsSection({ steps, onChange }) {
  const stepSections = [
    { key: 'warmUp', title: 'Warm-Up / Do Now', placeholder: 'Bell ringer activity, quick review, or engagement hook...' },
    { key: 'directInstruction', title: 'Direct Instruction', placeholder: 'Teacher-led instruction, modeling, explanations...' },
    { key: 'guidedPractice', title: 'Guided Practice', placeholder: 'Work through examples together, think-pair-share...' },
    { key: 'independentPractice', title: 'Independent Practice', placeholder: 'Individual work, worksheets, application tasks...' },
    { key: 'differentiation', title: 'Differentiation', placeholder: 'Support for struggling students, extensions for advanced learners...' },
    { key: 'checksForUnderstanding', title: 'Checks for Understanding', placeholder: 'Formative assessments, questioning strategies, thumbs up/down...' }
  ]

  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Lesson Steps
      </div>

      {stepSections.map((section, index) => (
        <div key={section.key} style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 700, 
            color: C.text, 
            marginBottom: 8 
          }}>
            {section.title}
          </label>

          <textarea
            value={steps?.[section.key] || ''}
            onChange={(e) => onChange(`steps.${section.key}`, e.target.value)}
            placeholder={section.placeholder}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              minHeight: 100,
              background: C.inner,
              color: C.text,
              outline: 'none',
              fontFamily: 'Inter, Arial, sans-serif',
              resize: 'vertical'
            }}
          />

          <button
            onClick={() => console.log(`Generate ${section.key} with AI`)}
            style={{
              marginTop: 8,
              background: C.blue,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✨ AI Assist
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Exit Ticket Component (NEW) ────────────────────────────────────────────────
function ExitTicketSection({ exitTicket, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Exit Ticket
      </div>
      
      <label style={{ 
        display: 'block', 
        fontSize: 12, 
        fontWeight: 600, 
        color: C.muted, 
        marginBottom: 8 
      }}>
        Student Exit Ticket / Check for Understanding
      </label>
      
      <textarea
        value={exitTicket || ''}
        onChange={(e) => onChange('exitTicket', e.target.value)}
        placeholder="What will students do to demonstrate understanding before leaving class?"
        style={{
          width: '100%',
          padding: '12px',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 14,
          minHeight: 100,
          background: C.inner,
          color: C.text,
          outline: 'none',
          fontFamily: 'Inter, Arial, sans-serif',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={() => console.log('Generate exit ticket with AI')}
        style={{
          marginTop: 12,
          background: C.blue,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        ✨ AI Generate
      </button>
    </div>
  )
}

// ─── Homework Component ─────────────────────────────────────────────────────────
function HomeworkSection({ homework, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Homework
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 8 
        }}>
          Homework Assignment
        </label>
        <textarea
          value={homework?.assignment || ''}
          onChange={(e) => onChange('homework.assignment', e.target.value)}
          placeholder="What homework will students complete?"
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            minHeight: 80,
            background: C.inner,
            color: C.text,
            outline: 'none',
            fontFamily: 'Inter, Arial, sans-serif',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Due Date
          </label>
          <input
            type="date"
            value={homework?.dueDate || ''}
            onChange={(e) => onChange('homework.dueDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 6 
          }}>
            Max Points
          </label>
          <input
            type="number"
            value={homework?.maxPoints || ''}
            onChange={(e) => onChange('homework.maxPoints', e.target.value)}
            placeholder="100"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Optional Add-Ons Component (NEW) ───────────────────────────────────────────
function OptionalAddOnsSection({ addOns, onChange }) {
  const addOnsConfig = [
    { key: 'materialsUsed', label: 'Materials Used', placeholder: 'List materials, resources, and equipment needed' },
    { key: 'vocabulary', label: 'Vocabulary', placeholder: 'Key terms and definitions students should know' },
    { key: 'elpsEllSupports', label: 'ELPS / ELL Supports', placeholder: 'Language strategies and supports for English language learners' },
    { key: 'technologyUsed', label: 'Technology Used', placeholder: 'Tech tools, apps, devices, and platforms' },
    { key: 'assessmentPlan', label: 'Assessment Plan', placeholder: 'Formative and summative assessment strategies' },
    { key: 'anticipatorySet', label: 'Anticipatory Set', placeholder: 'Hook or engagement strategy to start the lesson' },
    { key: 'reflection', label: 'Reflection', placeholder: 'Teacher reflection on lesson effectiveness and student learning' }
  ]

  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 8 
      }}>
        Optional Add-Ons
      </div>
      <p style={{ 
        fontSize: 12, 
        color: C.muted, 
        marginBottom: 20, 
        margin: '0 0 20px 0' 
      }}>
        Schools can customize which sections appear. Toggle sections on/off as needed.
      </p>

      {addOnsConfig.map((addon) => (
        <div key={addon.key} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={addOns?.[addon.key]?.enabled || false}
              onChange={(e) => onChange(`optionalAddOns.${addon.key}.enabled`, e.target.checked)}
              style={{
                width: 18,
                height: 18,
                cursor: 'pointer'
              }}
              id={`addon-${addon.key}`}
            />
            <label 
              htmlFor={`addon-${addon.key}`}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                cursor: 'pointer',
                margin: 0
              }}
            >
              {addon.label}
            </label>
          </div>

          {addOns?.[addon.key]?.enabled && (
            <>
              <textarea
                value={addOns[addon.key]?.content || ''}
                onChange={(e) => onChange(`optionalAddOns.${addon.key}.content`, e.target.value)}
                placeholder={addon.placeholder}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  minHeight: 80,
                  background: C.inner,
                  color: C.text,
                  outline: 'none',
                  fontFamily: 'Inter, Arial, sans-serif',
                  resize: 'vertical',
                  marginBottom: 8
                }}
              />
              <button
                onClick={() => console.log(`Generate ${addon.key} with AI`)}
                style={{
                  background: C.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✨ AI Assist
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Attachments Component ─────────────────────────────────────────────────────
function AttachmentsSection({ attachments, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        marginBottom: 20 
      }}>
        Attachments
      </div>

      <label style={{ 
        display: 'block', 
        fontSize: 12, 
        fontWeight: 600, 
        color: C.muted, 
        marginBottom: 12 
      }}>
        Upload supporting materials
      </label>

      <div style={{
        border: `2px dashed ${C.border}`,
        borderRadius: 8,
        padding: 20,
        textAlign: 'center',
        background: C.inner,
        cursor: 'pointer'
      }}>
        <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
          📎 Drop files here or click to upload
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          Worksheets, answer keys, rubrics, images, PDFs
        </div>
      </div>

      {attachments && attachments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
            Attached Files ({attachments.length})
          </div>
          {attachments.map((file, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: C.inner,
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 14
            }}>
              <span>📄 {file.name || `File ${index + 1}`}</span>
              <button
                onClick={() => {
                  const newAttachments = attachments.filter((_, i) => i !== index)
                  onChange('attachments', newAttachments)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.red,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Lesson Plan Template Component ───────────────────────────────────────────
export default function LessonPlanTemplate({ currentUser }) {
  const [lessonData, setLessonData] = useState({
    title: '',
    date: '',
    subject: '',
    gradeLevel: '',
    standards: [],
    objectives: '',
    successCriteria: '',
    steps: {
      warmUp: '',
      directInstruction: '',
      guidedPractice: '',
      independentPractice: '',
      differentiation: '',
      checksForUnderstanding: '',
      extensions: ''
    },
    exitTicket: '',
    homework: {
      assignment: '',
      dueDate: '',
      maxPoints: ''
    },
    accommodations: {
      isOpen: false,
      students: []
    },
    attachments: [],
    optionalAddOns: {
      materialsUsed: { enabled: true, content: '' },
      vocabulary: { enabled: true, content: '' },
      elpsEllSupports: { enabled: true, content: '' },
      technologyUsed: { enabled: true, content: '' },
      assessmentPlan: { enabled: true, content: '' },
      anticipatorySet: { enabled: true, content: '' },
      reflection: { enabled: true, content: '' }
    }
  })

  useEffect(() => {
    if (currentUser?.gradeLevel && !lessonData.gradeLevel) {
      setLessonData(prev => ({ ...prev, gradeLevel: currentUser.gradeLevel }))
    }
  }, [currentUser])

  function handleChange(field, value) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setLessonData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setLessonData(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSave() {
    console.log('Saving lesson plan:', lessonData)
    
    try {
      const response = await fetch('/api/lesson-plan?action=lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.id || 'demo'}`
        },
        body: JSON.stringify(lessonData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Save failed:', error)
        alert(`Failed to save: ${error.error || 'Unknown error'}`)
        return
      }
      
      const result = await response.json()
      console.log('Lesson saved successfully:', result)
      alert('Lesson plan saved successfully!')
      
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save lesson plan')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f7fa',
      fontFamily: 'Inter, Arial, sans-serif',
      paddingBottom: 80
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: `1px solid ${C.border}`, 
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: 20, 
              fontWeight: 700, 
              color: C.text, 
              margin: 0 
            }}>
              Lesson Plan Template
            </h1>
            <p style={{ 
              fontSize: 13, 
              color: C.muted, 
              margin: '4px 0 0 0' 
            }}>
              Create a comprehensive lesson plan
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => console.log('Save draft')}
              style={{
                background: C.inner,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save Draft
            </button>
            <button
              onClick={handleSave}
              style={{
                background: C.blue,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save Lesson Plan
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <LessonHeader 
          lessonData={lessonData} 
          onChange={handleChange} 
          currentUser={currentUser} 
        />
        
        <StandardsSection 
          standards={lessonData.standards}
          onStandardsChange={(standards) => handleChange('standards', standards)}
          lessonData={lessonData}
        />
        
        <ObjectivesSection 
          objectives={lessonData.objectives}
          onChange={handleChange}
        />
        
        <SuccessCriteriaSection 
          criteria={lessonData.successCriteria}
          onChange={handleChange}
        />
        
        <LessonStepsSection 
          steps={lessonData.steps}
          onChange={handleChange}
        />
        
        <ExitTicketSection 
          exitTicket={lessonData.exitTicket}
          onChange={handleChange}
        />
        
        <HomeworkSection 
          homework={lessonData.homework}
          onChange={handleChange}
        />
        
        <AccommodationsSection 
          lessonTopic={lessonData.title}
          lessonSubject={lessonData.subject}
          lessonGrade={lessonData.gradeLevel}
          accommodations={lessonData.accommodations?.students || []}
          onAccommodationsChange={(students) => handleChange('accommodations.students', students)}
        />
        
        <AttachmentsSection 
          attachments={lessonData.attachments}
          onChange={handleChange}
        />
        
        <OptionalAddOnsSection 
          addOns={lessonData.optionalAddOns}
          onChange={handleChange}
        />
      </div>

      <BottomNav active="lessonPlan" onSelect={() => {}} isSubPage={false} role="teacher" />
    </div>
  )
}
