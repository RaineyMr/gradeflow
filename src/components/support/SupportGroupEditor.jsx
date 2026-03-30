// src/components/support/SupportGroupEditor.jsx
import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import SupportGroupStudentSelector from './SupportGroupStudentSelector'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportGroupEditor({ group, onClose }) {
  const {
    createSupportStaffGroup,
    updateSupportStaffGroup,
    getStudentsForSupportStaff,
    currentUser
  } = useStore()

  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [selectedStudentIds, setSelectedStudentIds] = useState(group?.studentIds || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const availableStudents = getStudentsForSupportStaff()
  const isEditing = !!group

  async function handleSave() {
    if (!name.trim()) {
      setError('Please enter a group name.')
      return
    }

    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student for the group.')
      return
    }

    setError('')
    setSaving(true)

    try {
      if (isEditing) {
        await updateSupportStaffGroup(group.id, {
          name: name.trim(),
          description: description.trim(),
          studentIds: selectedStudentIds
        })
      } else {
        await createSupportStaffGroup(name.trim(), selectedStudentIds)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save group:', error)
      setError('Failed to save group. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function toggleStudent(studentId) {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  function selectAll() { setSelectedStudentIds(availableStudents.map(s => s.id)) }
  function selectNone() { setSelectedStudentIds([]) }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>
              {isEditing ? 'Edit Group' : 'Create Group'}
            </div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
              {isEditing ? 'Update group details and members' : 'Create a new support group'}
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background:C.inner, border:'none', borderRadius:999, width:32, height:32, 
              color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' 
            }}
          >
            ×
          </button>
        </div>

        {/* Group Name */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Group Name *
          </div>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="e.g., Math Support Group, At-Risk Students"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            Description
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional: Describe the purpose of this group..."
            rows={3}
            style={{ ...inputStyle, resize:'vertical', minHeight:80 }}
          />
        </div>

        {/* Student Selection */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Select Students * ({selectedStudentIds.length}/{availableStudents.length})
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={selectAll} style={linkBtn}>All</button>
              <button onClick={selectNone} style={linkBtn}>None</button>
            </div>
          </div>
          
          <div style={{ maxHeight:200, overflowY:'auto', background:C.inner, borderRadius:12, padding:8 }}>
            {availableStudents.map(student => (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8,
                  cursor:'pointer', background: selectedStudentIds.includes(student.id) ? `${C.teal}15` : 'transparent',
                  marginBottom:4, transition:'background 0.15s'
                }}
              >
                <div style={{
                  width:20, height:20, borderRadius:4, border:`2px solid ${selectedStudentIds.includes(student.id) ? C.teal : C.border}`,
                  background: selectedStudentIds.includes(student.id) ? C.teal : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', flexShrink:0
                }}>
                  {selectedStudentIds.includes(student.id) ? '✓' : ''}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{student.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>Grade {student.grade}%</div>
                </div>
                <div style={{ 
                  fontSize:10, padding:'2px 6px', borderRadius:4,
                  background: student.grade < 60 ? `${C.red}20` : 
                           student.grade < 70 ? `${C.amber}20` : `${C.green}20`,
                  color: student.grade < 60 ? C.red : 
                         student.grade < 70 ? C.amber : C.green
                }}>
                  {student.grade < 60 ? 'Critical' : student.grade < 70 ? 'At Risk' : 'On Track'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Students Summary */}
        {selectedStudentIds.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
              Selected Students
            </div>
            <div style={{ 
              background:C.inner, borderRadius:12, padding:12, 
              display:'flex', flexWrap:'wrap', gap:6 
            }}>
              {selectedStudentIds.map(studentId => {
                const student = availableStudents.find(s => s.id === studentId)
                return student ? (
                  <div key={studentId} style={{
                    background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                    padding:'4px 8px', fontSize:10, color:C.text,
                    display:'flex', alignItems:'center', gap:4
                  }}>
                    {student.name}
                    <button
                      onClick={() => toggleStudent(studentId)}
                      style={{ 
                        background:'none', border:'none', color:C.red, 
                        fontSize:10, cursor:'pointer', padding:0, marginLeft:2
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, 
            padding:'8px 12px', fontSize:11, color:C.red, marginBottom:16 
          }}>
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
            {saving ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
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
  width:'100%', maxWidth:520,
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

const linkBtn = {
  background:'none', border:'none', color:'#0fb8a0',
  fontSize:11, fontWeight:700, cursor:'pointer', padding:0,
}
