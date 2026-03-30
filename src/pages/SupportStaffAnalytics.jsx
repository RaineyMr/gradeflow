// src/pages/SupportStaffAnalytics.jsx
import React, { useState } from 'react'
import AnalyticsSummaryCard from '../components/support/AnalyticsSummaryCard'
import MiniBarChart from '../components/support/MiniBarChart'
import { demoSupportInterventions } from '../lib/demoSupportInterventions'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

const T = {
  header: 'linear-gradient(135deg, #003057 0%, #000d1a 100%)',
}

// ─── Demo data (self-contained) ───────────────────────────────────────────────
const DEMO_STUDENTS = [
  { id:1, name:'Marcus Thompson', grade:58, flagged:true  },
  { id:2, name:'Zoe Anderson',    grade:55, flagged:true  },
  { id:3, name:'Liam Martinez',   grade:61, flagged:true  },
  { id:4, name:'Sofia Rodriguez', grade:82, flagged:false },
  { id:5, name:'Jordan Williams', grade:74, flagged:false },
]

const DEMO_NOTES = [
  { id:1, studentId:1, type:'academic',     date:'2024-10-14' },
  { id:2, studentId:1, type:'behavior',     date:'2024-10-12' },
  { id:3, studentId:2, type:'wellness',     date:'2024-10-13' },
  { id:4, studentId:2, type:'intervention', date:'2024-10-11' },
  { id:5, studentId:2, type:'academic',     date:'2024-10-10' },
  { id:6, studentId:3, type:'academic',     date:'2024-10-14' },
]

// ─── Analytics computations ───────────────────────────────────────────────────
function getGradeDistribution(students) {
  const dist = { A:0, B:0, C:0, D:0, F:0 }
  students.forEach(s => {
    if      (s.grade >= 90) dist.A++
    else if (s.grade >= 80) dist.B++
    else if (s.grade >= 70) dist.C++
    else if (s.grade >= 60) dist.D++
    else                    dist.F++
  })
  return dist
}

function getNotesByType(notes) {
  return notes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {})
}

function getInterventionStats(plans) {
  return {
    total:     plans.length,
    active:    plans.filter(p => p.status === 'active').length,
    completed: plans.filter(p => p.status === 'completed').length,
    overdue:   plans.filter(p => p.status === 'overdue').length,
  }
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px', marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SupportStaffAnalytics({ onBack }) {
  const gradesDist   = getGradeDistribution(DEMO_STUDENTS)
  const notesByType  = getNotesByType(DEMO_NOTES)
  const interventionStats = getInterventionStats(demoSupportInterventions)

  const atRiskCount    = DEMO_STUDENTS.filter(s => s.grade < 70).length
  const flaggedCount   = DEMO_STUDENTS.filter(s => s.flagged).length
  const totalNotes     = DEMO_NOTES.length
  const avgGrade       = Math.round(DEMO_STUDENTS.reduce((sum, s) => sum + s.grade, 0) / DEMO_STUDENTS.length)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif", paddingBottom:100 }}>

      {/* Header */}
      <div style={{ background:T.header, padding:'16px 16px 20px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>📈 Caseload Analytics</h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>{DEMO_STUDENTS.length} students · read-only</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Summary strip */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <AnalyticsSummaryCard title="Average Grade"      value={`${avgGrade}%`}       trend="down"  color="yellow"  subtitle="caseload avg"           />
          <AnalyticsSummaryCard title="At Risk"            value={atRiskCount}           trend="down"  color="red"     subtitle="below 70%"              />
          <AnalyticsSummaryCard title="Flagged"            value={flaggedCount}          trend="flat"  color="yellow"  subtitle="need attention"         />
          <AnalyticsSummaryCard title="Active Plans"       value={interventionStats.active} trend="up" color="green"  subtitle="intervention plans"     />
        </div>

        {/* Grade distribution */}
        <Section title="📊 Grade Distribution">
          <MiniBarChart
            data={[gradesDist.A, gradesDist.B, gradesDist.C, gradesDist.D, gradesDist.F]}
            labels={['A (90+)', 'B (80+)', 'C (70+)', 'D (60+)', 'F (<60)']}
            color={C.blue}
            height={100}
          />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>
            {[
              { label:'A',  val:gradesDist.A, color:C.green  },
              { label:'B',  val:gradesDist.B, color:C.blue   },
              { label:'C',  val:gradesDist.C, color:C.amber  },
              { label:'D',  val:gradesDist.D, color:C.amber  },
              { label:'F',  val:gradesDist.F, color:C.red    },
            ].map(g => (
              <div key={g.label} style={{ background:C.inner, borderRadius:10, padding:'6px 12px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:12, fontWeight:800, color:g.color }}>{g.val}</span>
                <span style={{ fontSize:10, color:C.muted }}>{g.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Support notes breakdown */}
        <Section title="📝 Case Notes by Type">
          <MiniBarChart
            data={['academic','behavior','wellness','intervention'].map(t => notesByType[t] || 0)}
            labels={['Academic','Behavior','Wellness','Intervention']}
            color={C.purple}
            height={90}
          />
          <div style={{ marginTop:12 }}>
            {Object.entries(notesByType).map(([type, count]) => (
              <div key={type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.soft, textTransform:'capitalize' }}>{type}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{count} note{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0' }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.text }}>Total</span>
              <span style={{ fontSize:13, fontWeight:800, color:C.purple }}>{totalNotes}</span>
            </div>
          </div>
        </Section>

        {/* Intervention plans summary */}
        <Section title="🎯 Intervention Plans">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
            {[
              { label:'Total',     val:interventionStats.total,     color:C.blue   },
              { label:'Active',    val:interventionStats.active,    color:C.green  },
              { label:'Completed', val:interventionStats.completed, color:C.muted  },
              { label:'Overdue',   val:interventionStats.overdue,   color:C.red    },
            ].map(s => (
              <div key={s.label} style={{ background:C.inner, borderRadius:12, padding:'10px 12px' }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Mini bar for plans by type */}
          <div style={{ fontSize:10, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Plans by student</div>
          {demoSupportInterventions.map(plan => {
            const student = DEMO_STUDENTS.find(s => s.id === plan.studentId)
            return (
              <div key={plan.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.soft }}>{student?.name || 'Unknown'}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:10, color:C.muted, textTransform:'capitalize' }}>{plan.type}</span>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${C.green}18`, color:C.green }}>{plan.status}</span>
                </div>
              </div>
            )
          })}
        </Section>

        {/* Students needing support */}
        <Section title="⚑ Students Needing Support">
          {DEMO_STUDENTS.filter(s => s.grade < 70 || s.flagged).map(s => {
            const gc = s.grade < 70 ? C.red : C.amber
            return (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{s.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>
                    {s.grade < 70 ? 'Below passing' : 'Flagged'}
                    {s.flagged && s.grade >= 70 ? '' : ''}
                  </div>
                </div>
                <span style={{ fontSize:14, fontWeight:800, color:gc }}>{s.grade}%</span>
              </div>
            )
          })}
        </Section>

        {/* Read-only notice */}
        <div style={{ textAlign:'center', padding:'8px 0 16px', fontSize:10, color:C.muted, lineHeight:1.6 }}>
          📋 Analytics are read-only for support staff.<br/>
          Contact the classroom teacher to update grades or attendance.
        </div>
      </div>
    </div>
  )
}
