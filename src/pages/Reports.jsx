import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Tag } from '../components/ui'

export default function Reports() {
  const { classes } = useStore()
  const [classFilter, setClassFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('month')
  const [active, setActive] = useState(null)

  const reportTypes = [
    { id: 'mastery', icon: '📊', label: 'Class Mastery', desc: 'Chart or table', color: '#3b7ef4' },
    { id: 'student', icon: '👤', label: 'Student Report', desc: 'Individual', color: '#22c97a' },
    { id: 'dist', icon: '📉', label: 'Grade Dist.', desc: 'Distribution', color: '#f5a623' },
    { id: 'attention', icon: '⚑', label: 'Needs Attention', desc: 'At-risk', color: '#f04a4a' },
    { id: 'comm', icon: '💬', label: 'Comm. Log', desc: 'Parent msgs', color: '#9b6ef5' },
    { id: 'progress', icon: '📈', label: 'Progress', desc: 'Over time', color: '#0fb8a0' },
  ]

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Reports</h1>
      <p className="text-text-muted text-sm mb-6">School-level only · No individual grades shared externally</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          className="bg-elevated border border-border rounded-pill px-3 py-1.5 text-sm text-text-primary"
          value={classFilter} onChange={e => setClassFilter(e.target.value)}
        >
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.period} · {c.subject}</option>)}
        </select>
        <select
          className="bg-elevated border border-border rounded-pill px-3 py-1.5 text-sm text-text-primary"
          value={dateFilter} onChange={e => setDateFilter(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {reportTypes.map(r => (
          <button
            key={r.id}
            onClick={() => setActive(active === r.id ? null : r.id)}
            className="p-4 rounded-card text-center transition-all hover:scale-[1.02]"
            style={{
              background: active === r.id ? `${r.color}22` : '#161923',
              border: `1px solid ${active === r.id ? r.color + '50' : 'transparent'}`
            }}
          >
            <div className="text-3xl mb-2">{r.icon}</div>
            <p className="font-bold text-sm text-text-primary">{r.label}</p>
            <p className="text-text-muted" style={{ fontSize: '10px' }}>{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Active report preview */}
      {active && (
        <div className="p-4 rounded-card mb-6 animate-slide-up" style={{ background: '#161923', border: '1px solid #2a2f42' }}>
          <p className="font-bold text-text-primary mb-3">{reportTypes.find(r => r.id === active)?.label} Preview</p>
          <div className="h-32 rounded-card flex items-center justify-center" style={{ background: '#1e2231' }}>
            <p className="text-text-muted text-sm">Report visualization coming soon</p>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="p-4 rounded-card" style={{ background: '#1e2231' }}>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm flex-1">Export report</span>
          {[
            { icon: '🖨', label: 'Print', action: () => window.print() },
            { icon: '⬇', label: 'PDF', action: () => window.print() },
            { icon: '📋', label: 'Spreadsheet', action: () => alert('Spreadsheet export coming soon') },
          ].map(e => (
            <button key={e.label} onClick={e.action} className="px-3 py-1.5 rounded-pill text-xs font-semibold" style={{ background: '#161923', color: '#6b7494' }}>
              {e.icon} {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
