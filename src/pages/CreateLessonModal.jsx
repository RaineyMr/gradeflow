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

export default function CreateLessonModal({ date, isOpen, onClose, onSelect }) {
  if (!isOpen) return null

  const dateObj = new Date(date)
  const dateStr = dateObj.toISOString().split('T')[0]

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
          maxWidth: 450,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
              Create Lesson
            </h2>
            <div style={{ fontSize: 12, color: C.muted }}>
              {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'ai', icon: 'AI', label: 'AI Generate', desc: '3 questions to full lesson', color: C.purple },
            { id: 'build', icon: 'Build', label: 'Build from Scratch', desc: 'Write your own lesson', color: C.blue },
            { id: 'upload', icon: 'Upload', label: 'Upload Document', desc: 'PDF, Word, or image', color: C.teal },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onSelect(dateStr, mode.id)
                onClose()
              }}
              style={{
                width: '100%',
                background: C.inner,
                border: `1px solid ${mode.color}30`,
                borderRadius: 12,
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = mode.color
                e.currentTarget.style.background = C.raised
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${mode.color}30`
                e.currentTarget.style.background = C.inner
              }}
            >
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600,
                color: mode.color,
                padding: '4px 8px',
                borderRadius: 6,
                background: `${mode.color}20`
              }}>
                {mode.icon}
              </div>
              <div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{mode.label}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
