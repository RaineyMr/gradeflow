import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import DashboardShell from '../components/layout/DashboardShell'
import { useDashboard } from '../hooks/useDashboard'
import SubPage from './Dashboard' // reuse SubPage

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', text:'#eef0f8', muted:'#6b7494',
}

export default function SupportStaffDashboard() {
  const { currentUser, students } = useStore()
  const { subPage, activeNav, isSubPage, navigate } = useDashboard({
    navToPage: { teams: 'teams', messages: 'parentMessages' },
    pageToNav: { teams: 'teams', parentMessages: 'messages' },
  })

  const messagingTargets = useStore(state => state.getMessagingTargetsForSupportStaff())
  const [showMessaging, setShowMessaging] = useState(null)

  const students = messagingTargets.filter(t => t.type === 'student')
  const teachers = messagingTargets.filter(t => t.type === 'teacher')
  const admins  = messagingTargets.filter(t => t.type === 'admin')

  if (subPage === 'parentMessages') {
    return <SubPage><ParentMessages viewerRole="supportStaff" /></SubPage>
  }

  const DEMO_ADMIN = [
    { id: 'a1', name: 'Principal Davis', role: 'admin', avatar: '🏫' },
    { id: 'a2', name: 'Dr. Green', role: 'admin', avatar: '🎓' },
  ]

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
          👥 My Teams ({assignedStudents.length})
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
          🎓 Assigned Students ({assignedStudents.length})
        </div>
        {assignedStudents.map(student => (
          <div key={student.id} style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 18, background: 'var(--school-color)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{student.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Grade: {student.grade}% · {student.flagged ? 'Flagged' : 'On track'}</div>
            </div>
            <button
              onClick={() => openMessaging({ ...student, role: 'student' })}
              style={{ background: `var(--school-color)20`, color: 'var(--school-color)', border: `1px solid var(--school-color)40`, borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              📨 Message Student
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
