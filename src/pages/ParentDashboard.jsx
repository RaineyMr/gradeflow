import React, { useState } from 'react'

const C = {
  bg: '#0c0e14',
  card: '#161923',
  inner: '#1e2231',
  text: '#eef0f8',
  muted: '#6b7494',
  hint: '#3d4460',
  green: '#22c97a',
  blue: '#3b7ef4',
  purple: '#9b6ef5',
  amber: '#f5a623',
  red: '#f04a4a',
  teal: '#0fb8a0',
  pink: '#f54a7a',
  pGrad: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)',
  ovGrad: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
  lGrad: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)',
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ background: C.pGrad, padding: '14px 18px 18px', position: 'relative' }}>
      {/* Bell */}
      <div style={{ position: 'absolute', top: 14, right: 18 }}>
        <div style={{ position: 'relative', width: 32, height: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔔</div>
          <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700 }}>2</div>
        </div>
      </div>
      {/* Name */}
      <div style={{ fontSize: 19, color: '#fff', fontWeight: 800, marginBottom: 4 }}>Ms. Thompson 👋</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Viewing: Marcus · 3rd Grade · Lincoln Elementary</div>
      <div style={{ fontSize: 9, color: C.hint }}>Same order as student · Hold to customize · Saved to account</div>
    </div>
  )
}

// ── PW1: Daily Overview ───────────────────────────────────────────────────────
function PW1_DailyOverview() {
  const tiles = [
    { icon: '📊', value: '87.4', label: 'GPA' },
    { icon: '📚', value: '4',    label: 'Classes' },
    { icon: '⚑',  value: '1',    label: 'Attention' },
    { icon: '🔔', value: '2',    label: 'Updates' },
  ]
  return (
    <div style={{ background: C.ovGrad, borderRadius: 18, padding: '14px 16px 18px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>MARCUS'S DAILY OVERVIEW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 13, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PW2: Today's Lessons ──────────────────────────────────────────────────────
function PW2_TodaysLessons() {
  return (
    <div style={{ background: C.lGrad, border: '1px solid #1a3a2a', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TODAY'S LESSONS 📖</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Ch.4 · Fractions &amp; Decimals · Math</div>
      <div style={{ fontSize: 10, color: C.muted }}>Pages 84–91 · Ms. Johnson · Parent view of Marcus's lessons</div>
    </div>
  )
}

// ── PW3: Marcus's Classes ─────────────────────────────────────────────────────
function PW3_MarcusClasses() {
  const classes = [
    { name: 'Math',    gpa: '95.0', gpaCo: C.text },
    { name: 'Reading', gpa: '82.0', gpaCo: C.text },
    { name: 'Science', gpa: '61.0', gpaCo: C.red  },
    { name: 'Writing', gpa: '88.0', gpaCo: C.text },
  ]
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Marcus's Classes</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {classes.map(c => (
          <div key={c.name} style={{ background: C.inner, borderRadius: 12, padding: '10px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: c.gpaCo }}>{c.gpa}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PW4: Needs Attention ──────────────────────────────────────────────────────
function PW4_NeedsAttention() {
  return (
    <div style={{ background: C.card, border: '1px solid rgba(240,74,74,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Needs Attention ⚑</div>
      <div style={{ fontSize: 10, color: C.red }}>Science 61% · Study tips available for Marcus</div>
    </div>
  )
}

// ── PW5: Messages (with Student/Private toggle) ───────────────────────────────
function PW5_Messages() {
  const [mode, setMode] = useState('student')

  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Messages 💬</div>

      {/* Toggle */}
      <div style={{ background: '#1a1d2e', borderRadius: 15, padding: 3, display: 'flex', marginBottom: 10 }}>
        <button onClick={() => setMode('student')} style={{
          flex: 1, padding: '7px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 10,
          background: mode === 'student' ? C.pGrad : 'transparent',
          color: mode === 'student' ? '#fff' : C.muted,
        }}>👁 Student View</button>
        <button onClick={() => setMode('private')} style={{
          flex: 1, padding: '7px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 10,
          background: mode === 'private' ? 'linear-gradient(135deg,#7c1d1d,#1d2040)' : 'transparent',
          color: mode === 'private' ? C.red : C.muted,
        }}>🔒 Private w/ Teacher</button>
      </div>

      {/* Private indicator */}
      <div style={{ background: '#1a0a0a', border: '1px solid rgba(240,74,74,0.3)', borderRadius: 9, padding: '5px 12px', marginBottom: 8, textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: C.red, fontWeight: 700 }}>🔒 PRIVATE — Only you and Ms. Johnson see these</span>
      </div>

      {/* Message row */}
      <div style={{ background: '#120808', border: '1px solid rgba(240,74,74,0.18)', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ fontSize: 10, color: '#c0c8e0', marginBottom: 4 }}>Hi Ms. Thompson, Marcus is struggling with fractions...</div>
        <div style={{ fontSize: 9, textAlign: 'right' }}>👍 ❤️ 😂</div>
      </div>

      {mode === 'private' && (
        <input
          style={{ width: '100%', background: C.inner, border: `1px solid #2a2f42`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 12, boxSizing: 'border-box', outline: 'none', marginTop: 8 }}
          placeholder="Message Ms. Johnson privately..."
        />
      )}
    </div>
  )
}

// ── PW6: Class Feed ───────────────────────────────────────────────────────────
function PW6_ClassFeed() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 14, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Class Feed 📢</div>
      <div style={{ fontSize: 10, color: C.muted }}>📅 Test Friday! · 👍 12 ❤️ 5 😂 2 · Parent can react + respond</div>
    </div>
  )
}

// ── PW7: AI Tips for Marcus ───────────────────────────────────────────────────
function PW7_AITips() {
  return (
    <div style={{ background: '#1a1230', border: '1px solid #3b2a5a', borderRadius: 14, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 4 }}>✨ AI Tips for Marcus</div>
      <div style={{ fontSize: 10, color: '#b090d0' }}>Science needs focus · 10 min flashcards tonight recommended</div>
    </div>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'home',     icon: '⊞', label: 'Home' },
    { id: 'grades',   icon: '📚', label: 'Grades' },
    { id: 'feed',     icon: '📢', label: 'Feed' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
  ]
  return (
    <div style={{ background: '#0a0c12', borderTop: `1px solid ${C.inner}`, padding: '6px 8px 16px', position: 'sticky', bottom: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 2px',
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontSize: 8, color: item.id === active ? C.teal : C.muted, fontWeight: item.id === active ? 700 : 400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.bg, fontFamily: 'Inter, -apple-system, Arial, sans-serif', boxSizing: 'border-box', overflowX: 'hidden', color: C.text, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, padding: '10px 10px 0' }}>
        <PW1_DailyOverview />
        <PW2_TodaysLessons />
        <PW3_MarcusClasses />
        <PW4_NeedsAttention />
        <PW5_Messages />
        <PW6_ClassFeed />
        <PW7_AITips />
      </div>
      <BottomNav active={activeNav} onSelect={setActiveNav} />
    </div>
  )
}
