import React from 'react'
import { useStore } from '@lib/store'
import Widget from '@components/ui/Widget'

const C = {
  green: '#22c97a', red: '#f04a4a', amber: '#f5a623', purple: '#9b6ef5',
  blue: '#3b7ef4', muted: '#6b7494', text: '#eef0f8', border: '#252b3d'
}

function TrendSpark({ trend, color }) {
  const points = trend === 'up' ? '2,38 50,10 98,35' : 
                 trend === 'down' ? '2,10 50,38 98,15' : 
                 '2,20 50,20 98,20'
  
  return (
    <svg viewBox="0 0 100 40" style={{ width: 80, height: 20, flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function RiskBadge({ level, count }) {
  const colors = {
    low: C.green, medium: C.amber, high: C.red, critical: '#ef4444'
  }
  const c = colors[level] || C.amber
  
  return (
    <span style={{ 
      background: `${c}20`, color, 
      padding: '3px 8px', borderRadius: 999, 
      fontSize: 10, fontWeight: 700, 
      border: `1px solid ${c}40`
    }}>
      {level.toUpperCase()} ({count})
    </span>
  )
}

export default function StudentTrendsWidget({ navigate }) {
  const { getStudentsForSupportStaff, studentTrends } = useStore()
  const students = getStudentsForSupportStaff()
  
  const atRiskStudents = students.slice(0, 4).map((s, i) => ({
    ...s,
    trend: i % 3 === 0 ? 'down' : 'stable',
    risk: i < 2 ? 'high' : 'medium',
    flags: i + 2
  }))

  function viewTrends(student) {
    useStore.getState().setActiveStudent(student)
    navigate('trends')
  }

  return (
    <Widget onClick={() => navigate('trends')} style={{ border: `1px solid ${C.purple}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>📊 Student Trends</div>
          <div style={{ fontSize: 10, color: C.muted }}>Declining grades · Rising flags · Low participation</div>
        </div>
        <button style={{ 
          background: `${C.purple}20`, color: C.purple, 
          border: `1px solid ${C.purple}40`, 
          borderRadius: 8, padding: '4px 10px', 
          fontSize: 10, fontWeight: 700, cursor: 'pointer'
        }}>
          View All →
        </button>
      </div>

      {atRiskStudents.map(student => (
        <div key={student.id} style={{ 
          display: 'flex', alignItems: 'center', gap: 12, 
          padding: '10px 0', borderBottom: `1px solid ${C.border}20`,
          cursor: 'pointer'
        }} onClick={() => viewTrends(student)}>
          
          <div style={{ 
            width: 36, height: 36, 
            background: 'var(--school-color)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', flexShrink: 0
          }}>
            👤
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>
              {student.name}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {student.grade}% · {student.participation || '58%'} participation
            </div>
          </div>

          <TrendSpark trend={student.trend} color={student.trend === 'down' ? C.red : C.green} />

          <RiskBadge level={student.risk} count={student.flags} />
        </div>
      ))}

      {students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>No students assigned</div>
          <div style={{ fontSize: 11 }}>Create groups to monitor trends</div>
        </div>
      )}
    </Widget>
  )
}
