// src/components/support/SupportLogCard.jsx
import React from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const LOG_TYPE_CONFIG = {
  meeting: { icon: '🤝', color: C.blue, label: 'Meeting' },
  phone_call: { icon: '📞', color: C.green, label: 'Phone Call' },
  email: { icon: '📧', color: C.purple, label: 'Email' },
  observation: { icon: '👁️', color: C.amber, label: 'Observation' },
  intervention: { icon: '🎯', color: C.red, label: 'Intervention' },
  follow_up: { icon: '🔄', color: C.teal, label: 'Follow-up' },
  note: { icon: '📝', color: C.muted, label: 'Note' },
}

const CONFIDENTIALITY_CONFIG = {
  standard: { icon: '🌐', color: C.green, label: 'Standard' },
  confidential: { icon: '🔒', color: C.amber, label: 'Confidential' },
  private: { icon: '🔐', color: C.red, label: 'Private' },
}

export default function SupportLogCard({ log, onEdit }) {
  const { students, currentUser, deleteSupportLog } = useStore()
  
  const student = students.find(s => s.id === log.studentId)
  const typeConfig = LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.note
  const confidentialityConfig = CONFIDENTIALITY_CONFIG[log.confidentiality] || CONFIDENTIALITY_CONFIG.standard

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this log entry? This action cannot be undone.')) {
      return
    }

    try {
      await deleteSupportLog(log.id)
      // The parent component will handle re-rendering
    } catch (error) {
      console.error('Failed to delete log:', error)
      alert('Failed to delete log. Please try again.')
    }
  }

  function canEdit() {
    // Users can edit their own logs, or admins can edit any log
    return log.authorId === currentUser?.id || currentUser?.role === 'admin'
  }

  return (
    <div style={{ 
      background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20,
      position:'relative', overflow:'hidden'
    }}>
      {/* Left accent border */}
      <div style={{
        position:'absolute', top:0, left:0, bottom:0, width:4,
        background:typeConfig.color
      }} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, paddingLeft:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>{typeConfig.icon}</span>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{log.title}</div>
              <div style={{ fontSize:11, color:C.muted }}>{typeConfig.label}</div>
            </div>
          </div>
          
          <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:10, color:C.muted }}>
            <span>👤 {student?.name || 'Unknown Student'}</span>
            <span>📅 {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Recent'}</span>
            <span>✍️ {log.authorName || 'Support Staff'}</span>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Confidentiality indicator */}
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            fontSize:10, color:confidentialityConfig.color,
            background:`${confidentialityConfig.color}15`, padding:'2px 6px', borderRadius:4
          }}>
            <span>{confidentialityConfig.icon}</span>
            <span>{confidentialityConfig.label}</span>
          </div>

          {/* Actions */}
          {canEdit() && (
            <div style={{ display:'flex', gap:4 }}>
              <button
                onClick={onEdit}
                style={{
                  background:C.inner, border:`1px solid ${C.border}`, borderRadius:4,
                  padding:'4px 8px', fontSize:10, color:C.text, cursor:'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background:`${C.red}20`, border:`1px solid ${C.red}30`, borderRadius:4,
                  padding:'4px 8px', fontSize:10, color:C.red, cursor:'pointer'
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        background:C.inner, borderRadius:12, padding:12, marginBottom:12,
        fontSize:12, color:C.text, lineHeight:1.5, paddingLeft:16
      }}>
        {log.content}
      </div>

      {/* Metadata */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingLeft:8 }}>
        <div style={{ display:'flex', gap:12, fontSize:10, color:C.muted }}>
          {log.followUpRequired && (
            <span style={{ display:'flex', alignItems:'center', gap:4 }}>
              🔄 Follow-up: {log.followUpDate || 'Required'}
            </span>
          )}
          {log.updatedAt && log.updatedAt !== log.createdAt && (
            <span>Updated {new Date(log.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Tags */}
        {log.tags && log.tags.length > 0 && (
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {log.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} style={{
                background:C.bg, border:`1px solid ${C.border}`, borderRadius:4,
                padding:'2px 6px', fontSize:9, color:C.soft
              }}>
                #{tag}
              </span>
            ))}
            {log.tags.length > 3 && (
              <span style={{
                background:C.bg, border:`1px solid ${C.border}`, borderRadius:4,
                padding:'2px 6px', fontSize:9, color:C.muted
              }}>
                +{log.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
