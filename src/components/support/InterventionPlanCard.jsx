// src/components/support/InterventionPlanCard.jsx
import React from 'react'

const C = {
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494',
  card:'#111520', inner:'#1a1f2e', border:'#252b3d',
  green:'#22c97a', red:'#f04a4a', amber:'#f5a623',
  blue:'#3b7ef4', teal:'#0fb8a0', purple:'#9b6ef5',
}

const TYPE_META = {
  academic:      { label:'Academic Support',          icon:'📚', color:C.blue   },
  behavioral:    { label:'Behavioral Intervention',   icon:'🎯', color:C.amber  },
  wellness:      { label:'Wellness / SEL',            icon:'💚', color:C.green  },
  attendance:    { label:'Attendance Intervention',   icon:'📅', color:C.purple },
  communication: { label:'Family Communication Plan', icon:'👪', color:C.teal   },
}

const STATUS_META = {
  active:    { label:'Active',    color:C.green  },
  overdue:   { label:'Overdue',   color:C.red    },
  completed: { label:'Completed', color:C.muted  },
  draft:     { label:'Draft',     color:C.amber  },
}

function TrendBadge({ trend }) {
  if (trend === 'up')   return <span style={{ fontSize:12, color:C.green, fontWeight:800 }}>↑</span>
  if (trend === 'down') return <span style={{ fontSize:12, color:C.red,   fontWeight:800 }}>↓</span>
  return                       <span style={{ fontSize:12, color:C.muted, fontWeight:800 }}>→</span>
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
  } catch { return iso }
}

function progressTrend(notes) {
  if (!notes) return 'flat'
  const lower = notes.toLowerCase()
  if (lower.includes('on track') || lower.includes('improving') || lower.includes('progress')) return 'up'
  if (lower.includes('concern') || lower.includes('struggling') || lower.includes('behind'))   return 'down'
  return 'flat'
}

/**
 * InterventionPlanCard — read-only display card for a single intervention plan.
 *
 * Props:
 *   plan     object  — intervention plan object
 *   onClick  func    — open full plan detail
 */
export default function InterventionPlanCard({ plan, onClick }) {
  const meta       = TYPE_META[plan.type]   || TYPE_META.academic
  const statusMeta = STATUS_META[plan.status] || STATUS_META.active
  const trend      = progressTrend(plan.progressNotes)

  return (
    <div
      onClick={onClick}
      style={{
        background:   C.card,
        border:       `1px solid ${meta.color}25`,
        borderLeft:   `3px solid ${meta.color}`,
        borderRadius: 14,
        padding:      '14px 16px',
        marginBottom: 10,
        cursor:       onClick ? 'pointer' : 'default',
        transition:   'border-color 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = `${meta.color}50` }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = `${meta.color}25` }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>{meta.icon}</span>
          <span style={{ fontSize:12, fontWeight:700, color:meta.color }}>{meta.label}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <TrendBadge trend={trend}/>
          <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:`${statusMeta.color}18`, color:statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Goal */}
      <div style={{ fontSize:12, color:C.text, lineHeight:1.5, marginBottom:8 }}>
        {plan.goal?.length > 100 ? plan.goal.slice(0, 100) + '…' : plan.goal}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:10, color:C.muted }}>
          {plan.steps?.length || 0} step{plan.steps?.length !== 1 ? 's' : ''} · Follow-up: {formatDate(plan.followUpDate)}
        </div>
        <div style={{ fontSize:10, color:C.muted }}>
          Updated {formatDate(plan.updatedAt)}
        </div>
      </div>

      {/* Progress note preview */}
      {plan.progressNotes && (
        <div style={{ marginTop:8, background:C.inner, borderRadius:8, padding:'6px 10px', fontSize:10, color:C.soft, lineHeight:1.5 }}>
          📝 {plan.progressNotes.length > 80 ? plan.progressNotes.slice(0, 80) + '…' : plan.progressNotes}
        </div>
      )}
    </div>
  )
}
