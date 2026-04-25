import React, { useState, useEffect } from 'react'
import { X, BookOpen, Target, Users, Clock, FileText, Award, Home, PlusCircle, Brain, Edit, Save, XCircle } from 'lucide-react'

const C = {
  bg: '#060810',
  card: '#161923',
  inner: '#1e2231',
  text: '#eef0f8',
  muted: '#6b7494',
  border: '#2a2f42',
  green: '#22c97a',
  blue: '#3b7ef4',
  amber: '#f5a623',
  purple: '#9b6ef5',
  teal: '#0fb8a0',
  red: '#f04a4a',
}

const SECTION_ICONS = {
  header: BookOpen,
  standards: Target,
  objectives: BookOpen,
  cfs: Users,
  lessonSteps: Clock,
  exitTicket: FileText,
  homework: Home,
  accommodations: Award,
  attachments: PlusCircle,
  optionalAddOns: Brain,
}

export default function LessonViewModal({ lesson, isOpen, onClose }) {
  const [loading, setLoading] = useState(true)
  const [lessonData, setLessonData] = useState(null)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableLessonData, setEditableLessonData] = useState(null)

  useEffect(() => {
    if (!isOpen || !lesson) return

    // Use lesson data directly from calendar
    setLessonData(lesson)
    setEditableLessonData(lesson)
    setLoading(false)
    setError(null)
  }, [isOpen, lesson])

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the lesson data
      // For now, we'll just update the local state
      setLessonData(editableLessonData)
      setIsEditing(false)
      // TODO: Add actual API call to save lesson data
      console.log('Lesson saved:', editableLessonData)
    } catch (error) {
      console.error('Error saving lesson:', error)
      setError('Failed to save lesson')
    }
  }

  const handleCancel = () => {
    setEditableLessonData(lessonData)
    setIsEditing(false)
  }

  const handleFieldChange = (field, value) => {
    setEditableLessonData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderSection = (title, content, icon, color = C.blue, field = null) => {
    const Icon = icon || BookOpen
    return (
      <div style={{ 
        background: C.inner, 
        border: `1px solid ${C.border}`, 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 12 
        }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            background: `${color}22`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: color 
          }}>
            <Icon size={16} />
          </div>
          <h3 style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: C.text, 
            margin: 0 
          }}>
            {title}
          </h3>
        </div>
        <div style={{ 
          color: C.text, 
          fontSize: 13, 
          lineHeight: 1.5 
        }}>
          {isEditing && field ? (
            <textarea
              value={editableLessonData?.[field] || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{
                width: '100%',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: 8,
                color: C.text,
                fontSize: 13,
                lineHeight: 1.5,
                minHeight: '60px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder={`Enter ${title.toLowerCase()}...`}
            />
          ) : (
            content || <span style={{ color: C.muted, fontStyle: 'italic' }}>Not specified</span>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: `3px solid ${C.blue}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: C.muted, fontSize: 14 }}>Loading lesson...</p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          maxWidth: 400
        }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>Error</div>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              background: C.blue,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        maxWidth: 800,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 800, 
              color: C.text, 
              margin: '0 0 4px' 
            }}>
              {lessonData?.title || 'Untitled Lesson'}
            </h2>
            <p style={{ 
              color: C.muted, 
              fontSize: 13, 
              margin: 0 
            }}>
              {lessonData?.subject} {lessonData?.grade_level && `· Grade ${lessonData.grade_level}`}
              {lessonData?.lesson_date && ` · ${new Date(lessonData.lesson_date).toLocaleDateString()}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    background: C.green,
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '6px 12px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1ea867'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.green
                  }}
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: C.red,
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '6px 12px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d63939'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.red
                  }}
                >
                  <XCircle size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: C.blue,
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '6px 12px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3366cc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.blue
                }}
              >
                <Edit size={14} />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                cursor: 'pointer',
                fontSize: 20,
                padding: 4,
                borderRadius: 4,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.inner
                e.currentTarget.style.color = C.text
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = C.muted
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {/* Section 1: Header */}
          {renderSection(
            'Lesson Overview',
            lessonData?.title || 'Untitled Lesson',
            SECTION_ICONS.header,
            C.blue,
            'title'
          )}

          {/* Section 2: Standards */}
          {renderSection(
            'Learning Standards',
            lessonData?.standards?.length > 0 
              ? lessonData.standards.map(s => typeof s === 'string' ? s : s.standard_label || s).join(', ')
              : 'No standards specified',
            SECTION_ICONS.standards,
            C.purple,
            'standards'
          )}

          {/* Section 3: Objectives */}
          {renderSection(
            'Learning Objectives',
            lessonData?.objectives || 'No objectives specified',
            SECTION_ICONS.objectives,
            C.green,
            'objectives'
          )}

          {/* Section 4: Criteria for Success */}
          {renderSection(
            'Success Criteria',
            lessonData?.criteria_for_success || 'No success criteria specified',
            SECTION_ICONS.cfs,
            C.teal,
            'criteria_for_success'
          )}

          {/* Section 5: Cultural Notes */}
          {renderSection(
            'Cultural Notes',
            lessonData?.cultural_notes || 'No cultural notes specified',
            SECTION_ICONS.cfs,
            C.amber,
            'cultural_notes'
          )}

          {/* Section 6: Lesson Steps */}
          <div style={{ 
            background: C.inner, 
            border: `1px solid ${C.border}`, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: 12 
            }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                background: `${C.blue}22`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: C.blue 
              }}>
                <Clock size={16} />
              </div>
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: C.text, 
                margin: 0 
              }}>
                Lesson Steps
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'Warm Up', content: lessonData?.warm_up, field: 'warm_up' },
                { title: 'Direct Instruction', content: lessonData?.direct_instruction, field: 'direct_instruction' },
                { title: 'Guided Practice', content: lessonData?.guided_practice, field: 'guided_practice' },
                { title: 'Independent Practice', content: lessonData?.independent_practice, field: 'independent_practice' },
                { title: 'Closure', content: lessonData?.closure, field: 'closure' }
              ].map((step, index) => (
                <div key={index} style={{ 
                  background: C.card, 
                  borderRadius: 8, 
                  padding: 12 
                }}>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: C.blue, 
                    marginBottom: 4 
                  }}>
                    {step.title}
                  </div>
                  <div style={{ 
                    color: C.text, 
                    fontSize: 13, 
                    lineHeight: 1.4 
                  }}>
                    {isEditing ? (
                      <textarea
                        value={editableLessonData?.[step.field] || ''}
                        onChange={(e) => handleFieldChange(step.field, e.target.value)}
                        style={{
                          width: '100%',
                          background: C.inner,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          padding: 6,
                          color: C.text,
                          fontSize: 13,
                          lineHeight: 1.4,
                          minHeight: '50px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder={`Enter ${step.title.toLowerCase()} content...`}
                      />
                    ) : (
                      step.content || <span style={{ color: C.muted, fontStyle: 'italic' }}>Not specified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Exit Ticket */}
          {renderSection(
            'Exit Ticket',
            lessonData?.exit_ticket || 'No exit ticket specified',
            SECTION_ICONS.exitTicket,
            C.purple,
            'exit_ticket'
          )}

          {/* Section 8: Homework */}
          {renderSection(
            'Homework Assignment',
            lessonData?.homework_assignment || 'No homework assigned',
            SECTION_ICONS.homework,
            C.amber,
            'homework_assignment'
          )}

          {/* Section 9: Accommodations */}
          {renderSection(
            'Accommodations',
            lessonData?.accommodations_notes || 'No accommodations specified',
            SECTION_ICONS.accommodations,
            C.teal,
            'accommodations_notes'
          )}

          {/* Section 10: Enrichment */}
          {renderSection(
            'Enrichment Activities',
            lessonData?.enrichment_activities || 'No enrichment activities specified',
            SECTION_ICONS.optionalAddOns,
            C.purple,
            'enrichment_activities'
          )}

          {/* Section 11: Supplemental Links */}
          {renderSection(
            'Supplemental Resources',
            lessonData?.supplemental_links || 'No supplemental resources specified',
            SECTION_ICONS.optionalAddOns,
            C.blue,
            'supplemental_links'
          )}

          {/* Section 12: Teacher Reflections */}
          {renderSection(
            'Teacher Reflections',
            lessonData?.teacher_reflections || 'No teacher reflections specified',
            SECTION_ICONS.optionalAddOns,
            C.green,
            'teacher_reflections'
          )}
        </div>
      </div>
    </div>
  )
}
