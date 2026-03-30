import React from 'react'
import { useStore } from '../lib/store'
import Widget from '../components/ui/Widget'

const C = {
  bg: '#060810', card: '#111520', inner: '#1a1f2e', 
  text: '#eef0f8', muted: '#6b7494', border: '#252b3d',
  green: '#22c97a', amber: '#f5a623', red: '#f04a4a', purple: '#9b6ef5'
}

export default function StudentTrends({ student }) {
  const { studentTrends } = useStore()
  
  const trend = studentTrends[student?.id] || {
    period1: 78, period2: 82, period3: 76, period4: 84,
    trend: 'up', riskLevel: 'medium', flags: 2
  }

  return (
    <div style={{ background: C.bg, color: C.text, padding: '20px 16px 100px' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, var(--school-color) 0%, #000d1f 100%)',
        padding: '18px 16px', position: 'sticky', top: 0, zIndex: 50 
      }}>
        <button onClick={() => window.history.back()} style={{ 
          color: 'white', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer'
        }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
          📊 {student?.name || 'Student'} Trends
        </h1>

        {/* Current Status */}
        <Widget style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: trend.trend === 'up' ? C.green : C.red }}>
                {trend.current || 79}%
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Current Avg</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: trend.riskLevel === 'low' ? C.green : C.red }}>
                {trend.riskLevel?.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Risk Level</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.purple }}>
                {trend.flags || 2}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Flags</div>
            </div>
          </div>
        </Widget>

        {/* Grade History Chart */}
        <Widget style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16 }}>Grade History</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
            {[
              { period: 'P1', score: trend.period1 || 78, trend: 'up' },
              { period: 'P2', score: trend.period2 || 82, trend: 'up' },
              { period: 'P3', score: trend.period3 || 76, trend: 'down' },
              { period: 'P4', score: trend.period4 || 84, trend: 'up' }
            ].map(p => (
              <div key={p.period} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, 
                  color: p.score >= 80 ? C.green : p.score >= 70 ? C.amber : C.red }}>
                  {p.score}%
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.period}</div>
              </div>
            ))}
          </div>
        </Widget>

        {/* Risk Factors */}
        <Widget style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16 }}>Risk Factors</div>
          <ul style={{ fontSize: 12 }}>
            <li style={{ color: C.red, marginBottom: 8 }}>• 2 consecutive assignments below 70%</li>
            <li style={{ color: C.amber, marginBottom: 8 }}>• Declining participation trend</li>
            <li style={{ color: C.green, marginBottom: 8 }}>• Strong homework performance</li>
          </ul>
        </Widget>

        {/* Recommendations */}
        <Widget>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16 }}>Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: `${C.green}15`, borderRadius: 12, borderLeft: `4px solid ${C.green}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Daily Check-ins</div>
              <div style={{ fontSize: 11, color: C.muted }}>5 min 1:1 with student before class</div>
            </div>
            <div style={{ padding: 12, background: `${C.amber}15`, borderRadius: 12, borderLeft: `4px solid ${C.amber}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Parent Call</div>
              <div style={{ fontSize: 11, color: C.muted }}>Schedule 10 min call this week</div>
            </div>
            <div style={{ padding: 12, background: `${C.purple}15`, borderRadius: 12, borderLeft: `4px solid ${C.purple}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Intervention Plan</div>
              <div style={{ fontSize: 11, color: C.muted }}>Create formal plan with specific goals</div>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  )
}
