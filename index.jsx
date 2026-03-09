import React from 'react'

export function GradeBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 90 ? '#22c97a' : pct >= 80 ? '#3b7ef4' : pct >= 70 ? '#f5a623' : '#f04a4a'
  return (
    <div className="w-20 h-1 rounded-full bg-border overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function GradeBadge({ score }) {
  const color = score >= 90 ? '#22c97a' : score >= 80 ? '#3b7ef4' : score >= 70 ? '#f5a623' : '#f04a4a'
  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  return (
    <span className="font-bold text-sm" style={{ color }}>
      {score}% {letter}
    </span>
  )
}

export function TrendBadge({ trend }) {
  if (trend === 'up') return <span className="text-success text-xs">↑</span>
  if (trend === 'down') return <span className="text-danger text-xs">↓</span>
  return <span className="text-text-muted text-xs">→</span>
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative bg-card border border-elevated rounded-widget p-6 animate-slide-up max-h-[90vh] overflow-y-auto ${wide ? 'w-full max-w-3xl' : 'w-full max-w-lg'}`}
        style={{ margin: '1rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tag({ children, color = '#3b7ef4' }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-semibold"
      style={{ background: `${color}22`, color }}
    >
      {children}
    </span>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  )
}

export function OptionToggle({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
      style={{
        background: active ? '#3b7ef420' : '#1e2231',
        color: active ? '#3b7ef4' : '#6b7494',
        border: `1px solid ${active ? '#3b7ef440' : 'transparent'}`
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export function AssignmentOptions({ options, onChange }) {
  return (
    <div>
      <p className="tag-label mb-2">Assignment Options</p>
      <div className="flex flex-wrap gap-2">
        <OptionToggle icon="🔒" label="Lockdown" active={options.lockdown} onClick={() => onChange({ ...options, lockdown: !options.lockdown })} />
        <OptionToggle icon="⏱" label="Timer" active={options.timer} onClick={() => onChange({ ...options, timer: !options.timer })} />
        <OptionToggle icon="🔀" label="Shuffle" active={options.shuffle} onClick={() => onChange({ ...options, shuffle: !options.shuffle })} />
        <OptionToggle icon="📅" label="Schedule" active={options.schedule} onClick={() => onChange({ ...options, schedule: !options.schedule })} />
        <OptionToggle icon="👁" label="Monitor" active={options.monitor} onClick={() => onChange({ ...options, monitor: !options.monitor })} />
      </div>
      {options.timer && (
        <div className="mt-2 flex items-center gap-2">
          <input type="number" placeholder="Minutes" className="bg-elevated border border-border rounded-pill px-3 py-1 text-sm text-text-primary w-24" />
          <span className="text-text-muted text-xs">minute limit</span>
        </div>
      )}
      {options.schedule && (
        <div className="mt-2 flex gap-2">
          <input type="datetime-local" className="bg-elevated border border-border rounded-card px-3 py-1 text-xs text-text-primary flex-1" />
          <input type="datetime-local" className="bg-elevated border border-border rounded-card px-3 py-1 text-xs text-text-primary flex-1" />
        </div>
      )}
    </div>
  )
}
