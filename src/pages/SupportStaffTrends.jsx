// src/pages/SupportStaffTrends.jsx
import React, { useState } from 'react'
import { useStore } from '../lib/store'
import TrendSummaryCard from '../components/support/TrendSummaryCard'
import AIAssistantPanel from '../components/support/AIAssistantPanel'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const T = {
  header: 'linear-gradient(135deg, #003057 0%, #000d1a 100%)',
  secondary: '#B3A369',
}

// ─── Trend computation from grade history ─────────────────────────────────────
function computeTrend(values) {
  if (!values || values.length < 2) return 'flat'
  const recent = values.slice(-3)
  const first  = recent[0]
  const last   = recent[recent.length - 1]
  if (last > first + 2) return 'up'
  if (last < first - 2) return 'down'
  return 'flat'
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ values, color }) {
  if (!values || values.length < 2) return (
    <div style={{ width:64, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:9, color:C.muted }}>—</span>
    </div>
  )

  const w = 64, h = 24, pad = 3
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
      {/* Endpoint dot */}
      {(() => {
        const lastPt = points.split(' ').pop().split(',')
        return <circle cx={lastPt[0]} cy={lastPt[1]} r={2.5} fill={color}/>
      })()}
    </svg>
  )
}

// ─── Per-student trend row ────────────────────────────────────────────────────
function StudentTrendRow({ student, gradeHistory, noteCount, onViewProfile }) {
  const trend      = computeTrend(gradeHistory)
  const gradeColor = student.grade >= 80 ? C.green : student.grade >= 70 ? C.amber : C.red
  const trendColor = trend === 'up' ? C.green : trend === 'down' ? C.red : C.muted
  const trendIcon  = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div style={{ background:C.card, border:`1px solid ${student.flagged ? C.red + '30' : C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--school-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👤</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{student.name}</div>
          <div style={{ fontSize:10, color:C.muted }}>Current: <span style={{ color:gradeColor, fontWeight:700 }}>{student.grade}%</span> · {noteCount} note{noteCount !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:13, fontWeight:800, color:trendColor }}>{trendIcon}</span>
          {student.flagged && <span style={{ fontSize:9, fontWeight:700, background:`${C.red}18`, color:C.red, borderRadius:999, padding:'2px 6px' }}>⚑</span>}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        {[
          { label:'Grade',  val:`${student.grade}%`, color:gradeColor,                          sub:'current' },
          { label:'Trend',  val:trendIcon,            color:trendColor,                          sub:'last 3 periods' },
          { label:'Notes',  val:noteCount,            color:noteCount > 2 ? C.amber : C.muted,  sub:'case notes' },
        ].map(m => (
          <div key={m.label} style={{ background:C.inner, borderRadius:10, padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.val}</div>
            <div style={{ fontSize:9,  color:C.muted,  marginTop:2 }}>{m.label}</div>
            <div style={{ fontSize:8,  color:C.muted }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:9, color:C.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Grade trend</div>
          <Sparkline values={gradeHistory} color={gradeColor}/>
        </div>
        <button onClick={() => onViewProfile(student)}
          style={{ background:`${C.purple}18`, color:C.purple, border:`1px solid ${C.purple}30`, borderRadius:10, padding:'8px 14px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          View Profile →
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
// Grade histories keyed by student id (simulating 3 past periods)
const GRADE_HISTORIES = {
  1: [72, 65, 60, 58],   // Marcus — declining
  2: [68, 61, 57, 55],   // Zoe    — declining
  3: [65, 67, 63, 61],   // Liam   — unstable/declining
  4: [78, 80, 81, 82],   // Sofia  — improving
  5: [70, 72, 74, 74],   // Jordan — stable/improving
}

const DEMO_STUDENTS = [
  { id:1, name:'Marcus Thompson', grade:58, classId:1, flagged:true  },
  { id:2, name:'Zoe Anderson',    grade:55, classId:3, flagged:true  },
  { id:3, name:'Liam Martinez',   grade:61, classId:3, flagged:true  },
  { id:4, name:'Sofia Rodriguez', grade:82, classId:1, flagged:false },
  { id:5, name:'Jordan Williams', grade:74, classId:1, flagged:false },
]

const DEMO_NOTES = [
  { studentId:1, type:'academic' },
  { studentId:1, type:'behavior' },
  { studentId:2, type:'wellness' },
  { studentId:2, type:'intervention' },
  { studentId:2, type:'academic' },
  { studentId:3, type:'academic' },
]

export default function SupportStaffTrends({ onBack, onViewProfile }) {
  const { students } = useStore()
  const [showAI, setShowAI] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = DEMO_STUDENTS.filter(s => {
    if (filter === 'atrisk')   return s.grade < 70
    if (filter === 'flagged')  return s.flagged
    if (filter === 'improving') return computeTrend(GRADE_HISTORIES[s.id]) === 'up'
    return true
  })

  const atRiskCount    = DEMO_STUDENTS.filter(s => s.grade < 70).length
  const improvingCount = DEMO_STUDENTS.filter(s => computeTrend(GRADE_HISTORIES[s.id]) === 'up').length
  const decliningCount = DEMO_STUDENTS.filter(s => computeTrend(GRADE_HISTORIES[s.id]) === 'down').length

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:100 }}>

      {/* Header */}
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📊 Student Trends</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{DEMO_STUDENTS.length} students · read-only view</p>
          </div>
          <button
            onClick={() => setShowAI(true)}
            style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}
          >
            🤖 AI Assist
          </button>
        </div>
        {/* Filter pills */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {[['all','All'],['atrisk','At Risk'],['flagged','Flagged'],['improving','Improving']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', background:filter===val ? T.secondary : 'rgba(255,255,255,0.15)', color:filter===val ? '#000' : '#fff' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Summary strip */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
          <TrendSummaryCard
            title="At Risk"
            value={atRiskCount}
            trend="down"
            color={C.red}
            subtitle="below 70%"
          />
          <TrendSummaryCard
            title="Improving"
            value={improvingCount}
            trend="up"
            color={C.green}
            subtitle="grade rising"
          />
          <TrendSummaryCard
            title="Declining"
            value={decliningCount}
            trend="down"
            color={C.amber}
            subtitle="grade falling"
          />
        </div>

        {/* Per-student rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
            <div style={{ fontSize:14, fontWeight:600 }}>No students match this filter</div>
          </div>
        ) : filtered.map(student => (
          <StudentTrendRow
            key={student.id}
            student={student}
            gradeHistory={GRADE_HISTORIES[student.id] || [student.grade]}
            noteCount={DEMO_NOTES.filter(n => n.studentId === student.id).length}
            onViewProfile={onViewProfile || (() => {})}
          />
        ))}

        {/* Read-only notice */}
        <div style={{ textAlign:'center', padding:'16px 0', fontSize:10, color:C.muted }}>
          📋 Trend data is read-only. Contact classroom teacher to update grades.
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        initialContext={{ 
          screen: 'trends',
          studentData: filtered,
          filter: filter
        }}
      />
    </div>
  )
}
