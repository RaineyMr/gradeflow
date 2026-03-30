// src/components/support/SharedNoteEditor.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg: '#060810',
  card: '#111520',
  inner: '#1a1f2e',
  raised: '#1e2436',
  text: '#eef0f8',
  soft: '#c8cce0',
  muted: '#6b7494',
  border: '#252b3d',
  green: '#22c97a',
  blue: '#3b7ef4',
  red: '#f04a4a',
  amber: '#f5a623',
  teal: '#0fb8a0',
  purple: '#9b6ef5',
}

const VISIBILITY_OPTIONS = [
  { id: 'team', label: 'Team Only', description: 'Visible to all support staff' },
  { id: 'specific', label: 'Specific Staff', description: 'Visible to selected team members' },
  { id: 'admin', label: 'Admin Only', description: 'Visible to administrators only' },
  { id: 'public', label: 'Public', description: 'Visible to all staff members' }
]

const NOTE_TEMPLATES = [
  {
    id: 'progress',
    title: 'Student Progress Note',
    content: 'Student is showing progress in the following areas:\n\n• Strengths observed:\n• Areas for improvement:\n• Next steps:\n• Follow-up needed:'
  },
  {
    id: 'concern',
    title: 'Concern Note',
    content: 'Areas of concern identified:\n\n• Specific concerns:\n• Impact on learning:\n• Recommended actions:\n• Urgency level:'
  },
  {
    id: 'meeting',
    title: 'Meeting Summary',
    content: 'Meeting Summary:\n\n• Attendees:\n• Key discussion points:\n• Decisions made:\n• Action items:\n• Follow-up date:'
  },
  {
    id: 'observation',
    title: 'Classroom Observation',
    content: 'Observation Notes:\n\n• Date/Time:\n• Setting:\n• Behaviors observed:\n• Academic performance:\n• Social interactions:\n• Recommendations:'
  }
]

