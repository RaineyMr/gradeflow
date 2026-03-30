// src/components/support/MiniBarChart.jsx
import React from 'react'

const C = { muted:'#6b7494', border:'#252b3d', text:'#eef0f8' }

/**
 * MiniBarChart — lightweight inline SVG bar chart. No external libraries.
 *
 * Props:
 *   data    number[]  — bar values
 *   labels  string[]  — x-axis labels (same length as data)
 *   color   string    — bar fill color (hex)
 *   height  number    — chart height in px (default 80)
 *   showValues bool   — show value on top of each bar (default true)
 */
export default function MiniBarChart({ data = [], labels = [], color = '#3b7ef4', height = 80, showValues = true }) {
  if (!data.length) return (
    <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>
      No data
    </div>
  )

  const max       = Math.max(...data, 1)
  const barCount  = data.length
  const svgW      = 280
  const svgH      = height
  const barW      = Math.min(32, (svgW / barCount) - 6)
  const gap       = (svgW - barCount * barW) / (barCount + 1)
  const labelH    = 14
  const chartH    = svgH - labelH - (showValues ? 14 : 0)

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ display:'block', overflow:'visible' }}
      aria-label="Bar chart"
    >
      {data.map((val, i) => {
        const barH  = Math.max(2, (val / max) * chartH)
        const x     = gap + i * (barW + gap)
        const yTop  = chartH - barH + (showValues ? 14 : 0)
        const label = labels[i] || ''

        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x} y={yTop}
              width={barW} height={barH}
              rx={3} ry={3}
              fill={color}
              opacity={0.85}
            />
            {/* Value label above bar */}
            {showValues && (
              <text
                x={x + barW / 2} y={yTop - 3}
                textAnchor="middle"
                fontSize={9} fontWeight="700"
                fill={color}
              >
                {val}
              </text>
            )}
            {/* X-axis label */}
            <text
              x={x + barW / 2} y={svgH}
              textAnchor="middle"
              fontSize={9} fontWeight="600"
              fill={C.muted}
            >
              {label}
            </text>
          </g>
        )
      })}
      {/* Baseline */}
      <line
        x1={0} y1={chartH + (showValues ? 14 : 0)}
        x2={svgW} y2={chartH + (showValues ? 14 : 0)}
        stroke={C.border} strokeWidth={1}
      />
    </svg>
  )
}
