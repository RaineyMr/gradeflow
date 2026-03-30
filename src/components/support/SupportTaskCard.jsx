// src/components/support/SupportTaskCard.jsx
import React, { useState } from 'react'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportTaskCard({ task, onAction, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!task) return null
  
  const getCategoryColor = (category) => {
    switch (category) {
      case 'attendance': return C.amber
      case 'grades': return C.red
      case 'behavior': return C.purple
      case 'intervention': return C.blue
      case 'parent comms': return C.teal
      case 'caseload': return C.purple
      case 'groups': return C.blue
      case 'meeting': return C.green
      case 'summary': return C.soft
      default: return C.blue
    }
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return C.red
      case 'medium': return C.amber
      case 'low': return C.green
      default: return C.blue
    }
  }
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'attendance': return '📅'
      case 'grades': return '📊'
      case 'behavior': return '🎯'
      case 'intervention': return '🛠️'
      case 'parent comms': return '💬'
      case 'caseload': return '👥'
      case 'groups': return '🔗'
      case 'meeting': return '📝'
      case 'summary': return '📈'
      default: return '📋'
    }
  }
  
  const handleAction = (action) => {
    if (onAction) {
      onAction(task.id, action)
    }
  }
  
  const cardStyle = compact ? {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  } : {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  }
  
  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{getCategoryIcon(task.category)}</span>
            <div style={{ 
              fontSize: compact ? 12 : 14, 
              fontWeight:600, 
              color:C.text,
              lineHeight:1.2
            }}>
              {task.title}
            </div>
          </div>
          
          {!compact && task.description && (
            <div style={{ 
              fontSize:12, 
              color:C.muted, 
              lineHeight:1.4,
              marginBottom: 8
            }}>
              {task.description}
            </div>
          )}
        </div>
        
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          {task.priority && (
            <div style={{
              fontSize:10,
              padding:'2px 6px',
              borderRadius:4,
              background: `${getPriorityColor(task.priority)}20`,
              color: getPriorityColor(task.priority),
              textTransform:'uppercase',
              fontWeight:600
            }}>
              {task.priority}
            </div>
          )}
          
          {task.dueDate && (
            <div style={{
              fontSize:10,
              color:C.muted,
              display:'flex',
              alignItems:'center',
              gap:4
            }}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && !compact && (
        <div style={{ 
          background: C.inner, 
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 12 
        }}>
          {task.studentName && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Student</div>
              <div style={{ fontSize:12, color:C.text }}>{task.studentName}</div>
            </div>
          )}
          
          {task.riskFactors && task.riskFactors.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Risk Factors</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {task.riskFactors.map((factor, idx) => (
                  <div key={idx} style={{
                    fontSize:10,
                    padding:'2px 6px',
                    borderRadius:4,
                    background: `${C.red}20`,
                    color: C.red
                  }}>
                    {factor.replace('-', ' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {task.template && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Template Preview</div>
              <div style={{ 
                fontSize:11, 
                color:C.text, 
                background: C.bg, 
                padding:8, 
                borderRadius:4,
                fontStyle:'italic'
              }}>
                {task.template.subject}
              </div>
            </div>
          )}
          
          {task.sections && (
            <div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Meeting Sections</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:4 }}>
                {Object.keys(task.sections).map((section, idx) => (
                  <div key={idx} style={{
                    fontSize:10,
                    padding:'2px 6px',
                    borderRadius:4,
                    background: `${C.blue}20`,
                    color: C.blue,
                    textTransform:'capitalize'
                  }}>
                    {section.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {task.actions && task.actions.includes('complete') && (
            <button
              onClick={() => handleAction('complete')}
              style={{
                background: `${C.green}20`,
                border: `1px solid ${C.green}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.green,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.green
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.green}20`
                e.target.style.color = C.green
              }}
            >
              ✓ Complete
            </button>
          )}
          
          {task.actions && task.actions.includes('snooze') && (
            <button
              onClick={() => handleAction('snooze')}
              style={{
                background: `${C.amber}20`,
                border: `1px solid ${C.amber}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.amber,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.amber
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.amber}20`
                e.target.style.color = C.amber
              }}
            >
              ⏰ Snooze
            </button>
          )}
          
          {task.actions && task.actions.includes('dismiss') && (
            <button
              onClick={() => handleAction('dismiss')}
              style={{
                background: `${C.muted}20`,
                border: `1px solid ${C.muted}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.muted,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.muted
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.muted}20`
                e.target.style.color = C.muted
              }}
            >
              ✕ Dismiss
            </button>
          )}
          
          {task.actions && task.actions.includes('convert-to-log') && (
            <button
              onClick={() => handleAction('convert-to-log')}
              style={{
                background: `${C.blue}20`,
                border: `1px solid ${C.blue}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.blue,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.blue
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.blue}20`
                e.target.style.color = C.blue
              }}
            >
              📝 Log
            </button>
          )}
          
          {task.actions && task.actions.includes('convert-to-parent-message') && (
            <button
              onClick={() => handleAction('convert-to-parent-message')}
              style={{
                background: `${C.teal}20`,
                border: `1px solid ${C.teal}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.teal,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.teal
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.teal}20`
                e.target.style.color = C.teal
              }}
            >
              💬 Message
            </button>
          )}
          
          {task.actions && task.actions.includes('use-template') && (
            <button
              onClick={() => handleAction('use-template')}
              style={{
                background: `${C.purple}20`,
                border: `1px solid ${C.purple}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.purple,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.purple
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.purple}20`
                e.target.style.color = C.purple
              }}
            >
              📧 Use
            </button>
          )}
          
          {task.actions && task.actions.includes('download-packet') && (
            <button
              onClick={() => handleAction('download-packet')}
              style={{
                background: `${C.green}20`,
                border: `1px solid ${C.green}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                color: C.green,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.green
                e.target.style.color = C.bg
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${C.green}20`
                e.target.style.color = C.green
              }}
            >
              ⬇ Download
            </button>
          )}
        </div>
        
        {!compact && (task.sections || task.template || task.riskFactors) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
              color: C.muted,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = C.inner
              e.target.style.color = C.text
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = C.muted
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>
    </div>
  )
}
