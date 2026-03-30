import React, { useState } from 'react'
import { useStore } from '../lib/store'
import DashboardShell from '../components/layout/DashboardShell'
import { useDashboard } from '../hooks/useDashboard'
import Widget from '../components/ui/Widget'
import StudentTrendsWidget from '../components/dashboard/Widgets/StudentTrendsWidget'
import InterventionPlansWidget from '../components/dashboard/Widgets/InterventionPlansWidget'
import GroupsWidget from '../components/dashboard/Widgets/GroupsWidget'

const C = {
  bg: '#060810', card: '#111520', inner: '#1a1f2e', 
  text: '#eef0f8', muted: '#6b7494', border: '#252b3d'
}

export default function SupportStaffGroupScreen({ groupId, groupName, onBack }) {
  const { supportStaffGroups, supportStaffGroupMembers, students, getStudentsInGroup } = useStore()
  const { navigate } = useDashboard()
  
  const groupStudents = getStudentsInGroup(groupId)
  
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <DashboardShell role="supportStaff" activeNav="groups">
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--school-color) 0%, #000d1f 100%)',
          padding: '20px 16px', position: 'sticky', top: 0, zIndex: 50 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack || (() => navigate(null))} style={{ 
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10,
              color: 'white', padding: '8px 12px', cursor: 'pointer', fontSize: 16 
            }}>
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{groupName}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8) '}}>
                {groupStudents.length} students · Group monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Group Summary */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: C.card, padding: 16, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3b7ef4' }}>{groupStudents.length}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Students</div>
            </div>
            <div style={{ background: C.card, padding: 16, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#9b6ef5' }}>3</div>
              <div style={{ fontSize: 11, color: C.muted }}>Active Plans</div>
            </div>
            <div style={{ background: C.card, padding: 16, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f04a4a' }}>2</div>
              <div style={{ fontSize: 11, color: C.muted }}>High Risk</div>
            </div>
          </div>

          {/* Students List */}
          <Widget style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Students ({groupStudents.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groupStudents.map(student => (
                <div key={student.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  background: C.inner, borderRadius: 12, cursor: 'pointer'
                }} onClick={() => navigate('studentProfile')}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', 
                    background: 'var(--school-color)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: 20, color: 'white' }}>
                    👤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {student.grade}% · {student.classId === 1 ? 'Math' : 'Science'}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: student.grade < 70 ? C.red : C.green }}>
                    {student.grade}%
                  </div>
                </div>
              ))}
            </div>
          </Widget>

          {/* Group Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <button style={{ background: '#22c97a20', color: '#22c97a', border: '1px solid #22c97a40',
              borderRadius: 12, padding: 16, fontWeight: 700, cursor: 'pointer' }}>
              📩 Message Group
            </button>
            <button style={{ background: '#3b7ef420', color: '#3b7ef4', border: '1px solid #3b7ef440',
              borderRadius: 12, padding: 16, fontWeight: 700, cursor: 'pointer' }}>
              ➕ Add Student
            </button>
            <button style={{ background: '#9b6ef520', color: '#9b6ef5', border: '1px solid #9b6ef540',
              borderRadius: 12, padding: 16, fontWeight: 700, cursor: 'pointer' }}>
              📊 Group Report
            </button>
            <button style={{ background: '#f04a4a20', color: '#f04a4a', border: '1px solid #f04a4a40',
              borderRadius: 12, padding: 16, fontWeight: 700, cursor: 'pointer' }}>
              🗑 Remove Group
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

