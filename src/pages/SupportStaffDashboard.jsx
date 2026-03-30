import React, { useState, useEffect } from 'react'
import { useStore } from '@lib/store'
import DashboardShell from '@components/layout/DashboardShell'
import { useDashboard } from '@hooks/useDashboard'
import ParentMessages from '@pages/ParentMessages'
import StudentProfile from '@pages/StudentProfile'



const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef4',
}

const NOTE_COLORS = {
  academic:     C.blue,
  behavior:     C.amber,
  wellness:     C.green,
  intervention: C.red,
}

function NoteTypeBadge({ type }) {
  const color = NOTE_COLORS[type] || C.muted
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
      background: `${color}20`, color }}>
      {type}
    </span>
  )
}

function GradeBar({ grade }) {
  const color = grade >= 80 ? C.green : grade >= 70 ? C.amber : C.red
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${grade}%`, height: '100%', background: color, borderRadius: 2 }}/>
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 34 }}>{grade}%</span>
    </div>
  )
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student, notes, classes, onViewProfile, onMessage, onMessageTeacher }) {
  const [expanded, setExpanded] = useState(false)
  const cls = classes.find(c => c.id === student.classId)
  const studentNotes = notes.filter(n => n.student_id === student.id)
  const latestNote   = studentNotes[0]

  return (
    <div style={{ background: C.card, borderRadius: 18, marginBottom: 12, overflow: 'hidden',
      border: `1px solid ${student.flagged ? `${C.red}40` : C.border}` }}>

      {/* Main row */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--school-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0, color: '#fff' }}>
          👤
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {student.name}
            </span>
            {student.flagged && (
              <span style={{ fontSize: 9, fontWeight: 700, background: `${C.red}20`, color: C.red,
                borderRadius: 6, padding: '2px 5px', flexShrink: 0 }}>⚑ Flagged</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
            {cls ? `${cls.period} Period · ${cls.subject}` : 'No class assigned'}
          </div>
          <GradeBar grade={student.grade}/>
          {/* Notes summary */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
              background: `${C.blue}18`, color: C.blue }}>
              📝 {studentNotes.length} note{studentNotes.length !== 1 ? 's' : ''}
            </span>
            {latestNote && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                background: `${C.green}18`, color: C.green }}>
                {new Date(latestNote.created_at).toLocaleDateString()}
              </span>
            )}
            {latestNote && <NoteTypeBadge type={latestNote.note_type}/>}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.muted, fontSize: 13, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 16px' }}>
          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: C.inner, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800,
                color: student.grade >= 70 ? C.green : C.red }}>{student.grade}%</div>
              <div style={{ fontSize: 9, color: C.muted }}>Grade</div>
            </div>
            <div style={{ background: C.inner, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800,
                color: student.flagged ? C.red : C.green }}>
                {student.flagged ? '⚑' : '✓'}
              </div>
              <div style={{ fontSize: 9, color: C.muted }}>
                {student.flagged ? 'Flagged' : 'On track'}
              </div>
            </div>
            <div style={{ background: C.inner, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.purple }}>
                {studentNotes.length}
              </div>
              <div style={{ fontSize: 9, color: C.muted }}>Notes</div>
            </div>
          </div>

          {/* Recent notes preview */}
          {studentNotes.slice(0, 2).map(note => (
            <div key={note.id} style={{ background: C.inner, borderRadius: 10, padding: '8px 10px',
              marginBottom: 6, borderLeft: `3px solid ${NOTE_COLORS[note.note_type] || C.muted}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <NoteTypeBadge type={note.note_type}/>
                <span style={{ fontSize: 9, color: C.muted, marginLeft: 'auto' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>
                {note.content.length > 100 ? note.content.slice(0, 100) + '…' : note.content}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => onViewProfile(student)}
              style={{ flex: 1, minWidth: 80, background: `${C.purple}18`, color: C.purple,
                border: `1px solid ${C.purple}35`, borderRadius: 10, padding: '8px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              👁 View Profile
            </button>
            <button
              onClick={() => onMessage(student)}
              style={{ flex: 1, minWidth: 80, background: `${C.green}18`, color: C.green,
                border: `1px solid ${C.green}35`, borderRadius: 10, padding: '8px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              💬 Student
            </button>
            <button
              onClick={() => onMessageTeacher(student)}
              style={{ flex: 1, minWidth: 80, background: `${C.teal}18`, color: C.teal,
                border: `1px solid ${C.teal}35`, borderRadius: 10, padding: '8px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              👩‍🏫 Teacher
            </button>
            <button
              onClick={() => navigate('messages')}
              style={{ flex: 1, minWidth: 80, background: `${C.purple}18`, color: C.purple,
                border: `1px solid ${C.purple}35`, borderRadius: 10, padding: '8px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              👪 Parent
            </button>
            <button
              onClick={() => navigate('messages')}
              style={{ flex: 1, minWidth: 80, background: `${C.red}18`, color: C.red,
                border: `1px solid ${C.red}35`, borderRadius: 10, padding: '8px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              🏫 Admin
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SupportStaffDashboard() {
  const {
    classes,
    supportNotes,
    interventionPlans,
    loadSupportStaffGroups, setDemoSupportStaffData, setDemoSupportNotes,
    getStudentsForSupportStaff, getTeachersForSupportStaff, getAdminForSupportStaff,
    setActiveStudent, setActiveClass,
  } = useStore()

  const { subPage, activeNav, isSubPage, navigate, navSelect } = useDashboard({
    navToPage: {
      messages: 'messages',
      notes:    'notes',
      alerts:   'alerts',
    },
    pageToNav: {
      messages: 'messages',
      notes:    'notes',
      alerts:   'alerts',
    },
  })

  const [search, setSearch] = useState('')

  // Load data on mount
  useEffect(() => {
    loadSupportStaffGroups()
    setDemoSupportStaffData()
    setDemoSupportNotes()
  }, [])

  const assignedStudents = getStudentsForSupportStaff()
  const groups = useStore.getState().supportStaffGroups || []
  const teachers = getTeachersForSupportStaff()
  const admins = getAdminForSupportStaff()

  const handleViewProfile = (student) => {
    setActiveStudent(student)
    navigate('studentProfile')
  }

  const handleMessageStudent = (student) => {
    // Navigate to messaging with student selected
    navigate('messages')
  }

  const handleMessageTeacher = (student) => {
    // Navigate to messaging with teacher selected  
    navigate('messages')
  }

  // Filter by search
  const filtered = assignedStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Sub-page: Messages ─────────────────────────────────────────────────────
  if (subPage === 'messages') {
    return (
      <DashboardShell role="supportStaff" activeNav="messages" onNavSelect={navSelect}
        isSubPage={isSubPage} themeKey="hisd">
        <ParentMessages viewerRole="supportStaff" onBack={() => navigate(null)}/>
      </DashboardShell>
    )
  }

  // ── Sub-page: Student Profile (read-only) ──────────────────────────────────
  if (subPage === 'studentProfile') {
    return (
      <DashboardShell role="supportStaff" activeNav="teams" onNavSelect={navSelect}
        isSubPage={true} themeKey="hisd">
        <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 100px' }}>
          <StudentProfile readOnly={true} onBack={() => navigate(null)}/>
        </div>
      </DashboardShell>
    )
  }

  // ── Sub-page: Notes overview ───────────────────────────────────────────────
  if (subPage === 'notes') {
    const allNotes = supportNotes.slice().sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
    return (
      <DashboardShell role="supportStaff" activeNav="notes" onNavSelect={navSelect}
        isSubPage={isSubPage} themeKey="hisd">
        <div style={{ background: C.bg, minHeight: '100vh', color: C.text,
          padding: '20px 16px 100px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📝 All Notes</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
            {allNotes.length} total · across {assignedStudents.length} students
          </div>
          {allNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
              <div>No notes yet</div>
            </div>
          ) : allNotes.map(note => {
            const s = assignedStudents.find(st => st.id === note.student_id)
            return (
              <div key={note.id} style={{ background: C.card, borderRadius: 14, padding: 14,
                marginBottom: 10, borderLeft: `3px solid ${NOTE_COLORS[note.note_type] || C.muted}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <NoteTypeBadge type={note.note_type}/>
                  {s && <span style={{ fontSize: 11, fontWeight: 700, color: C.soft }}>{s.name}</span>}
                  <span style={{ fontSize: 9, color: C.muted, marginLeft: 'auto' }}>
                    {new Date(note.created_at).toLocaleDateString()} · {note.staff?.name || 'Ms. Carter'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{note.content}</div>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 6, textTransform: 'capitalize' }}>
                  🔒 {note.visibility?.replace('-', ' ')}
                </div>
              </div>
            )
          })}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="supportStaff" activeNav={activeNav || 'groups'}
      onNavSelect={navSelect} isSubPage={isSubPage} themeKey="hisd">
      
      <div style={{ 
        background: C.bg, 
        minHeight: '100vh', 
        color: C.text,
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif", 
        paddingBottom: 90 
      }}>
        
        {/* Support Staff Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--school-color,#003057) 0%, #000d1f 100%)',
          padding: '18px 16px 20px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Support Staff Dashboard
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                👥 My Groups ({groups.length || 0}) · {assignedStudents.length} Students
              </div>
            </div>
            {/* Admin quick-message buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {admins.map(admin => (
                <button key={admin.id} onClick={() => navigate('messages')}
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 10, padding: '7px 11px', color: '#fff', fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {admin.avatar}
                  <span style={{ display: 'none', '@media(minWidth:380px)': { display: 'inline' } }}>
                    {admin.name.split(' ').pop()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)', borderRadius: 11,
              padding: '9px 14px', color: '#fff', fontSize: 12, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <SupportStaffHomeFeed navigate={navigate} />
        
        {/* Quick stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '12px 16px' }}> 
          {[
            { label: 'Assigned', val: assignedStudents.length, color: C.blue },
            { label: 'Flagged', val: assignedStudents.filter(s => s.flagged).length, color: C.red },
            { label: 'Total Notes', val: supportNotes.length, color: C.purple },
            { label: 'Active Plans', val: interventionPlans.filter(p => p.status === 'active').length, color: C.teal },
          ].map(stat => (
            <div key={stat.label} style={{ background: C.card, borderRadius: 14, padding: '10px 12px',
              border: `1px solid ${stat.color}22` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>
                {stat.val}
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Teacher quick-message row */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 10 }}>
            Teachers
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {teachers.map(teacher => (
              <button key={teacher.id} onClick={() => navigate('messages')}
                style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '8px 12px', color: C.text, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
                {teacher.avatar} {teacher.name}
                <span style={{ fontSize: 9, color: C.muted }}>· {teacher.subject}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Student list */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: '0.02em',
            textTransform: 'uppercase', marginBottom: 12 }}>
            {search ? `Results (${filtered.length})` : `Students (${filtered.length})`}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <div>No students match "{search}"</div>
            </div>
          ) : filtered.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              notes={supportNotes}
              classes={classes}
              onViewProfile={handleViewProfile}
              onMessage={handleMessageStudent}
              onMessageTeacher={handleMessageTeacher}
            />
          ))}
        </div>

        {/* My Groups Panel */}
        <div style={{ padding: '12px 16px', background: C.inner }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: '0.02em',
            textTransform: 'uppercase', marginBottom: 12 }}>
            👥 My Groups ({groups.length})
          </div>
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No groups yet</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>Create groups to organize students and send group messages</div>
              <button
                onClick={() => navigate('groups')}
                style={{ 
                  background: C.blue, color: 'white', 
                  borderRadius: 12, padding: '12px 24px', 
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                  width: '100%'
                }}>
                + Create First Group
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {groups.map(group => (
                <div key={group.id} style={{ 
                  background: C.card, borderRadius: 16, padding: 16, minWidth: 160, textAlign: 'center',
                  border: `1px solid ${C.border}`, cursor: 'pointer'
                }} onClick={() => navigate('groups')}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>👥</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.blue, marginBottom: 4 }}>
                    {getStudentsForSupportStaff().filter(s => s.groupId === group.id).length || 0}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>students</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

