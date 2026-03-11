import React, { useState } from 'react'

const C = {
  bg:     '#060810',
  card:   '#161923',
  inner:  '#1e2231',
  text:   '#eef0f8',
  muted:  '#6b7494',
  hint:   '#3d4460',
  blue:   '#3b7ef4',
  green:  '#22c97a',
  red:    '#f04a4a',
  purple: '#9b6ef5',
  amber:  '#f5a623',
  teal:   '#0fb8a0',
  ovGrad: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
}

// ── Collapsible Widget Wrapper ────────────────────────────────────────────────
function Widget({ title, borderColor, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${borderColor || C.inner}`,
      borderRadius: 18,
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '13px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</span>
        <span style={{
          fontSize: 9, color: C.muted,
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>
      {open && <div style={{ padding: '0 16px 14px' }}>{children}</div>}
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ background: C.ovGrad, padding: '18px 16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Admin Dashboard</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Principal Carter 🏫</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Lamar High School · Manage teachers + parents</div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</div>
          <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>5</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Hold widget to customize · Saved to account</div>
    </div>
  )
}

// ── AW1: School Overview (gradient tile — always open) ────────────────────────
function AW1_SchoolOverview() {
  const tiles = [
    { icon: '👩‍🏫', value: '24',   label: 'Teachers' },
    { icon: '🎒',  value: '612',  label: 'Students' },
    { icon: '📊',  value: '78.4', label: 'School GPA' },
    { icon: '⚑',   value: '42',   label: 'Need Attn' },
    { icon: '💬',  value: '18',   label: 'Msgs' },
  ]
  return (
    <div style={{ background: C.ovGrad, borderRadius: 18, padding: '14px 16px 18px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>SCHOOL OVERVIEW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 13, padding: '10px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AW2: School-wide Analytics ────────────────────────────────────────────────
function AW2_Analytics() {
  const subjects = [
    { name: 'Math',    score: 77.8, pct: 78, color: C.blue  },
    { name: 'Reading', score: 86.4, pct: 86, color: C.green },
    { name: 'Science', score: 60.0, pct: 60, color: C.red   },
  ]
  return (
    <Widget title="School-wide Analytics">
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 14 }}>No individual grades · Class-level and school-level only</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {subjects.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 52, fontSize: 10, color: C.muted, flexShrink: 0 }}>{s.name}</div>
            <div style={{ flex: 1, height: 12, background: C.inner, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 6 }} />
            </div>
            <div style={{ width: 36, fontSize: 10, fontWeight: 700, color: s.color, textAlign: 'right', flexShrink: 0 }}>{s.score}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: C.red, marginTop: 10 }}>⚑ Science needs school-wide attention</div>
    </Widget>
  )
}

// ── AW3: Teachers — Low Class GPA ─────────────────────────────────────────────
function AW3_TeachersLowGPA() {
  const flagged = [
    { name: 'Mr. Rivera', subject: 'Science · 3rd Period', gpa: '64.2 ↓', gpaColor: C.red,   avg: '(school avg 81.0)', border: 'rgba(240,74,74,0.12)' },
    { name: 'Ms. Patel',  subject: 'Writing · 5th Period', gpa: '71.8 ↓', gpaColor: C.amber, avg: '(school avg 81.0)', border: 'rgba(245,166,35,0.12)' },
  ]
  return (
    <Widget title="⚑ Teachers — Low Class GPA" borderColor="rgba(240,74,74,0.2)">
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 12 }}>Classes below school GPA threshold · Tap row to message</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {flagged.map(t => (
          <div key={t.name} style={{ background: C.inner, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{t.name}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{t.subject}</span>
              </div>
              <div style={{ fontSize: 9, color: t.gpaColor }}>Class GPA: {t.gpa}  {t.avg}</div>
            </div>
            <button style={{ background: 'rgba(59,126,244,0.12)', color: C.blue, border: 'none', borderRadius: 9, padding: '5px 12px', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📩 Message
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: C.muted, marginTop: 10 }}>2 of 24 teachers flagged · Admin sees class-level data only, never individual grades</div>
    </Widget>
  )
}

// ── AW4: School Reports ───────────────────────────────────────────────────────
function AW4_SchoolReports() {
  const filters = [
    { label: '📊 GPA by Subject',   color: C.green  },
    { label: '📈 Progress Trends',  color: C.blue   },
    { label: '⚑ Needs Attention',   color: C.red    },
    { label: '💬 Comm. Summary',    color: C.purple },
  ]
  return (
    <Widget title="School Reports 📊" borderColor="rgba(34,201,122,0.12)">
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 12 }}>School-level only · No individual student data · Filter by grade level / subject</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {filters.map(f => (
          <button key={f.label} style={{ background: `${f.color}20`, color: f.color, border: 'none', borderRadius: 10, padding: '5px 10px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'rgba(59,126,244,0.12)', color: C.blue, border: 'none', borderRadius: 9, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>🖨 Print</button>
        <button style={{ background: 'rgba(34,201,122,0.12)', color: C.green, border: 'none', borderRadius: 9, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>⬇ PDF</button>
      </div>
    </Widget>
  )
}

// ── AW5: Communication Hub ────────────────────────────────────────────────────
function AW5_CommHub() {
  const actions = [
    { label: '📩 Message All Teachers',  color: C.blue   },
    { label: '📩 Message All Parents',   color: C.purple },
    { label: '📢 School Announcement',   color: C.green  },
  ]
  return (
    <Widget title="Communication Hub 💬">
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 12 }}>Message all teachers · Message all parents · School-wide announcements</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map(a => (
          <button key={a.label} style={{ background: `${a.color}20`, color: a.color, border: 'none', borderRadius: 11, padding: '10px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
            {a.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 9, color: C.muted, marginTop: 10 }}>Admin sees class-level data only · No individual student grades ever</div>
    </Widget>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'home',     icon: '🏠',  label: 'Home' },
    { id: 'teachers', icon: '👩‍🏫', label: 'Teachers' },
    { id: 'reports',  icon: '📊',  label: 'Reports' },
    { id: 'messages', icon: '💬',  label: 'Messages' },
    { id: 'settings', icon: '⚙',  label: 'Settings' },
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
            <span style={{ fontSize: 8, color: item.id === active ? C.teal : C.muted, fontWeight: item.id === active ? 700 : 400 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.bg, fontFamily: 'Inter, -apple-system, Arial, sans-serif', boxSizing: 'border-box', overflowX: 'hidden', color: C.text, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, padding: '10px 10px 0' }}>
        <AW1_SchoolOverview />
        <AW2_Analytics />
        <AW3_TeachersLowGPA />
        <AW4_SchoolReports />
        <AW5_CommHub />
      </div>
      <BottomNav active={activeNav} onSelect={setActiveNav} />
    </div>
  )
}
