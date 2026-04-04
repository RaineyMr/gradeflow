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
            placeholder="e.g., Mathematics, Science, English..."
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
          <select
            value={lessonData.gradeLevel || ''}
            onChange={(e) => onChange('gradeLevel', e.target.value)}
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
          >
            <option value="">Select Grade Level</option>
            <option value="Kindergarten">Kindergarten</option>
            <option value="1st Grade">1st Grade</option>
            <option value="2nd Grade">2nd Grade</option>
            <option value="3rd Grade">3rd Grade</option>
            <option value="4th Grade">4th Grade</option>
            <option value="5th Grade">5th Grade</option>
            <option value="6th Grade">6th Grade</option>
            <option value="7th Grade">7th Grade</option>
            <option value="8th Grade">8th Grade</option>
            <option value="9th Grade">9th Grade</option>
            <option value="10th Grade">10th Grade</option>
            <option value="11th Grade">11th Grade</option>
            <option value="12th Grade">12th Grade</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ─── Standards Component ───────────────────────────────────────────────────────
function StandardsSection({ standards, onStandardsChange, lessonData, currentUser }) {
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
              // Convert to array format expected by API
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

// ─── Objectives Section ─────────────────────────────────────────────────────
function ObjectivesSection({ objectives, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Objectives
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Learning Objectives *
        </label>
        <textarea
          value={objectives || ''}
          onChange={(e) => onChange('objectives', e.target.value)}
          placeholder="What will students be able to do by the end of this lesson?"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            background: C.inner,
            color: C.text,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />
      </div>
    </div>
  )
}

// ─── Success Criteria Section ────────────────────────────────────────────
function SuccessCriteriaSection({ successCriteria, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Criteria for Success
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Success Criteria *
        </label>
        <textarea
          value={successCriteria || ''}
          onChange={(e) => onChange('successCriteria', e.target.value)}
          placeholder="How will you and students know they've met the objectives?"
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            background: C.inner,
            color: C.text,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />
      </div>
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
    { key: 'closure', title: 'Closure', placeholder: 'Wrap-up activity, review, or assessment...' },
    { key: 'extension', title: 'Extension', placeholder: 'Additional challenges or enrichment activities...' }
  ]

  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Lesson Steps
      </div>
      
      {stepSections.map((section, index) => (
        <div key={section.key} style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 12 
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
              {index + 1}. {section.title}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  // AI Fill Section functionality
                  console.log(`AI fill ${section.key}`)
                }}
                style={{
                  background: `${C.teal}15`,
                  color: C.teal,
                  border: `1px solid ${C.teal}30`,
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🤖 AI Fill Section
              </button>
              <button
                style={{
                  background: `${C.blue}15`,
                  color: C.blue,
                  border: `1px solid ${C.blue}30`,
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📎 Attach
              </button>
            </div>
          </div>
          
          <textarea
            value={steps?.[section.key] || ''}
            onChange={(e) => onChange(`steps.${section.key}`, e.target.value)}
            placeholder={section.placeholder}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: C.inner,
              color: C.text,
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Exit Ticket Section ───────────────────────────────────────────────────
function ExitTicketSection({ exitTicket, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Exit Ticket
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Exit Ticket Questions
        </label>
        <textarea
          value={exitTicket || ''}
          onChange={(e) => onChange('exitTicket', e.target.value)}
          placeholder="Quick assessment questions to check understanding (3-5 questions)..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            background: C.inner,
            color: C.text,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />
      </div>
    </div>
  )
}

// ─── Homework Section ───────────────────────────────────────────────────────
function HomeworkSection({ homework, onChange }) {
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Homework
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
            Assignment
          </label>
          <input
            type="text"
            value={homework?.assignment || ''}
            onChange={(e) => onChange('homework.assignment', e.target.value)}
            placeholder="Homework assignment details..."
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
      </div>
      
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Maximum Points
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
  )
}

// ─── Attachments Section ───────────────────────────────────────────────────
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
    header: {
      title: '',
      date: '',
      subject: '',
      gradeLevel: ''
    },
    standards: [],
    objectives: '',
    cfs: {
      successCriteria: '',
      culturalNotes: ''
    },
    lessonSteps: {
      warmUp: '',
      directInstruction: '',
      guidedPractice: '',
      independentPractice: '',
      closure: '',
      extension: ''
    },
    exitTicket: '',
    homework: {
      assignment: '',
      dueDate: '',
      maxPoints: ''
    },
    accommodations: '',
    attachments: [],
    optionalAddOns: {
      enrichment: '',
      supplementalLinks: '',
      reflections: ''
    }
  })

  // Auto-populate grade level from user profile
  useEffect(() => {
    if (currentUser?.gradeLevel && !lessonData.header.gradeLevel) {
      setLessonData(prev => ({ ...prev, header: { ...prev.header, gradeLevel: currentUser.gradeLevel } }))
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
          'Authorization': `Bearer ${await currentUser.session.access_token}`
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
          lessonData={lessonData.header} 
          onChange={(field, value) => handleChange(`header.${field}`, value)} 
          currentUser={currentUser} 
        />
        
        <StandardsSection 
          standards={lessonData.standards}
          onStandardsChange={(standards) => handleChange('standards', standards)}
          lessonData={lessonData}
          currentUser={currentUser}
        />
        
        <ObjectivesSection 
          objectives={lessonData.objectives}
          onChange={handleChange}
        />
        
        <SuccessCriteriaSection 
          successCriteria={lessonData.cfs.successCriteria}
          onChange={(value) => handleChange('cfs.successCriteria', value)}
        />
        
        <LessonStepsSection 
          steps={lessonData.lessonSteps}
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
          accommodations={lessonData.accommodations}
          onChange={handleChange}
        />
        
        <AttachmentsSection 
          attachments={lessonData.attachments}
          onChange={handleChange}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
