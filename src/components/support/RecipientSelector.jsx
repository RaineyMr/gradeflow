// src/components/support/RecipientSelector.jsx
import React, { useState } from 'react'
import { useStore } from '../../lib/store'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const RECIPIENT_MODES = {
  students: { label:'Students', icon:'👥', desc:'Message individual students' },
  groups: { label:'Groups', icon:'👥', desc:'Message support staff groups' },
  parents: { label:'Parents', icon:'👪', desc:'Message student parents' },
  teachers: { label:'Teachers', icon:'👩‍🏫', desc:'Message teachers' },
  admins: { label:'Administrators', icon:'🏫', desc:'Message school administrators' },
  counselors: { label:'Counselors', icon:'🧑‍⚕️', desc:'Message school counselors' },
  studentTeachers: { label:'Student Teachers', icon:'👨‍🏫', desc:'Message teachers of specific students' },
}

export default function RecipientSelector({ 
  mode = 'students', 
  onRecipientsChange, 
  preselectedStudentIds = [],
  preselectedGroupIds = [] 
}) {
  const { 
    students, 
    getSupportStaffGroups, 
    getStudentsForSupportStaff,
    getTeachersForSupportStaff,
    getAdminForSupportStaff,
    getParentsForStudents,
    getTeachersForStudents,
    getAllTeachers,
    getAllAdmins,
    getAllCounselors
  } = useStore()

  const [selectedMode, setSelectedMode] = useState(mode)
  const [selectedIds, setSelectedIds] = useState(preselectedStudentIds || preselectedGroupIds || [])
  const [availableRecipients, setAvailableRecipients] = useState([])

  // Update available recipients when mode changes
  React.useEffect(() => {
    let recipients = []
    
    switch (selectedMode) {
      case 'students':
        recipients = getStudentsForSupportStaff().map(s => ({
          id: s.id,
          name: s.name,
          type: 'student',
          extra: `${s.grade}%`
        }))
        break
      case 'groups':
        recipients = getSupportStaffGroups().map(g => ({
          id: g.id,
          name: g.name,
          type: 'group',
          extra: `${g.student_count || 0} students`
        }))
        break
      case 'parents':
        const assignedStudents = getStudentsForSupportStaff()
        recipients = getParentsForStudents(assignedStudents.map(s => s.id)).map(p => ({
          id: p.id,
          name: p.name,
          type: 'parent',
          extra: p.studentName ? `Parent of ${p.studentName}` : 'Parent'
        }))
        break
      case 'teachers':
        recipients = getTeachersForSupportStaff().map(t => ({
          id: t.id,
          name: t.name,
          type: 'teacher',
          extra: t.subject || 'Teacher'
        }))
        break
      case 'admins':
        recipients = getAdminForSupportStaff().map(a => ({
          id: a.id,
          name: a.name,
          type: 'admin',
          extra: a.label || 'Administrator'
        }))
        break
      case 'counselors':
        recipients = getAllCounselors().map(c => ({
          id: c.id,
          name: c.name,
          type: 'counselor',
          extra: c.specialty || 'School Counselor'
        }))
        break
      case 'studentTeachers':
        const studentsWithTeachers = getStudentsForSupportStaff()
        const teacherMap = new Map()
        
        getTeachersForStudents(studentsWithTeachers.map(s => s.id)).forEach(t => {
          if (!teacherMap.has(t.id)) {
            teacherMap.set(t.id, {
              id: t.id,
              name: t.name,
              type: 'teacher',
              extra: t.subject || 'Teacher',
              students: []
            })
          }
          teacherMap.get(t.id).students.push(t.studentName)
        })
        
        recipients = Array.from(teacherMap.values()).map(t => ({
          ...t,
          extra: t.students.length > 1 ? `${t.subject} (${t.students.length} students)` : `${t.subject} (${t.students[0]})`
        }))
        break
    }
    
    setAvailableRecipients(recipients)
  }, [selectedMode, students])

  React.useEffect(() => {
    onRecipientsChange?.(selectedIds, selectedMode)
  }, [selectedIds, selectedMode])

  function toggleRecipient(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function selectAll() { setSelectedIds(availableRecipients.map(r => r.id)) }
  function selectNone() { setSelectedIds([]) }

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
      {/* Mode selector */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
          Recipient Type
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:8 }}>
          {Object.entries(RECIPIENT_MODES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedMode(key)
                setSelectedIds([])
              }}
              style={{
                background: selectedMode === key ? `${C.teal}18` : C.inner,
                border: `1px solid ${selectedMode === key ? C.teal : C.border}`,
                borderRadius:10, padding:'12px', cursor:'pointer', textAlign:'left',
                transition:'all 0.15s',
              }}
            >
              <div style={{ fontSize:16, marginBottom:4 }}>{config.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color: selectedMode === key ? C.teal : C.text }}>
                {config.label}
              </div>
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{config.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient selector */}
      {availableRecipients.length > 0 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Select {RECIPIENT_MODES[selectedMode]?.label} ({selectedIds.length}/{availableRecipients.length})
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={selectAll} style={linkBtn}>All</button>
              <button onClick={selectNone} style={linkBtn}>None</button>
            </div>
          </div>
          
          <div style={{ maxHeight:200, overflowY:'auto', background:C.inner, borderRadius:12, padding:8 }}>
            {availableRecipients.map(r => (
              <div
                key={r.id}
                onClick={() => toggleRecipient(r.id)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8,
                  cursor:'pointer', background: selectedIds.includes(r.id) ? `${C.teal}15` : 'transparent',
                  marginBottom:4, transition:'background 0.15s'
                }}
              >
                <div style={{
                  width:20, height:20, borderRadius:4, border:`2px solid ${selectedIds.includes(r.id) ? C.teal : C.border}`,
                  background: selectedIds.includes(r.id) ? C.teal : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', flexShrink:0
                }}>
                  {selectedIds.includes(r.id) ? '✓' : ''}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{r.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{r.extra}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const linkBtn = {
  background:'none', border:'none', color:'#0fb8a0',
  fontSize:11, fontWeight:700, cursor:'pointer', padding:0,
}
