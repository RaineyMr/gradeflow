import React from 'react'
import { X } from 'lucide-react'

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
  purple: '#9b6ef5',
  teal: '#0fb8a0',
}

export default function ViewLessonsModal({ date, lessons, isOpen, onClose, onSelectLesson }) {
  if (!isOpen) return null

  const dateObj = new Date(date)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: 500,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
              {lessons.length > 0 ? 'Lessons' : 'No Lessons'}
            </h2>
            <div style={{ fontSize: 12, color: C.muted }}>
              {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              cursor: 'pointer',
              padding: 4,
              fontSize: 20,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {lessons.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  onSelectLesson(lesson)
                }}
                style={{
                  width: '100%',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.blue
                  e.currentTarget.style.background = C.raised
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border
                  e.currentTarget.style.background = C.inner
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {lesson.title || 'Untitled Lesson'}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.muted }}>
                      <span>
                        {lesson.subject || 'Class'} {lesson.period || ''}
                      </span>
                      <span>{lesson.duration || 45} min</span>
                      <span style={{ textTransform: 'capitalize' }}>{lesson.status || 'pending'}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        lesson.status === 'completed' ? C.green : lesson.status === 'in-progress' ? C.amber : C.blue,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 14 }}>
            No lessons scheduled for this day
          </div>
        )}
      </div>
    </div>
  )
}
