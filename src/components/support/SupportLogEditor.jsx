// src/components/support/SupportLogEditor.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const LOG_TYPES = [
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'phone_call', label: 'Phone Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'observation', label: 'Observation', icon: '👁️' },
  { value: 'intervention', label: 'Intervention', icon: '🎯' },
  { value: 'follow_up', label: 'Follow-up', icon: '🔄' },
  { value: 'note', label: 'General Note', icon: '📝' },
]

const CONFIDENTIALITY_LEVELS = [
  { value: 'standard', label: 'Standard', description: 'Visible to all support staff' },
  { value: 'confidential', label: 'Confidential', description: 'Visible only to author and admins' },
  { value: 'private', label: 'Private', description: 'Visible only to author' },
]

export default function SupportLogEditor({ log, studentId, onClose }) {
  const {
    createSupportLog,
    updateSupportLog,
    getStudentsForSupportStaff,
    currentUser
  } = useStore()

  const [type, setType] = useState(log?.type || 'note')
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || log?.studentId || '')
  const [title, setTitle] = useState(log?.title || '')
  const [content, setContent] = useState(log?.content || '')
  const [confidentiality, setConfidentiality] = useState(log?.confidentiality || 'standard')
  const [followUpRequired, setFollowUpRequired] = useState(log?.followUpRequired || false)
  const [followUpDate, setFollowUpDate] = useState(log?.followUpDate || '')
  const [tags, setTags] = useState(log?.tags?.join(', ') || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const availableStudents = getStudentsForSupportStaff()
  const isEditing = !!log

  useEffect(() => {
    if (!studentId && !log && availableStudents.length > 0) {
      setSelectedStudentId(availableStudents[0].id)
    }
  }, [availableStudents, studentId, log])

  async function handleSave() {
    if (!selectedStudentId) {
      setError('Please select a student.')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }

    if (!content.trim()) {
      setError('Please enter log content.')
      return
    }

    if (followUpRequired && !followUpDate) {
      setError('Please specify a follow-up date.')
      return
    }

    setError('')
    setSaving(true)

    try {
      const logData = {
        type,
        studentId: selectedStudentId,
        title: title.trim(),
        content: content.trim(),
        confidentiality,
        followUpRequired,
        followUpDate: followUpRequired ? followUpDate : null,
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      }

      if (isEditing) {
        await updateSupportLog(log.id, logData)
      } else {
        await createSupportLog(logData)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save log:', error)
      setError('Failed to save log. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>
              {isEditing ? 'Edit Support Log' : 'Create Support Log'}
            </div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
              Document your support interaction
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Student Selection */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Student *
          </div>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(parseInt(e.target.value))}
            style={inputStyle}
          >
            <option value="">Select a student</option>
            {availableStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} (Grade {student.grade}%)
              </option>
            ))}
          </select>
        </div>

        {/* Log Type */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Type
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))', gap:8 }}>
            {LOG_TYPES.map(logType => (
              <button
                key={logType.value}
                onClick={() => setType(logType.value)}
                style={{
                  background: type === logType.value ? `${C.teal}18` : C.inner,
                  border: `1px solid ${type === logType.value ? C.teal : C.border}`,
                  borderRadius:8, padding:'8px', cursor:'pointer', textAlign:'center',
                  transition:'all 0.15s'
                }}
              >
                <div style={{ fontSize:14, marginBottom:2 }}>{logType.icon}</div>
                <div style={{ fontSize:10, fontWeight:600, color: type === logType.value ? C.teal : C.text }}>
                  {logType.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Title *
          </div>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); setError('') }}
            placeholder="e.g., Math Support Session, Parent Conference"
            style={inputStyle}
          />
        </div>

        {/* Content */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Content *
          </div>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setError('') }}
            placeholder="Describe the interaction, observations, outcomes, and next steps..."
            rows={6}
            style={{ ...inputStyle, resize:'vertical', minHeight:120, fontFamily:'inherit', lineHeight:1.5 }}
          />
        </div>

        {/* Confidentiality */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Confidentiality
          </div>
          <div style={{ display:'grid', gap:8 }}>
            {CONFIDENTIALITY_LEVELS.map(level => (
              <label key={level.value} style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer' }}>
                <input
                  type="radio"
                  name="confidentiality"
                  value={level.value}
                  checked={confidentiality === level.value}
                  onChange={e => setConfidentiality(e.target.value)}
                  style={{ marginTop:2 }}
                />
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{level.label}</div>
                  <div style={{ fontSize:9, color:C.muted }}>{level.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:8 }}>
            <input
              type="checkbox"
              checked={followUpRequired}
              onChange={e => setFollowUpRequired(e.target.checked)}
              style={{ width:16, height:16 }}
            />
            <span style={{ fontSize:11, fontWeight:600, color:C.text }}>Follow-up Required</span>
          </label>
          
          {followUpRequired && (
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              style={inputStyle}
            />
          )}
        </div>

        {/* Tags */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Tags
          </div>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g., math, behavior, parent, urgent (comma separated)"
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:'8px 12px', fontSize:11, color:C.red, marginBottom:16 }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display:'flex', gap:12 }}>
          <button
            onClick={onClose}
            style={{
              flex:1, background:C.inner, color:C.text, border:`1px solid ${C.border}`,
              borderRadius:12, padding:'13px', fontSize:14, fontWeight:600, cursor:'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex:2, background: saving ? C.inner : C.teal,
              color: saving ? C.muted : '#fff', border:'none', borderRadius:12,
              padding:'13px', fontSize:14, fontWeight:600,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Log' : 'Create Log'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const overlayStyle = {
  position:'fixed', inset:0, zIndex:500,
  background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
  display:'flex', alignItems:'center', justifyContent:'center',
}

const panelStyle = {
  width:'100%', maxWidth:560,
  background:'#060810',
  borderRadius:20,
  border:'1px solid rgba(255,255,255,0.08)',
  padding:'24px',
  maxHeight:'90vh', overflowY:'auto',
}

const inputStyle = {
  width:'100%', background:'#1a1f2e', border:'1px solid #252b3d',
  borderRadius:12, padding:'10px 14px', color:'#eef0f8',
  fontSize:13, outline:'none', boxSizing:'border-box',
}
