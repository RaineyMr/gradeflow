import React, { useState } from 'react'

const C = {
  bg: '#0d1117',
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
  sGrad: 'linear-gradient(135deg, #ea580c 0%, #db2777 100%)',
  ovGrad: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
  lGrad: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)',
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ background: C.sGrad, padding: '14px 18px 18px', position: 'relative' }}>
      {/* Bell + backpack top-right */}
      <div style={{ position: 'absolute', top: 14, right: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔔</div>
          <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700 }}>4</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎒</div>
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Good Morning! 🌟</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Hi, Marcus! 👋</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>3rd Grade · Lincoln Elementary</div>
      <div style={{ fontSize: 9, color: C.hint }}>Hold widget or tap ✏ to customize · Saved to account</div>
    </div>
  )
}

// ── SW1: Daily Overview ───────────────────────────────────────────────────────
function SW1_DailyOverview() {
  const tiles = [
    { icon: '📊', value: '87.4', label: 'GPA' },
    { icon: '📚', value: '4',    label: 'Classes' },
    { icon: '📋', value: '3',    label: 'Assignments' },
    { icon: '🔔', value: '2',    label: 'Updates' },
  ]
  return (
    <div style={{ background: C.ovGrad, borderRadius: 18, padding: '14px 16px 18px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>DAILY OVERVIEW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 13, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SW2: Today's Lessons ──────────────────────────────────────────────────────
function SW2_TodaysLessons() {
  return (
    <div style={{ background: C.lGrad, border: '1px solid #1a3a2a', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TODAY'S LESSONS 📖</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Ch.4 · Fractions &amp; Decimals</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Math · Pages 84–91 · Ms. Johnson · Based on teacher plan</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: 'rgba(59,126,244,0.12)', borderRadius: 9, padding: '4px 12px', fontSize: 10, color: C.blue, fontWeight: 700 }}>
          View Worksheet 📄
        </div>
        <div style={{ fontSize: 9, color: C.teal }}>+3 more today</div>
      </div>
    </div>
  )
}

// ── SW3: My Classes ───────────────────────────────────────────────────────────
function SW3_MyClasses() {
  const classes = [
    { name: 'Math',    teacher: 'Ms. Johnson', gpa: '95.0', gpaColor: '#fff',  gpaSuffix: 'GPA ⭐', suffixColor: C.green, border: C.blue   },
    { name: 'Reading', teacher: 'Ms. Johnson', gpa: '82.0', gpaColor: '#fff',  gpaSuffix: 'GPA',    suffixColor: C.amber, border: C.purple },
    { name: 'Science', teacher: 'Ms. Johnson', gpa: '61.0', gpaColor: '#fff',  gpaSuffix: 'GPA ⚑',  suffixColor: C.red,   border: C.teal   },
    { name: 'Writing', teacher: 'Ms. Johnson', gpa: '88.0', gpaColor: '#fff',  gpaSuffix: 'GPA',    suffixColor: C.green, border: C.pink   },
  ]
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>My Classes</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {classes.map(c => (
          <div key={c.name} style={{ background: C.inner, borderRadius: 14, padding: '10px 12px', borderLeft: `4px solid ${c.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{c.name}</div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>{c.teacher}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.gpaColor }}>{c.gpa}</span>
              <span style={{ fontSize: 9, color: c.suffixColor }}>{c.gpaSuffix}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#3b7494', marginTop: 8 }}>Tap class → see assignments · GPA as number</div>
    </div>
  )
}

// ── SW4: Needs Attention ──────────────────────────────────────────────────────
function SW4_NeedsAttention() {
  return (
    <div style={{ background: C.card, border: 'rgba(240,74,74,0.12) 1px solid', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Needs Attention ⚑</div>
      <div style={{ background: '#1c1012', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: C.red }}>Science below 70% · Study tips available</span>
        <span style={{ fontSize: 9, color: C.blue, cursor: 'pointer' }}>View →</span>
      </div>
    </div>
  )
}

// ── SW5: Messages ─────────────────────────────────────────────────────────────
function SW5_Messages() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Messages 💬</div>
        <div style={{ fontSize: 10, color: C.blue, cursor: 'pointer' }}>+ New</div>
      </div>
      <div style={{ background: C.inner, borderRadius: 12, padding: '10px 12px', marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Ms. Johnson</span>
          <span style={{ fontSize: 9, color: C.blue, cursor: 'pointer' }}>Reply →</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>Don't forget worksheet due Friday!</div>
        <div style={{ fontSize: 10 }}>👍 ❤️ 😂  · reactions on all messages</div>
      </div>
      <div style={{ fontSize: 9, color: C.purple }}>✨ AI polishes reply · you approve</div>
    </div>
  )
}

// ── SW6: Class Feed ───────────────────────────────────────────────────────────
function SW6_ClassFeed() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Class Feed 📢</div>
        <div style={{ fontSize: 10, color: C.blue, cursor: 'pointer' }}>+ Post</div>
      </div>
      <div style={{ background: C.inner, borderRadius: 12, padding: '10px 12px', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>📅 Test Friday — Ch. 4 &amp; 5!</div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>Ms. Johnson · 1hr ago · Read: 18/24</div>
        <div style={{ fontSize: 11 }}>👍 12  ❤️ 5  😂 2  ·  😕 3 confused  ·  ❓ 5 questions</div>
      </div>
      <div style={{ fontSize: 9, color: C.muted }}>Public links need approval · direct msgs unrestricted · 👍 ❤️ 😂 everywhere</div>
    </div>
  )
}

// ── SW7: AI Study Tips ────────────────────────────────────────────────────────
function SW7_AIStudyTips() {
  return (
    <div style={{ background: '#1a1230', border: '1px solid #3b2a5a', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: C.purple, marginBottom: 8 }}>✨ AI STUDY TIPS</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>Science needs your focus! 📚</div>
      <div style={{ fontSize: 10, color: '#b090d0', marginBottom: 6 }}>10 min flashcards tonight · same strategy that boosted Reading +8pts</div>
      <div style={{ fontSize: 9, fontWeight: 600, color: C.purple, cursor: 'pointer' }}>Tap for full personalized study plan →</div>
    </div>
  )
}

// ── SW8: Upload Assignment ────────────────────────────────────────────────────
function SW8_UploadAssignment() {
  return (
    <div style={{ background: C.card, border: '1px solid rgba(34,201,122,0.18)', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Upload Assignment 📤</div>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Photo · File · Link · Note to teacher</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['📷 Photo', C.green], ['📄 File', C.blue], ['🔗 Link', C.purple]].map(([label, color]) => (
          <button key={label} style={{ background: `${color}20`, color, border: 'none', borderRadius: 10, padding: '5px 12px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>
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
    <div style={{ background: '#0d1117', borderTop: `1px solid ${C.inner}`, padding: '6px 8px 16px', position: 'sticky', bottom: 0 }}>
      <div style={{ fontSize: 8, color: C.hint, marginBottom: 4, paddingLeft: 4 }}>✏ EDITABLE NAV</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 2px',
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontSize: 8, color: item.id === active ? '#f97316' : C.muted, fontWeight: item.id === active ? 700 : 400 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.bg, fontFamily: 'Inter, -apple-system, Arial, sans-serif', boxSizing: 'border-box', overflowX: 'hidden', color: C.text, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, padding: '10px 10px 0' }}>
        <SW1_DailyOverview />
        <SW2_TodaysLessons />
        <SW3_MyClasses />
        <SW4_NeedsAttention />
        <SW5_Messages />
        <SW6_ClassFeed />
        <SW7_AIStudyTips />
        <SW8_UploadAssignment />
      </div>
      <BottomNav active={activeNav} onSelect={setActiveNav} />
    </div>
  )
}
