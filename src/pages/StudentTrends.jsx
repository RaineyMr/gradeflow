import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { LoadingSpinner, EmptyState } from '../components/ui'

// Mock chart data - replace with Recharts or Chart.js later
const MOCK_GRADE_DATA = [
  { date: 'Sep 15', score: 68, type: 'Unit Avg' },
  { date: 'Sep 30', score: 72, type: 'Unit Avg' },
  { date: 'Oct 7', score: 65, type: 'Unit Avg' },
  { date: 'Oct 15', score: 58, type: 'Unit Avg' }
]

const MOCK_PARTICIPATION_DATA = [
  { date: 'Sep 15', positive: 85, negative: 15 },
  { date: 'Sep 30', positive: 78, negative: 22 },
  { date: 'Oct 7', positive: 62, negative: 38 },
  { date: 'Oct 15', positive: 45, negative: 55 }
]

function SparkLine({ data, color, label }) {
  const max = Math.max(...data.map(d => d.score || d.positive || 0))
  const points = data.map(d => ({
    x: d.date,
    y: (d.score || d.positive || 0) / max * 100
  }))

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#9b6ef5' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{Math.max(...data.map(d => d.score || d.positive || 0)).toFixed(0)}%</span>
      </div>
      <div style={{ height: 40, background: '#1a1f2e', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%' }}>
          <polyline 
            points={points.map((p,i) => `${i*8 + 4},${40 - p.y}`).join(' ')} 
            fill="none" 
            stroke={color} 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function TimelineItem({ type, date, content, color }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 12, 
      padding: '12px 0',
      borderLeft: `3px solid ${color}`,
      paddingLeft: 16,
      marginBottom: 8
    }}>
      <div style={{ 
        width: 32, height: 32, 
        background: `${color}20`, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 14, fontWeight: 700,
        flexShrink: 0
      }}>
        📊
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>
          {type}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: '#eef0f8' }}>
          {content}
        </div>
        <div style={{ fontSize: 10, color: '#6b7494', marginTop: 4 }}>
          {date}
        </div>
      </div>
    </div>
  )
}

function RiskIndicator({ level, label }) {
  const colors = {
    low: { bg: '#22c97a20', icon: '✅', text: '#22c97a' },
    medium: { bg: '#f5a62320', icon: '⚠️', text: '#f5a623' },
    high: { bg: '#f04a4a20', icon: '🚨', text: '#f04a4a' },
    critical: { bg: '#ef444420', icon: '💥', text: '#ef4444' }
  }
  const c = colors[level] || colors.medium

  return (
    <div style={{ 
      background: c.bg, 
      border: `1px solid ${c.text}40`, 
      borderRadius: 12, 
      padding: '12px 16px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{label}</div>
      <div style={{ fontSize: 10, color: '#6b7494', marginTop: 4 }}>Risk Level: {level.toUpperCase()}</div>
    </div>
  )
}

export default function StudentTrends({ studentId, readOnly, onBack }) {
  const { activeStudent, loadStudentTrends, studentTrends } = useStore()
  const student = activeStudent || { id: studentId, name: 'Marcus Thompson' }
  
  const [loading, setLoading] = useState(true)
  const [riskFactors, setRiskFactors] = useState([])

  useEffect(() => {
    async function loadData() {
      await loadStudentTrends(student.id)
      setLoading(false)
    }
    loadData()
  }, [student.id, loadStudentTrends])

  const trend = studentTrends[student.id] || {
    grade_avg: 62,
    participation_avg: 58,
    flags_count: 3,
    notes_count: 4,
    risk_level: 'high'
  }

  const mockRisks = [
    trend.grade_avg < 70 ? 'Grade below 70%' : null,
    trend.participation_avg < 60 ? 'Low participation streak' : null,
    trend.flags_count > 2 ? 'Multiple flags (2wks)' : null,
    trend.notes_count > 3 ? 'Multiple interventions active' : null
  ].filter(Boolean)

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '20px 16px 100px', background: '#060810', color: '#eef0f8', minHeight: '100vh' }}>
      
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ 
          background: '#1a1f2e', 
          border: 'none', 
          borderRadius: 12, 
          width: 40, height: 40,
          color: '#eef0f8', 
          fontSize: 16, 
          cursor: 'pointer'
        }}>
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📊 Trends: {student.name}</h1>
          <div style={{ fontSize: 13, color: '#6b7494' }}>
            Current Period: Oct 1-15 · Risk: <span style={{ color: '#f04a4a', fontWeight: 700 }}>High</span>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <RiskIndicator level="high" label="Sudden grade drop (-15pts)" />
        <RiskIndicator level="critical" label="3+ flags in 2 weeks" />
      </div>

      {/* 1. Grade Trend */}
      <div style={{ background: '#111520', borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>📈 Grade Trend</h2>
        <SparkLine data={MOCK_GRADE_DATA} color="#f04a4a" label="Assignment Scores" />
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          <div>Current: <span style={{ color: '#f04a4a', fontWeight: 700 }}>58%</span></div>
          <div>Class Avg: <span style={{ color: '#22c97a' }}>84%</span></div>
          <div>Trend: <span style={{ color: '#f04a4a' }}>↓ -15pts</span></div>
        </div>
      </div>

      {/* 2. Participation Trend */}
      <div style={{ background: '#111520', borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>👥 Participation</h2>
        <SparkLine data={MOCK_PARTICIPATION_DATA} color="#f5a623" label="Positive Engagement" />
        <div style={{ fontSize: 11, color: '#6b7494' }}>
          4 consecutive low days · Missing: 3 assignments
        </div>
      </div>

      {/* 3. Flags Timeline */}
      <div style={{ background: '#111520', borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🚩 Flags Timeline (10/1 - 10/15)</h2>
        <TimelineItem type="Academic" date="Oct 14" content="Quiz score 58% (below 70%)" color="#f04a4a" />
        <TimelineItem type="Behavior" date="Oct 12" content="Disengaged during group work" color="#f5a623" />
        <TimelineItem type="Wellness" date="Oct 10" content="Reported home stress" color="#22c97a" />
      </div>

      {/* 4. Notes Timeline */}
      <div style={{ background: '#111520', borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>📝 Notes Timeline</h2>
        <TimelineItem type="Intervention" date="Oct 15" content="Started RTI math group" color="#ef4444" />
        <TimelineItem type="Academic" date="Oct 12" content="Tutoring session completed" color="#3b7ef4" />
        <TimelineItem type="Wellness" date="Oct 10" content="Counselor referral" color="#22c97a" />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: '1px solid #252b3d' }}>
        <button style={{ flex: 1, background: '#3b7ef420', color: '#3b7ef4', border: '1px solid #3b7ef440', borderRadius: 12, padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>
          📩 Message Group
        </button>
        <button style={{ flex: 1, background: '#22c97a20', color: '#22c97a', border: '1px solid #22c97a40', borderRadius: 12, padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>
          ➕ New Intervention
        </button>
      </div>
    </div>
  )
}

