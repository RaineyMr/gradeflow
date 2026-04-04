import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { useNavigate } from 'react-router-dom'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', teal: '#0fb8a0', purple: '#9b6ef5',
}

export default function ClassCreation() {
  const { currentUser, addClass } = useStore()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([
    { period: '', subject: '', studentCount: '', room: '' }
  ])

  function updateClass(index, field, value) {
    const updated = [...classes]
    updated[index][field] = value
    setClasses(updated)
  }

  function addClassRow() {
    setClasses([...classes, { period: '', subject: '', studentCount: '', room: '' }])
  }

  function removeClass(index) {
    setClasses(classes.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()
    
    // Validate and add classes
    const validClasses = classes.filter(cls => cls.period && cls.subject)
    
    if (validClasses.length === 0) {
      alert('Please add at least one class with period and subject')
      return
    }

    // Add classes to store (in a real app, this would save to database)
    validClasses.forEach((cls, index) => {
      const newClass = {
        id: `class-${Date.now()}-${index}`,
        period: cls.period,
        subject: cls.subject,
        students: parseInt(cls.studentCount) || 0,
        room: cls.room,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        gpa: 0,
        trend: 'stable',
        needsAttention: 0
      }
      addClass(newClass)
    })

    // Navigate back to dashboard
    navigate('/teacher')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button 
            onClick={() => navigate('/teacher')}
            style={{ 
              background: C.inner, border: 'none', borderRadius: 8, 
              padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13 
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Create Classes</h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Add your teaching periods and subjects</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {classes.map((cls, index) => (
            <div key={index} style={{ 
              background: C.card, border: `1px solid ${C.border}`, 
              borderRadius: 16, padding: 20, position: 'relative' 
            }}>
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClass(index)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: C.red, color: '#fff', border: 'none',
                    borderRadius: '50%', width: 24, height: 24,
                    cursor: 'pointer', fontSize: 16, fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                    Period *
                  </label>
                  <input
                    type="text"
                    value={cls.period}
                    onChange={e => updateClass(index, 'period', e.target.value)}
                    placeholder="e.g., 1st, 2nd, 3rd"
                    style={{
                      width: '100%', background: C.inner, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={cls.subject}
                    onChange={e => updateClass(index, 'subject', e.target.value)}
                    placeholder="e.g., Algebra I, Biology, English"
                    style={{
                      width: '100%', background: C.inner, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                    Student Count
                  </label>
                  <input
                    type="number"
                    value={cls.studentCount}
                    onChange={e => updateClass(index, 'studentCount', e.target.value)}
                    placeholder="e.g., 25"
                    min="1"
                    style={{
                      width: '100%', background: C.inner, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={cls.room}
                    onChange={e => updateClass(index, 'room', e.target.value)}
                    placeholder="e.g., 101, A205"
                    style={{
                      width: '100%', background: C.inner, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={addClassRow}
              style={{
                background: C.inner, color: C.text, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Add Another Class
            </button>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/teacher')}
                style={{
                  background: 'transparent', color: C.muted, border: '1px solid ' + C.border,
                  borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                style={{
                  background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Create Classes →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
