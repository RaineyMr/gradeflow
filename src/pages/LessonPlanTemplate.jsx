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
          <select
            value={lessonData.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
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
            <option value="">Select Subject</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="Physical Education">Physical Education</option>
          </select>
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
            value={lessonData.gradeLevel || currentUser?.gradeLevel || ''}
            onChange={(e) => onChange('gradeLevel', e.target.value)}
            placeholder="e.g., 3rd Grade, 10th Grade"
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

// ─── Objectives Component ─────────────────────────────────────────────────────
function ObjectivesSection({ objectives, onChange }) {
  const [showAIAssist, setShowAIAssist] = useState(false)
  
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
          Objectives
        </div>
        <button
          onClick={() => setShowAIAssist(!showAIAssist)}
          style={{
            background: `${C.purple}15`,
            color: C.purple,
            border: `1px solid ${C.purple}30`,
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🤖 AI Assist
        </button>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Clear, measurable learning objectives
        </label>
        <textarea
          value={objectives || ''}
          onChange={(e) => onChange('objectives', e.target.value)}
          placeholder="Students will be able to:&#10;• Identify...&#10;• Explain...&#10;• Apply..."
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
      
      {showAIAssist && (
        <div style={{
          background: `${C.purple}10`,
          border: `1px solid ${C.purple}20`,
          borderRadius: 8,
          padding: 16,
          fontSize: 13,
          color: C.text
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>AI Assistant</div>
          <div style={{ color: C.muted, marginBottom: 12 }}>
            I can help you write clear, measurable objectives. Click below to generate suggestions based on your lesson topic.
          </div>
          <button
            style={{
              background: C.purple,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Generate Objectives
          </button>
        </div>
      )}
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
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Criteria for Success
      </div>
      
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          What students must demonstrate to show mastery
        </label>
        <textarea
          value={criteria || ''}
          onChange={(e) => onChange('successCriteria', e.target.value)}
          placeholder="Students will demonstrate mastery by:&#10;• Completing the exit ticket with 80% accuracy&#10;• Explaining the concept in their own words&#10;• Applying the skill to a new problem..."
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
    { key: 'differentiation', title: 'Differentiation', placeholder: 'Support for struggling students, extensions for advanced learners...' },
    { key: 'checksForUnderstanding', title: 'Checks for Understanding', placeholder: 'Formative assessments, questioning strategies, thumbs up/down...' },
    { key: 'exitTicket', title: 'Exit Ticket', placeholder: 'Quick check for understanding, 3-5 questions...' }
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
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Homework
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 600, 
          color: C.muted, 
          marginBottom: 6 
        }}>
          Assignment Details
        </label>
        <textarea
          value={homework?.text || ''}
          onChange={(e) => onChange('homework.text', e.target.value)}
          placeholder="Describe the homework assignment, due date, and any special instructions..."
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
      
      <div>
        <button
          onClick={() => {
            // Attachment functionality
            console.log('Attach homework file')
          }}
          style={{
            background: `${C.blue}15`,
            color: C.blue,
            border: `1px solid ${C.blue}30`,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📎 Attach Worksheet or Document
        </button>
      </div>
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
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Attachments
      </div>
      
      <div style={{ 
        border: `2px dashed ${C.border}`, 
        borderRadius: 8, 
        padding: 32, 
        textAlign: 'center',
        background: C.inner
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
        <div style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>
          Upload PDFs, screenshots, images, or documents
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
          Imported curriculum lesson plans appear here as-is (no parsing)
        </div>
        <button
          onClick={() => {
            // File upload functionality
            console.log('Upload attachment')
          }}
          style={{
            background: C.blue,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Choose Files
        </button>
      </div>
      
      {attachments && attachments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 600, 
            color: C.muted, 
            marginBottom: 8 
          }}>
            Attached Files ({attachments.length})
          </div>
          {attachments.map((file, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                marginBottom: 6
              }}
            >
              <span style={{ fontSize: 13, color: C.text }}>
                📄 {file.name}
              </span>
              <button
                onClick={() => {
                  // Remove file functionality
                  console.log('Remove file', index)
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
      differentiation: '',        // ← NEW: Added missing section
      checksForUnderstanding: ''  // ← NEW: Added missing section
    },
    homework: {},
    accommodations: {
      isOpen: false,
      students: []
    },
    attachments: []
  })

  // Auto-populate grade level from user profile
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
      // Call the combined API endpoint
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
      </div>

      <BottomNav active="lessonPlan" onSelect={() => {}} isSubPage={false} role="teacher" />
    </div>
  )
}
