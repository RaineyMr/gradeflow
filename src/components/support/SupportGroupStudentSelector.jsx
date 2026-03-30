// src/components/support/SupportGroupStudentSelector.jsx
import React, { useState } from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportGroupStudentSelector({ 
  selectedStudentIds, 
  onSelectionChange,
  maxSelections = null 
}) {
  const { getStudentsForSupportStaff } = useStore()
  
  const availableStudents = getStudentsForSupportStaff()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'atrisk', 'critical', 'ontrack'

  const filteredStudents = availableStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'atrisk' && student.grade >= 60 && student.grade < 70) ||
      (filterStatus === 'critical' && student.grade < 60) ||
      (filterStatus === 'ontrack' && student.grade >= 70)
    
    return matchesSearch && matchesFilter
  })

  function toggleStudent(studentId) {
    if (maxSelections && selectedStudentIds.length >= maxSelections && !selectedStudentIds.includes(studentId)) {
      return // Don't add if at max capacity
    }

    onSelectionChange(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  function selectAll() { 
    if (maxSelections) {
      onSelectionChange(filteredStudents.slice(0, maxSelections).map(s => s.id))
    } else {
      onSelectionChange(filteredStudents.map(s => s.id))
    }
  }
  
  function selectNone() { onSelectionChange([]) }

  const getStatusColor = (grade) => {
    if (grade < 60) return { bg: `${C.red}20`, color: C.red, label: 'Critical' }
    if (grade < 70) return { bg: `${C.amber}20`, color: C.amber, label: 'At Risk' }
    return { bg: `${C.green}20`, color: C.green, label: 'On Track' }
  }

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>
            Select Students
          </div>
          <div style={{ fontSize:10, color:C.muted }}>
            {selectedStudentIds.length} selected{maxSelections ? ` (max ${maxSelections})` : ''}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={selectAll} style={linkBtn}>All</button>
          <button onClick={selectNone} style={linkBtn}>None</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom:12 }}>
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search students..."
          style={{
            width:'100%', background:C.inner, border:`1px solid ${C.border}`,
            borderRadius:8, padding:'8px 12px', color:C.text, fontSize:12,
            outline:'none', boxSizing:'border-box'
          }}
        />
      </div>

      {/* Filter */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'critical', label: 'Critical' },
            { value: 'atrisk', label: 'At Risk' },
            { value: 'ontrack', label: 'On Track' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              style={{
                background: filterStatus === filter.value ? `${C.teal}20` : C.inner,
                border: `1px solid ${filterStatus === filter.value ? C.teal : C.border}`,
                borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:600,
                color: filterStatus === filter.value ? C.teal : C.muted, cursor:'pointer'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div style={{ maxHeight:240, overflowY:'auto', background:C.inner, borderRadius:12, padding:8 }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign:'center', color:C.muted, padding:20, fontSize:11 }}>
            No students found
          </div>
        ) : (
          filteredStudents.map(student => {
            const isSelected = selectedStudentIds.includes(student.id)
            const status = getStatusColor(student.grade)
            
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8,
                  cursor:'pointer', background: isSelected ? `${C.teal}15` : 'transparent',
                  marginBottom:4, transition:'background 0.15s',
                  opacity: (maxSelections && selectedStudentIds.length >= maxSelections && !isSelected) ? 0.5 : 1
                }}
              >
                <div style={{
                  width:18, height:18, borderRadius:4, border:`2px solid ${isSelected ? C.teal : C.border}`,
                  background: isSelected ? C.teal : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0
                }}>
                  {isSelected ? '✓' : ''}
                </div>
                
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.text, truncate:true }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize:9, color:C.muted }}>
                    Grade {student.grade}%
                  </div>
                </div>
                
                <div style={{ 
                  fontSize:9, padding:'2px 6px', borderRadius:4,
                  background: status.bg, color: status.color, fontWeight:600,
                  flexShrink:0
                }}>
                  {status.label}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Selection Summary */}
      {selectedStudentIds.length > 0 && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, fontWeight:600, color:C.muted, marginBottom:6 }}>
            Selected Students ({selectedStudentIds.length})
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {selectedStudentIds.slice(0, 5).map(studentId => {
              const student = availableStudents.find(s => s.id === studentId)
              return student ? (
                <div key={studentId} style={{
                  background:C.bg, border:`1px solid ${C.border}`, borderRadius:4,
                  padding:'2px 6px', fontSize:9, color:C.text
                }}>
                  {student.name}
                </div>
              ) : null
            })}
            {selectedStudentIds.length > 5 && (
              <div style={{
                background:C.bg, border:`1px solid ${C.border}`, borderRadius:4,
                padding:'2px 6px', fontSize:9, color:C.muted
              }}>
                +{selectedStudentIds.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const linkBtn = {
  background:'none', border:'none', color:'#0fb8a0',
  fontSize:10, fontWeight:700, cursor:'pointer', padding:0,
}
