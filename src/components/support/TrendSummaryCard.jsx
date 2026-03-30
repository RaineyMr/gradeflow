// src/components/support/TrendSummaryCard.jsx
import React from 'react'

const C = {
  text:'#eef0f8', muted:'#6b7494', card:'#111520',
  inner:'#1a1f2e', border:'#252b3d',
  green:'#22c97a', red:'#f04a4a', amber:'#f5a623', blue:'#3b7ef4',
}

function TrendBadge({ trend }) {
  if (trend === 'up')   return <span style={{ fontSize:13, color:C.green,  fontWeight:800 }}>↑</span>
  if (trend === 'down') return <span style={{ fontSize:13, color:C.red,    fontWeight:800 }}>↓</span>
  return                       <span style={{ fontSize:13, color:C.muted,  fontWeight:800 }}>→</span>
}

/**
 * TrendSummaryCard — compact read-only metric card for support staff dashboards.
 *
 * Props:
 *   title    string   — metric label
 *   value    any      — primary display value
 *   trend    string   — 'up' | 'down' | 'flat'
 *   subtitle string   — optional secondary line
 *   color    string   — hex accent color (defaults to blue)
 *   onClick  func     — optional tap handler
 */
export default function TrendSummaryCard({ title, value, trend = 'flat', subtitle, color = C.blue, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:  C.card,
        border:      `1px solid ${color}25`,
        borderRadius: 16,
        padding:     '14px 16px',
        cursor:      onClick ? 'pointer' : 'default',
        transition:  'border-color 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = `${color}60` }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = `${color}25` }}
    >
      <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
        {title}
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ fontSize:28, fontWeight:900, color, lineHeight:1 }}>
          {value}
        </div>
        <TrendBadge trend={trend}/>
      </div>
      {subtitle && (
        <div style={{ fontSize:10, color:C.muted, marginTop:6, lineHeight:1.4 }}>{subtitle}</div>
      )}
    </div>
  )
}
