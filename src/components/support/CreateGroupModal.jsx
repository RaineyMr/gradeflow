// src/components/support/CreateGroupModal.jsx
import React, { useState } from 'react'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function CreateGroupModal({ onClose, onCreate, students }) {
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])

  function handleSubmit(e) {
    e.preventDefault()
    if (groupName.trim() && selectedStudents.length > 0) {
      onCreate({
        name: groupName.trim(),
        description: description.trim(),
        studentIds: selectedStudents
      })
    }
  }

  function toggleStudentSelection(studentId) {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  function getGradeColor(grade) {
    return grade >= 80 ? C.green : grade >= 70 ? C.amber : C.red
  }

  return (
    <div style={{ 
      position:'fixed', 
      inset:0, 
      zIndex:250, 
      background:'rgba(0,0,0,0.75)', 
      display:'flex', 
      alignItems:'center', 
      justifyContent:'center', 
      padding:20 
    }}>
      <div style={{ 
        width:'100%', 
        maxWidth:500, 
        maxHeight:'85vh', 
        overflowY:'auto', 
        background:C.card, 
        border:`1px solid ${C.border}`, 
        borderRadius:20, 
        padding:20 
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:C.text }}>Create New Group</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Organize students for targeted messaging</div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background:C.inner, 
              border:'none', 
              borderRadius:999, 
              width:32, 
              height:32, 
              color:C.soft, 
              fontSize:18, 
              cursor:'pointer', 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center' 
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <div style={{ marginBottom:16 }}>
            <label style={{ 
              fontSize:11, 
              fontWeight:700, 
              color:C.soft, 
              textTransform:'uppercase', 
              letterSpacing:'0.06em', 
              marginBottom:6, 
              display:'block' 
            }}>
              Group Name *
            </label>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g., Math Intervention, Reading Support"
              required
              style={{ 
                width:'100%', 
                background:C.inner, 
                border:`1px solid ${C.border}`, 
                borderRadius:10, 
                padding:'10px 14px', 
                color:C.text, 
                fontSize:13, 
                outline:'none', 
                boxSizing:'border-box' 
              }}
            />
          </div>

          {/* Group Description */}
          <div style={{ marginBottom:16 }}>
            <label style={{ 
              fontSize:11, 
              fontWeight:700, 
              color:C.soft, 
              textTransform:'uppercase', 
              letterSpacing:'0.06em', 
              marginBottom:6, 
              display:'block' 
            }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the purpose of this group?"
              rows={3}
              style={{ 
                width:'100%', 
                background:C.inner, 
                border:`1px solid ${C.border}`, 
                borderRadius:10, 
                padding:'10px 14px', 
                color:C.text, 
                fontSize:13, 
                outline:'none', 
                boxSizing:'border-box', 
                resize:'vertical' 
              }}
            />
          </div>

          {/* Student Selection */}
          <div style={{ marginBottom:20 }}>
            <label style={{ 
              fontSize:11, 
              fontWeight:700, 
              color:C.soft, 
              textTransform:'uppercase', 
              letterSpacing:'0.06em', 
              marginBottom:6, 
              display:'block' 
            }}>
              Select Students * ({selectedStudents.length} selected)
            </label>
            <div style={{ 
              maxHeight:'200px', 
              overflowY:'auto', 
              background:C.inner, 
              border:`1px solid ${C.border}`, 
              borderRadius:10, 
              padding:8 
            }}>
              {students.map(student => {
                const isSelected = selectedStudents.includes(student.id)
                const gradeColor = getGradeColor(student.grade)
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudentSelection(student.id)}
                    style={{ 
                      width:'100%', 
                      background:isSelected ? `${C.blue}15` : 'transparent', 
                      border:isSelected ? `1px solid ${C.blue}40` : '1px solid transparent', 
                      borderRadius:8, 
                      padding:'8px 10px', 
                      cursor:'pointer', 
                      display:'flex', 
                      alignItems:'center', 
                      gap:10, 
                      marginBottom:4 
                    }}
                  >
                    <div style={{ 
                      width:24, 
                      height:24, 
                      borderRadius:'50%', 
                      background:isSelected ? C.blue : C.inner, 
                      border:isSelected ? '2px solid var(--school-color)' : `1px solid ${C.border}`, 
                      display:'flex', 
                      alignItems:'center', 
                      justifyContent:'center', 
                      fontSize:12, 
                      color:isSelected ? '#fff' : C.muted 
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                    <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{student.name}</div>
                      <div style={{ fontSize:10, color:gradeColor, fontWeight:700 }}>{student.grade}%</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display:'flex', gap:8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                flex:1, 
                background:C.inner, 
                color:C.soft, 
                border:`1px solid ${C.border}`, 
                borderRadius:10, 
                padding:'10px', 
                fontSize:12, 
                fontWeight:700, 
                cursor:'pointer' 
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedStudents.length === 0}
              style={{ 
                flex:1, 
                background:groupName.trim() && selectedStudents.length > 0 ? 'var(--school-color)' : C.inner, 
                color:groupName.trim() && selectedStudents.length > 0 ? '#fff' : C.muted, 
                border:groupName.trim() && selectedStudents.length > 0 ? '1px solid var(--school-color)' : `1px solid ${C.border}`, 
                borderRadius:10, 
                padding:'10px', 
                fontSize:12, 
                fontWeight:700, 
                cursor:'pointer' 
              }}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
