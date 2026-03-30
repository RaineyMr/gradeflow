// src/pages/SupportStaffGroupScreen.jsx
import React, { useState } from 'react'
import { useStore } from '../lib/store'
import GroupMessagingPanel from '../components/support/GroupMessagingPanel'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const T = {
  header: 'linear-gradient(135deg, #003057 0%, #000d1a 100%)',
}

function scrollTop() { window.scrollTo(0, 0) }

// ─── Student Row ──────────────────────────────────────────────────────────────
function StudentRow({ student, onMessage, onViewProfile }) {
  const gradeColor = student.grade >= 80 ? C.green : student.grade >= 70 ? C.amber : C.red
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👤</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{student.name}</div>
        <div style={{ fontSize:11, color:gradeColor, fontWeight:700 }}>{student.grade}% {student.grade < 70 ? '· Below passing' : ''}</div>
      </div>
      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
        <button onClick={() => onMessage(student)}
          style={{ background:`${C.teal}18`, color:C.teal, border:`1px solid ${C.teal}30`, borderRadius:8, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          💬
        </button>
        <button onClick={() => onViewProfile(student)}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:8, padding:'5px 10px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          👁
        </button>
      </div>
    </div>
  )
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group, students, onMessageGroup, onViewProfile }) {
  const [expanded, setExpanded] = useState(false)

  const flaggedCount = students.filter(s => s.flagged).length
  const atRiskCount  = students.filter(s => s.grade < 70).length

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, marginBottom:12, overflow:'hidden' }}>

      {/* Card header */}
      <div style={{ padding:'16px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>{group.name}</div>
            {group.description && (
              <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{group.description}</div>
            )}
            {/* Stats chips */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${C.blue}18`, color:C.blue }}>
                👥 {students.length} student{students.length !== 1 ? 's' : ''}
              </span>
              {flaggedCount > 0 && (
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${C.red}18`, color:C.red }}>
                  ⚑ {flaggedCount} flagged
                </span>
              )}
              {atRiskCount > 0 && (
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${C.amber}18`, color:C.amber }}>
                  📉 {atRiskCount} at risk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setExpanded(e => !e)}
            style={{ flex:1, background: expanded ? `${C.blue}20` : C.inner, color: expanded ? C.blue : C.soft, border:`1px solid ${expanded ? C.blue + '40' : C.border}`, borderRadius:10, padding:'9px 12px', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
            {expanded ? '▲ Hide Students' : `👥 View Students (${students.length})`}
          </button>
          <button onClick={() => onMessageGroup(group, students)}
            style={{ flex:1, background:`${C.teal}18`, color:C.teal, border:`1px solid ${C.teal}30`, borderRadius:10, padding:'9px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            💬 Message Group
          </button>
        </div>
      </div>

      {/* Expanded student list */}
      {expanded && students.length > 0 && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 16px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
            Students in this group
          </div>
          {students.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              onMessage={s => onMessageGroup(group, [s])}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}

      {expanded && students.length === 0 && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'24px 16px', textAlign:'center', color:C.muted }}>
          <div style={{ fontSize:28, marginBottom:8 }}>👥</div>
          <div style={{ fontSize:12 }}>No students in this group yet</div>
        </div>
      )}
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportStaffGroupScreen({ onBack, onViewProfile }) {
  const { getSupportStaffGroups, getGroupStudents, createSupportStaffGroup, getAllStudents } = useStore()

  const groups   = getSupportStaffGroups()
  const [messagingTarget, setMessagingTarget] = useState(null) // { group, students }
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', selectedStudents: [] })

  function openMessaging(group, students) {
    setMessagingTarget({ group, students })
  }

  function handleViewProfile(student) {
    if (onViewProfile) onViewProfile(student)
  }

  function handleCreateGroup() {
    if (newGroup.name.trim() && newGroup.selectedStudents.length > 0) {
      createSupportStaffGroup({
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        studentIds: newGroup.selectedStudents
      })
      setNewGroup({ name: '', description: '', selectedStudents: [] })
      setShowCreateModal(false)
    }
  }

  function toggleStudentSelection(studentId) {
    setNewGroup(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }))
  }

  return (
    <>
      <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:100 }}>

        {/* Header */}
        <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
            <button onClick={onBack}
              style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              ← Back
            </button>
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>👥 My Groups</h1>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>
                {groups.length} group{groups.length !== 1 ? 's' : ''} · tap to expand
              </p>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              style={{ background:'var(--school-color)', border:'none', borderRadius:10, padding:'8px 16px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
              + Create
            </button>
          </div>
        </div>

        {/* Groups list */}
        <div style={{ padding:'16px' }}>
          {groups.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
              <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.soft, marginBottom:8 }}>No groups yet</div>
              <div style={{ fontSize:13, lineHeight:1.6 }}>
                Groups let you organize students and send targeted messages to students, parents, or their teachers.
              </div>
            </div>
          ) : (
            groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                students={getGroupStudents(group.id)}
                onMessageGroup={openMessaging}
                onViewProfile={handleViewProfile}
              />
            ))
          )}
        </div>
      </div>

      {/* Group Messaging Panel — rendered as overlay when active */}
      {messagingTarget && (
        <GroupMessagingPanel
          groupId={messagingTarget.group.id}
          groupName={messagingTarget.group.name}
          students={messagingTarget.students}
          onClose={() => setMessagingTarget(null)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{ position:'fixed', inset:0, zIndex:250, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ width:'100%', maxWidth:500, maxHeight:'85vh', overflowY:'auto', background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.text }}>Create New Group</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Organize students for targeted messaging</div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background:C.inner, border:'none', borderRadius:999, width:32, height:32, color:C.soft, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            {/* Group Name */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.soft, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, display:'block' }}>Group Name *</label>
              <input
                value={newGroup.name}
                onChange={e => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Math Intervention, Reading Support"
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Group Description */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.soft, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, display:'block' }}>Description (optional)</label>
              <textarea
                value={newGroup.description}
                onChange={e => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's the purpose of this group?"
                rows={3}
                style={{ width:'100%', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', resize:'vertical' }}
              />
            </div>

            {/* Student Selection */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.soft, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, display:'block' }}>
                Select Students * ({newGroup.selectedStudents.length} selected)
              </label>
              <div style={{ maxHeight:'200px', overflowY:'auto', background:C.inner, border:`1px solid ${C.border}`, borderRadius:10, padding:8 }}>
                {getAllStudents().map(student => {
                  const isSelected = newGroup.selectedStudents.includes(student.id)
                  const gradeColor = student.grade >= 80 ? C.green : student.grade >= 70 ? C.amber : C.red
                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      style={{ width:'100%', background:isSelected ? `${C.blue}15` : 'transparent', border:isSelected ? `1px solid ${C.blue}40` : '1px solid transparent', borderRadius:8, padding:'8px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}
                    >
                      <div style={{ width:24, height:24, borderRadius:'50%', background:isSelected ? C.blue : C.inner, border:isSelected ? '2px solid var(--school-color)' : `1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:isSelected ? '#fff' : C.muted }}>
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
                onClick={() => setShowCreateModal(false)}
                style={{ flex:1, background:C.inner, color:C.soft, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.name.trim() || newGroup.selectedStudents.length === 0}
                style={{ 
                  flex:1, 
                  background:newGroup.name.trim() && newGroup.selectedStudents.length > 0 ? 'var(--school-color)' : C.inner, 
                  color:newGroup.name.trim() && newGroup.selectedStudents.length > 0 ? '#fff' : C.muted, 
                  border:newGroup.name.trim() && newGroup.selectedStudents.length > 0 ? '1px solid var(--school-color)' : `1px solid ${C.border}`, 
                  borderRadius:10, padding:'10px', fontSize:12, fontWeight:700, cursor:'pointer' 
                }}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
