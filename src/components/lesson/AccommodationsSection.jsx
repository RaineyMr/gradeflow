import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'

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

const ACCOMMODATION_TYPES = ['IEP', '504', 'ELL', 'Gifted', 'Other']

const ACCOMMODATION_COLORS = {
  IEP: C.purple,
  '504': C.blue,
  ELL: C.teal,
  Gifted: C.green,
  Other: C.amber,
}

// ─── Accommodations Section Component ─────────────────────────────────────────────
export default function AccommodationsSection({ 
  lessonTopic = '', 
  lessonSubject = '', 
  lessonGrade = '', 
  accommodations,
  onAccommodationsChange 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { students } = useStore()
  
  // Auto-populate from student roster accommodations
  useEffect(() => {
    if (students && students.length > 0) {
      const studentsWithAccommodations = students
        .filter(student => student.accommodations && student.accommodations.length > 0)
        .map(student => ({
          id: student.id,
          name: student.name,
          accommodationType: student.accommodations[0]?.type || 'Other',
          specificNeeds: student.accommodations[0]?.needs || [],
          suggestedAdjustments: '',
          notes: student.accommodations[0]?.notes || ''
        }))
      
      if (studentsWithAccommodations.length > 0 && (!accommodations || accommodations.length === 0)) {
        onAccommodationsChange(studentsWithAccommodations)
      }
    }
  }, [students])

  function handleAddStudent() {
    const newStudent = {
      id: Date.now().toString(),
      name: '',
      accommodationType: 'Other',
      specificNeeds: [],
      suggestedAdjustments: '',
      notes: ''
    }
    onAccommodationsChange([...(accommodations || []), newStudent])
    setIsOpen(true)
  }

  function handleUpdateStudent(studentId, field, value) {
    const updatedAccommodations = accommodations.map(student => {
      if (student.id === studentId) {
        if (field === 'specificNeeds') {
          // Handle comma-separated input for specific needs
          const needs = value.split(',').map(need => need.trim()).filter(Boolean)
          return { ...student, [field]: needs }
        }
        return { ...student, [field]: value }
      }
      return student
    })
    onAccommodationsChange(updatedAccommodations)
  }

  function handleRemoveStudent(studentId) {
    const updatedAccommodations = accommodations.filter(student => student.id !== studentId)
    onAccommodationsChange(updatedAccommodations)
  }

  async function handleGenerateAdjustments() {
    if (!lessonTopic || !accommodations || accommodations.length === 0) return
    
    // Generate AI adjustments for each student
    const updatedAccommodations = await Promise.all(
      accommodations.map(async (student) => {
        try {
          // Simulate AI call for lesson-specific adjustments
          const adjustments = await generateLessonAdjustments({
            studentName: student.name,
            accommodationType: student.accommodationType,
            specificNeeds: student.specificNeeds,
            lessonTopic,
            lessonSubject,
            lessonGrade
          })
          
          return {
            ...student,
            suggestedAdjustments: adjustments
          }
        } catch (error) {
          console.error('Failed to generate adjustments for', student.name, error)
          return student
        }
      })
    )
    
    onAccommodationsChange(updatedAccommodations)
  }

  // Mock AI function - replace with actual AI call
  async function generateLessonAdjustments({ studentName, accommodationType, specificNeeds, lessonTopic }) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const adjustments = {
      IEP: [
        `Provide extended time (1.5x) for ${lessonTopic} assignments`,
        `Break down complex ${lessonTopic} problems into smaller steps`,
        `Offer preferential seating near instruction area`,
        `Provide graphic organizers for ${lessonTopic} concepts`
      ],
      '504': [
        `Allow extended time on assessments related to ${lessonTopic}`,
        `Provide copies of notes for ${lessonTopic} lessons`,
        `Allow use of assistive technology during ${lessonTopic} activities`
      ],
      ELL: [
        `Provide vocabulary list with visuals for ${lessonTopic} terms`,
        `Use sentence frames for ${lessonTopic} discussions`,
        `Allow native language support for complex ${lessonTopic} concepts`,
        `Provide visual aids and gestures during ${lessonTopic} instruction`
      ],
      Gifted: [
        `Offer extension activities for advanced ${lessonTopic} exploration`,
        `Provide opportunities for peer teaching of ${lessonTopic} concepts`,
        `Include higher-order thinking questions about ${lessonTopic}`,
        `Allow independent research on advanced ${lessonTopic} topics`
      ],
      Other: [
        `Provide additional support as needed for ${lessonTopic}`,
        `Check in frequently during ${lessonTopic} activities`,
        `Offer alternative ways to demonstrate understanding of ${lessonTopic}`
      ]
    }
    
    return adjustments[accommodationType] || adjustments.Other
  }

  const studentCount = accommodations?.length || 0

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>♿</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
            Accommodations
          </span>
          {studentCount > 0 && (
            <span style={{
              background: `${C.purple}15`,
              color: C.purple,
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600
            }}>
              {studentCount} student{studentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span style={{ 
          color: C.muted, 
          fontSize: 14, 
          fontWeight: 600 
        }}>
          {isOpen ? '▲ Hide' : '▼ Show'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
          marginTop: 8
        }}>
          {studentCount === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              color: C.muted,
              fontSize: 14
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <div style={{ marginBottom: 16 }}>
                No accommodations recorded yet. Add students below or upload a roster to auto-extract.
              </div>
              <button
                onClick={handleAddStudent}
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
                + Add Student Manually
              </button>
            </div>
          ) : (
            <>
              {/* Student Accommodation Cards */}
              {accommodations.map((student) => {
                const typeColor = ACCOMMODATION_COLORS[student.accommodationType] || C.amber
                
                return (
                  <div
                    key={student.id}
                    style={{
                      background: C.inner,
                      border: `1px solid ${typeColor}25`,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12
                    }}
                  >
                    {/* Student Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.text,
                        flex: 1
                      }}>
                        {student.name || 'New Student'}
                      </div>
                      
                      {/* Accommodation Type Selector */}
                      <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
                        {ACCOMMODATION_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => handleUpdateStudent(student.id, 'accommodationType', type)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                              background: student.accommodationType === type 
                                ? `${ACCOMMODATION_COLORS[type]}20` 
                                : C.bg,
                              color: student.accommodationType === type 
                                ? ACCOMMODATION_COLORS[type] 
                                : C.muted,
                              outline: student.accommodationType === type 
                                ? `1px solid ${ACCOMMODATION_COLORS[type]}` 
                                : 'none'
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: C.red,
                          cursor: 'pointer',
                          fontSize: 18,
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </div>

                    {/* Student Name Input (if not set) */}
                    {!student.name && (
                      <div style={{ marginBottom: 12 }}>
                        <input
                          type="text"
                          value={student.name || ''}
                          onChange={(e) => handleUpdateStudent(student.id, 'name', e.target.value)}
                          placeholder="Student name..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontSize: 13,
                            background: C.bg,
                            color: C.text,
                            outline: 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Specific Needs */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 6
                      }}>
                        Specific Needs
                      </div>
                      <input
                        type="text"
                        value={Array.isArray(student.specificNeeds) 
                          ? student.specificNeeds.join(', ') 
                          : student.specificNeeds || ''}
                        onChange={(e) => handleUpdateStudent(student.id, 'specificNeeds', e.target.value)}
                        placeholder="Extended time, Preferential seating, Small group..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${C.border}`,
                          borderRadius: 6,
                          fontSize: 12,
                          background: C.bg,
                          color: C.text,
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Lesson-Specific Adjustments */}
                    {student.suggestedAdjustments && (
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.teal,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 6
                        }}>
                          ✨ Suggested Adjustments for This Lesson
                        </div>
                        {Array.isArray(student.suggestedAdjustments) ? (
                          student.suggestedAdjustments.map((adjustment, index) => (
                            <div
                              key={index}
                              style={{
                                background: `${C.teal}10`,
                                border: `1px solid ${C.teal}20`,
                                borderRadius: 6,
                                padding: '8px 12px',
                                marginBottom: 6,
                                fontSize: 12,
                                color: C.text,
                                lineHeight: 1.4
                              }}
                            >
                              {adjustment}
                            </div>
                          ))
                        ) : (
                          <div style={{
                            background: `${C.teal}10`,
                            border: `1px solid ${C.teal}20`,
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontSize: 12,
                            color: C.text,
                            lineHeight: 1.4
                          }}>
                            {student.suggestedAdjustments}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {student.notes && (
                      <div style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: C.muted,
                        fontStyle: 'italic'
                      }}>
                        {student.notes}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={handleAddStudent}
                  style={{
                    background: C.inner,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Add Another Student
                </button>
                
                {lessonTopic && studentCount > 0 && (
                  <button
                    onClick={handleGenerateAdjustments}
                    style={{
                      background: `${C.purple}15`,
                      color: C.purple,
                      border: `1px solid ${C.purple}30`,
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Generate Lesson Adjustments
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