export default function SharedNoteEditor({ onClose, onSave, initialNote = null }) {
  const {
    createSharedNote,
    getStudentsForSupportStaff,
    getSupportStaffGroups,
    getTeachersForSupportStaff,
    getAdminForSupportStaff,
    currentUser
  } = useStore()

  const [note, setNote] = useState({
    title: initialNote?.title || '',
    content: initialNote?.content || '',
    visibility: initialNote?.visibility || 'team',
    studentId: initialNote?.studentId || null,
    groupId: initialNote?.groupId || null,
    specificStaff: initialNote?.specificStaff || [],
    attachments: [],
    priority: initialNote?.priority || 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const students = getStudentsForSupportStaff()
  const groups = getSupportStaffGroups()
  const teachers = getTeachersForSupportStaff()
  const admins = getAdminForSupportStaff()

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote)
    }
  }, [initialNote])

  function handleSave() {
    if (!note.title.trim() || !note.content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setLoading(true)
    
    const noteData = {
      ...note,
      author: currentUser.name,
      authorRole: currentUser.role,
      timestamp: new Date().toISOString(),
      id: initialNote?.id || Date.now()
    }

    if (createSharedNote) {
      createSharedNote(noteData)
        .then(() => {
          onSave?.(noteData)
        })
        .catch(error => {
          console.error('Failed to save note:', error)
          alert('Failed to save note. Please try again.')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // Fallback for demo
      setTimeout(() => {
        onSave?.(noteData)
        setLoading(false)
      }, 1000)
    }
  }

  function applyTemplate(template) {
    setNote(prev => ({
      ...prev,
      title: template.title,
      content: template.content
    }))
    setShowTemplateSelector(false)
  }

  function addAttachment() {
    // In a real implementation, this would open a file picker
    const attachment = {
      id: Date.now(),
      name: `Document_${note.attachments.length + 1}.pdf`,
      type: 'pdf',
      size: '2.3 MB'
    }
    setNote(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }))
  }

  function removeAttachment(attachmentId) {
    setNote(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }))
  }

  function toggleStaffSelection(staffId) {
    setNote(prev => ({
      ...prev,
      specificStaff: prev.specificStaff.includes(staffId)
        ? prev.specificStaff.filter(id => id !== staffId)
        : [...prev.specificStaff, staffId]
    }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        width: '100%',
        maxWidth: 700,
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: 18,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              marginBottom: 4
            }}>
              {initialNote ? 'Edit Shared Note' : 'Create Shared Note'}
            </h2>
            <p style={{
              fontSize: 12,
              color: C.muted,
              margin: 0
            }}>
              Share information with your support team
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.soft,
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 8,
              display: 'block'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={note.title}
              onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text
              }}>
                Content *
              </label>
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                style={{
                  padding: '4px 8px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  fontSize: 10,
                  color: C.soft,
                  cursor: 'pointer'
                }}
              >
                📋 Use Template
              </button>
            </div>
            <textarea
              value={note.content}
              onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter note content..."
              rows={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div style={{
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8
              }}>
                Note Templates:
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {NOTE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    style={{
                      padding: '8px 12px',
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      color: C.soft,
                      fontSize: 11,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = C.raised
                      e.target.style.color = C.text
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = C.card
                      e.target.style.color = C.soft
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{template.title}</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>
                      {template.content.substring(0, 60)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 8,
              display: 'block'
            }}>
              Priority
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['low', 'medium', 'high'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setNote(prev => ({ ...prev, priority }))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: note.priority === priority ? C.blue : C.inner,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    color: note.priority === priority ? '#fff' : C.soft,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Attach to Student/Group */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 8,
              display: 'block'
            }}>
              Attach To (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <select
                value={note.studentId || ''}
                onChange={(e) => setNote(prev => ({ 
                  ...prev, 
                  studentId: e.target.value ? parseInt(e.target.value) : null,
                  groupId: null // Clear group when student is selected
                }))}
                style={{
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12
                }}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              <select
                value={note.groupId || ''}
                onChange={(e) => setNote(prev => ({ 
                  ...prev, 
                  groupId: e.target.value ? parseInt(e.target.value) : null,
                  studentId: null // Clear student when group is selected
                }))}
                style={{
                  padding: '8px 12px',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12
                }}
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              marginBottom: 8,
              display: 'block'
            }}>
              Visibility
            </label>
            <div style={{ display: 'grid', gap: 8 }}>
              {VISIBILITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setNote(prev => ({ ...prev, visibility: option.id }))}
                  style={{
                    padding: '12px',
                    background: note.visibility === option.id ? `${C.blue}20` : C.inner,
                    border: `1px solid ${note.visibility === option.id ? C.blue : C.border}`,
                    borderRadius: 6,
                    color: note.visibility === option.id ? C.blue : C.soft,
                    fontSize: 11,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{option.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Specific Staff Selection */}
          {note.visibility === 'specific' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8,
                display: 'block'
              }}>
                Select Staff Members
              </label>
              <div style={{ maxHeight: 150, overflow: 'auto' }}>
                {teachers.map(staff => (
                  <label
                    key={staff.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: C.inner,
                      borderRadius: 6,
                      marginBottom: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={note.specificStaff.includes(staff.id)}
                      onChange={() => toggleStaffSelection(staff.id)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: 11, color: C.soft }}>
                      {staff.name} - {staff.subject}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.text
              }}>
                Attachments
              </label>
              <button
                onClick={addAttachment}
                style={{
                  padding: '4px 8px',
                  background: C.green,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                + Add File
              </button>
            </div>
            {note.attachments.length === 0 ? (
              <div style={{
                padding: '20px',
                background: C.inner,
                border: `1px dashed ${C.border}`,
                borderRadius: 6,
                textAlign: 'center',
                color: C.muted,
                fontSize: 11
              }}>
                No attachments added
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {note.attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: C.inner,
                      borderRadius: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📎</span>
                      <div>
                        <div style={{ fontSize: 11, color: C.soft }}>{attachment.name}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{attachment.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: C.red,
                        fontSize: 16,
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: C.inner,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.soft,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !note.title.trim() || !note.content.trim()}
            style={{
              padding: '10px 20px',
              background: loading || !note.title.trim() || !note.content.trim() ? C.inner : C.blue,
              border: 'none',
              borderRadius: 6,
              color: loading || !note.title.trim() || !note.content.trim() ? C.muted : '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: loading || !note.title.trim() || !note.content.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 12,
                  height: 12,
                  border: '2px solid transparent',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>
                💾 Save Note
              </>
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
