// src/components/support/AnalyticsSummaryCard.jsx
import React from 'react'

const C = {
  text:'#eef0f8', muted:'#6b7494', card:'#111520', border:'#252b3d',
  green:'#22c97a', red:'#f04a4a', amber:'#f5a623', blue:'#3b7ef4',
}

const COLOR_MAP = {
  green:  C.green,
  yellow: C.amber,
  red:    C.red,
  blue:   C.blue,
}

function TrendBadge({ trend }) {
  if (trend === 'up')   return <span style={{ fontSize:14, color:C.green, fontWeight:800 }}>↑</span>
  if (trend === 'down') return <span style={{ fontSize:14, color:C.red,   fontWeight:800 }}>↓</span>
  return                       <span style={{ fontSize:14, color:C.muted, fontWeight:800 }}>→</span>
}

/**
 * AnalyticsSummaryCard — read-only analytics metric card.
 *
 * Props:
 *   title    string   — metric name
 *   value    any      — primary display value
 *   trend    string   — 'up' | 'down' | 'flat'
 *   color    string   — 'green' | 'yellow' | 'red' | 'blue'
 *   subtitle string   — optional secondary info
 *   onClick  func     — optional tap handler
 *   onAIExplain func  — optional AI explain handler
 */
export default function AnalyticsSummaryCard({ title, value, trend = 'flat', color = 'blue', subtitle, onClick, onAIExplain }) {
  const accent = COLOR_MAP[color] || C.blue
  return (
    <div
      onClick={onClick}
      style={{
        background:   C.card,
        border:       `1px solid ${accent}22`,
        borderRadius: 16,
        padding:      '14px 16px',
        cursor:       onClick ? 'pointer' : 'default',
        position: 'relative'
      }}
    >
      {/* AI Explain Button */}
      {onAIExplain && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAIExplain()
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            color: C.soft,
            fontSize: '10px',
            padding: '4px 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = C.raised
            e.target.style.color = C.text
          }}
          onMouseLeave={(e) => {
            e.target.style.background = C.inner
            e.target.style.color = C.soft
          }}
        >
          🤖
        </button>
      )}
      
      <div style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
        {title}
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontSize:30, fontWeight:900, color:accent, lineHeight:1 }}>{value}</div>
        <TrendBadge trend={trend}/>
      </div>
      {subtitle && (
        <div style={{ fontSize:10, color:C.muted, lineHeight:1.4 }}>{subtitle}</div>
      )}
    </div>
  )
}

