import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import DashboardShell from '../components/layout/DashboardShell'
import { useDashboard } from '../hooks/useDashboard'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', text:'#eef0f8', muted:'#6b7494',
  border:'#252b3d', blue:'#3b7ef4', green:'#22c97a', purple:'#9b6ef4',
}

export default function SupportStaffDashboard() {
  const { currentUser } = useStore()
  const supportNotes = useStore(state => state.supportNotes)
  const { activeNav, isSubPage, navigate } = useDashboard({
    navToPage: { teams: 'teams', messages: 'parentMessages' },
    pageToNav: { teams: 'teams', parentMessages: 'messages' },
  })

  const messagingTargets = useStore(state => state.getMessagingTargetsForSupportStaff())
  const [showMessaging, setShowMessaging] = useState(null)

  const students = messagingTargets.filter(t => t.type === 'student')
  const teachers = messagingTargets.filter(t => t.type === 'teacher')
  const admins   = messagingTargets.filter(t => t.type === 'admin')

  useEffect(() => {
    students.forEach(student => {
      useStore.getState().loadSupportNotes(student.id)
    })
  }, [students.length])

  const openMessaging = (recipient) => {
    setShowMessaging({ [recipient.role]: recipient })
    navigate('parentMessages')
  }

  const shell = (node) => (
    <DashboardShell role="supportStaff" activeNav={activeNav} isSubPage={isSubPage} themeKey="hisd">
      {node}
    </DashboardShell>
  )

  return shell(
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
          👥 My Teams ({students.length})
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {admins.map(admin => (
            <button
              key={admin.id}
              onClick={() => openMessaging(admin)}
              style={{ background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 14px', color: C.text, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {admin.avatar} {admin.name}
            </button>
          ))}
        </div>
      </div>

      {/* Students */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          🎓 Assigned Students ({students.length})
        </div>
        {students.map(student => {
          const studentNotes = supportNotes.filter(n => n.student_id === student.id)
          const latestNote = studentNotes[0]
          return (
            <div key={student.id} style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 18, background: 'var(--school-color)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                👤
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{student.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Grade: {student.grade}% · {student.flagged ? 'Flagged' : 'On track'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: `${C.blue}20`, color: C.blue }}>
                    {studentNotes.length} notes
                  </span>
                  {latestNote && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: `${C.green}20`, color: C.green }}>
                      {new Date(latestNote.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => openMessaging({ ...student, role: 'student' })}
                  style={{ background: 'var(--school-color)20', color: 'var(--school-color)', border: '1px solid var(--school-color)40', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  📨 Message
                </button>
                <button
                  onClick={() => useStore.getState().setActiveStudent(student)}
                  style={{ background: `${C.purple}20`, color: C.purple, border: `1px solid ${C.purple}30`, borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  👁️ Profile
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
