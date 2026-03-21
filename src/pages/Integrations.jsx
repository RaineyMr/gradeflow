import React, { useState } from 'react'
import { useStore } from '../lib/store'

const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231', text: '#eef0f8',
  muted: '#6b7494', border: '#2a2f42', green: '#22c97a', blue: '#3b7ef4',
  red: '#f04a4a', amber: '#f5a623', teal: '#0fb8a0', purple: '#9b6ef5',
}

const CATEGORY_LABELS = {
  roster:  { label: 'Roster & Gradebook',    icon: '🏫', desc: 'Pull student rosters and sync grades back to your SIS' },
  lms:     { label: 'Learning Management',   icon: '📋', desc: 'Sync assignments, submissions, and grade passback'      },
  lessons: { label: 'Lesson Plans',          icon: '📅', desc: 'Import lesson plans and curriculum resources'           },
}

// ─── Curriculum Sync Panel ────────────────────────────────────────────────────
function CurriculumPanel({ onClose }) {
  const { curriculumSources, connectedCurricula, setConnectedCurriculum, classes } = useStore()
  const subjects = [...new Set(classes.map(c => c.subject))]

  return (
    <div>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
        Connect a curriculum to each subject. GradeFlow will pull lesson plans from the internet when you haven't created your own.
      </p>
      {subjects.map(subject => {
        const connected = connectedCurricula[subject]
        const source    = curriculumSources.find(s => s.id === connected)
        const options   = curriculumSources.filter(s => s.subjects.includes(subject) || s.subjects.length === 0)

        return (
          <div key={subject} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>{subject}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {options.map(opt => (
                <button key={opt.id} onClick={() => setConnectedCurriculum(subject, connected === opt.id ? null : opt.id)}
                  style={{ background: connected === opt.id ? `${C.teal}18` : C.inner, border: `1px solid ${connected === opt.id ? C.teal : C.border}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 20 }}>{opt.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: connected === opt.id ? C.teal : C.text }}>{opt.name}</div>
                    {opt.publisher && <div style={{ fontSize: 10, color: C.muted }}>{opt.publisher}</div>}
                  </div>
                  {connected === opt.id && <span style={{ fontSize: 11, fontWeight: 700, color: C.teal }}>✓ Selected</span>}
                </button>
              ))}
            </div>
          </div>
        )
      })}
      <button onClick={onClose}
        style={{ width: '100%', background: 'var(--school-color, #BA0C2F)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}>
        Save Curriculum Links
      </button>
    </div>
  )
}

// ─── Sync status badge ────────────────────────────────────────────────────────
function SyncBadge({ connected, lastSync }) {
  if (!connected) return (
    <span style={{ background: C.inner, color: C.muted, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>Not connected</span>
  )
  return (
    <span style={{ background: '#0f2a1a', color: C.green, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
      ✓ Connected{lastSync ? ` · ${lastSync}` : ''}
    </span>
  )
}

// ─── Main Integrations page ───────────────────────────────────────────────────
export default function Integrations({ onBack }) {
  const { connections, setConnection, goBack, classes, curriculumSources, connectedCurricula } = useStore()
  const handleBack = onBack || goBack

  const [syncing,         setSyncing]         = useState({})
  const [showCurriculum,  setShowCurriculum]  = useState(false)
  const [activeCategory,  setActiveCategory]  = useState('all')
  const [syncSuccess,     setSyncSuccess]     = useState({})

  const categories = ['all', 'roster', 'lms', 'lessons']

  const filtered = Object.entries(connections).filter(([, conn]) =>
    activeCategory === 'all' || conn.category === activeCategory
  )

  function handleConnect(key) {
    const conn = connections[key]
    // Open the service URL in new tab for OAuth
    window.open(conn.url, '_blank')
  }

  async function handleMarkConnected(key) {
    setConnection(key, !connections[key].connected)
  }

  async function handleSync(key) {
    setSyncing(s => ({ ...s, [key]: true }))
    // Simulate sync (in production: call real API)
    await new Promise(r => setTimeout(r, 1800))
    setSyncing(s => ({ ...s, [key]: false }))
    setSyncSuccess(s => ({ ...s, [key]: true }))
    setTimeout(() => setSyncSuccess(s => ({ ...s, [key]: false })), 3000)
    setConnection(key, true)
  }

  // Count connected curricula
  const curriculumCount = Object.keys(connectedCurricula).filter(k => connectedCurricula[k]).length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--school-color, #BA0C2F) 0%, rgba(0,0,0,0.85) 100%)', padding: '20px 16px 20px' }}>
        <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>🔗 Integrations</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Connect your tools to sync rosters, grades, and lesson plans</p>
      </div>

      {/* ── Curriculum sync card (special section) ── */}
      <div style={{ margin: '16px 16px 0' }}>
        <button onClick={() => setShowCurriculum(!showCurriculum)}
          style={{ width: '100%', background: C.card, border: `1px solid ${C.teal}30`, borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>📚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.teal, marginBottom: 2 }}>Curriculum Sync</div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {curriculumCount > 0
                ? `${curriculumCount} subject${curriculumCount > 1 ? 's' : ''} linked · AI pulls lessons automatically`
                : 'Link your textbooks · AI auto-pulls lessons for each class'}
            </div>
          </div>
          <span style={{ color: C.muted, fontSize: 20 }}>{showCurriculum ? '▲' : '▼'}</span>
        </button>

        {showCurriculum && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '16px' }}>
            <CurriculumPanel onClose={() => setShowCurriculum(false)} />
          </div>
        )}
      </div>

      {/* ── Category filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, padding: '16px 16px 0', overflowX: 'auto' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              background: activeCategory === cat ? 'var(--school-color, #BA0C2F)' : C.inner,
              color:      activeCategory === cat ? '#fff' : C.muted }}>
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]?.label}
          </button>
        ))}
      </div>

      {/* ── Category description ── */}
      {activeCategory !== 'all' && (
        <div style={{ margin: '10px 16px 0', padding: '10px 14px', background: C.inner, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{CATEGORY_LABELS[activeCategory]?.icon}</span>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{CATEGORY_LABELS[activeCategory]?.desc}</p>
        </div>
      )}

      {/* ── Integration cards ── */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(([key, conn]) => (
          <div key={key} style={{ background: C.card, border: `1px solid ${conn.connected ? C.green + '30' : C.border}`, borderRadius: 16, padding: '14px 16px', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{conn.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 2 }}>{conn.label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{conn.description}</div>
                <SyncBadge connected={conn.connected} lastSync={conn.lastSync} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {/* Connect / Open button */}
              <button onClick={() => handleConnect(key)}
                style={{ flex: 1, background: `${C.blue}18`, color: C.blue, border: 'none', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🔗 Open {conn.label}
              </button>

              {/* Mark connected toggle (demo) */}
              <button onClick={() => handleMarkConnected(key)}
                style={{ flex: 1, background: conn.connected ? `${C.green}18` : `${C.amber}18`, color: conn.connected ? C.green : C.amber, border: 'none', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {conn.connected ? '✓ Connected' : '+ Mark Connected'}
              </button>

              {/* Sync now (if connected) */}
              {conn.connected && (
                <button onClick={() => handleSync(key)} disabled={!!syncing[key]}
                  style={{ flex: 1, background: syncSuccess[key] ? `${C.green}18` : `${C.teal}18`, color: syncSuccess[key] ? C.green : C.teal, border: 'none', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 700, cursor: syncing[key] ? 'wait' : 'pointer' }}>
                  {syncing[key] ? '⟳ Syncing…' : syncSuccess[key] ? '✓ Synced!' : '⟳ Sync Now'}
                </button>
              )}
            </div>

            {/* What syncs */}
            {conn.connected && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: C.inner, borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>What syncs</div>
                <div style={{ fontSize: 11, color: C.text }}>
                  {conn.category === 'roster'  && '👥 Student names · Class lists · Grade passback'}
                  {conn.category === 'lms'     && '📝 Assignments · Submissions · Grade passback · Roster import'}
                  {conn.category === 'lessons' && '📅 Lesson plans · Curriculum maps · Resources'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Info footer ── */}
      <div style={{ margin: '16px 16px 0', padding: '14px', background: C.inner, borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>How sync works:</strong> GradeFlow connects to your existing tools — it doesn't replace them. Grades flow from GradeFlow → your SIS nightly. Rosters are imported once per term. Lesson plans sync on demand. Changes made in the SIS must also be updated here.
        </div>
      </div>
    </div>
  )
}
