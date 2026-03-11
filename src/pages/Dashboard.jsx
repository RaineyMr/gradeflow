import React, { useState, useEffect } from 'react'
import { useStore } from '../lib/store'

// Inject mobile viewport meta if not already present
if (typeof document !== 'undefined') {
  let vp = document.querySelector('meta[name="viewport"]')
  if (!vp) {
    vp = document.createElement('meta')
    vp.name = 'viewport'
    document.head.appendChild(vp)
  }
  vp.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

const C = {
  bg: '#060810',
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
  tGrad: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)',
  ovGrad: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
  lGrad: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)',
  eGrad: 'linear-gradient(135deg, #78350f 0%, #1e3a5f 100%)',
}

function PhoneShell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      background: C.bg,
      fontFamily: 'Inter, -apple-system, Arial, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      {children}
    </div>
  )
}

function Header() {
  return (
    <div style={{ background: C.tGrad, padding: '12px 18px 18px', position: 'relative' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: '#8899cc' }}>9:41</span>
        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161923', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔔</div>
          <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700 }}>3</div>
        </div>
      </div>
      {/* School pill */}
      <div style={{ display: 'inline-flex', alignItems: 'center', background: '#1a3a6a', borderRadius: 9, padding: '3px 10px', fontSize: 9, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
        🦅 Lincoln Elementary
      </div>
      {/* Greeting + Camera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 19, color: C.text, fontWeight: 700 }}>Ms. Johnson 👋</div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.tGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📷</div>
      </div>
      {/* Hint */}
      <div style={{ fontSize: 9, color: C.hint, marginTop: 6 }}>Hold widget or tap ✏ to customize · Drag to rearrange · Pinch to resize · Saved to account</div>
    </div>
  )
}

function W1_DailyOverview() {
  const tiles = [
    { icon: '💬', value: 3, label: 'Pending Msgs' },
    { icon: '⚑', value: 5, label: 'Need Attention' },
    { icon: '📚', value: 4, label: 'Classes' },
    { icon: '🔔', value: 2, label: 'Reminders' },
  ]
  return (
    <div style={{ background: C.ovGrad, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>DAILY OVERVIEW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.11)', borderRadius: 13, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function W2_TodaysLessons() {
  const [done, setDone] = useState(false)
  return (
    <div style={{ background: C.lGrad, border: '1px solid #1a3a2a', borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TODAY'S LESSONS</div>
      {/* Period pill */}
      <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(15,184,160,0.12)', borderRadius: 9, padding: '3px 10px', fontSize: 10, color: C.teal, fontWeight: 700, marginBottom: 8 }}>
        3rd Period · Math
      </div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 4 }}>Ch.4 · Fractions &amp; Decimals</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Pages 84–91 · 45 min · Tap to expand</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setDone(true)} style={{ background: 'rgba(34,201,122,0.13)', color: C.green, border: 'none', borderRadius: 9, padding: '5px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>✓ Done</button>
        <button style={{ background: 'rgba(245,166,35,0.13)', color: C.amber, border: 'none', borderRadius: 9, padding: '5px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>TBC</button>
        <span style={{ fontSize: 9, color: '#3b7494', marginLeft: 'auto' }}>→ cycles to next period on Done/TBC</span>
      </div>
    </div>
  )
}

function W3_MyClasses() {
  const classes = [
    { period: '3rd', subject: 'Math', students: 24, periodLabel: '1st Period', gpa: 87.4, trend: '↑', trendColor: C.green, attention: 3, attColor: C.red, color: C.blue },
    { period: '5th', subject: 'Reading', students: 21, periodLabel: '5th Period', gpa: 91.2, trend: '↑', trendColor: C.green, attention: 1, attColor: C.muted, color: C.purple },
    { period: '2nd', subject: 'Science', students: 26, periodLabel: '2nd Period', gpa: 63.8, trend: '↓', trendColor: C.red, attention: 8, attColor: C.red, color: C.teal },
    { period: '4th', subject: 'Writing', students: 18, periodLabel: '4th Period', gpa: 84.0, trend: '→', trendColor: C.green, attention: 0, attColor: C.muted, color: C.pink },
  ]
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>My Classes</div>
        <div style={{ fontSize: 11, color: C.blue, cursor: 'pointer' }}>+ Add</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {classes.map(c => (
          <div key={c.period + c.subject} style={{ background: C.inner, borderRadius: 14, padding: '10px 12px', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{c.period} · {c.subject}</div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>{c.students} students · {c.periodLabel}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, color: c.gpa < 70 ? C.red : '#fff', fontWeight: 800 }}>{c.gpa}</span>
              <span style={{ fontSize: 10, color: c.trendColor }}>GPA {c.trend}</span>
            </div>
            <div style={{ fontSize: 9, color: c.attColor, marginTop: 2 }}>⚑ {c.attention > 0 ? `${c.attention} need attention` : '0'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function W4_NeedsAttention() {
  return (
    <div style={{ background: C.card, border: `1px solid rgba(240,74,74,0.12)`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>Needs Attention ⚑</div>
        <div style={{ background: 'rgba(240,74,74,0.1)', borderRadius: 10, padding: '3px 10px', fontSize: 9, color: C.red, fontWeight: 700 }}>5 students</div>
      </div>
      <div style={{ background: '#1c1012', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>Marcus T. · Math 58% Failed · Sofia D. dropped 11pts</div>
        <div style={{ fontSize: 10, color: C.red, marginTop: 4 }}>+ 3 more · Tap to view all · Message individually or as group</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ background: 'rgba(92,110,245,0.12)', color: '#5c6ef5', border: 'none', borderRadius: 11, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>📩 Message all</button>
      </div>
    </div>
  )
}

function W5_ParentMessages() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>Parent Messages</div>
        <div style={{ fontSize: 10, color: C.blue, cursor: 'pointer' }}>See all →</div>
      </div>
      {/* Row 1 – concern */}
      <div style={{ background: '#1c1012', borderRadius: 12, padding: '10px 12px', marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>⚑ Marcus T. · Math · Failed 58% · Pending</div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>AI drafted · Warm &amp; Friendly · English · 👍 ❤️ 😂</div>
      </div>
      {/* Row 2 – positive */}
      <div style={{ background: '#0f1c12', borderRadius: 12, padding: '10px 12px' }}>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>🌟 Aaliyah B. · Reading · Improved +12pts · Sent ✓</div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>Auto-sent · Celebrating progress · 👍 ❤️ 😂</div>
      </div>
      <div style={{ fontSize: 9, color: '#3b7494', marginTop: 8 }}>Every negative trigger has a positive version · AI writes both</div>
    </div>
  )
}

function W6_Reports() {
  return (
    <div style={{ background: C.card, border: `1px solid rgba(34,201,122,0.12)`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>Reports 📊</div>
        <div style={{ fontSize: 10, color: C.blue, cursor: 'pointer' }}>See all →</div>
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Class Mastery · Student Report · Grade Distribution · Needs Attention · Comm. Log · Progress</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'rgba(34,201,122,0.12)', color: C.green, border: 'none', borderRadius: 10, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>🖨 Print</button>
        <button style={{ background: 'rgba(59,126,244,0.12)', color: C.blue, border: 'none', borderRadius: 10, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>⬇ PDF</button>
        <button style={{ background: 'rgba(155,110,245,0.12)', color: C.purple, border: 'none', borderRadius: 10, padding: '5px 14px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>📋 Spreadsheet</button>
      </div>
    </div>
  )
}

function W7_Grading() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 6 }}>Grading</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, paddingRight: 60 }}>Tap 📷 · Synced: PowerSchool ✓ · Last: Today 8:42am · 24 grades</div>
      <div style={{ fontSize: 9, color: C.green, fontWeight: 600 }}>Weights: Test 40% · Quiz 30% · Other 20% · Part. 10% · Edit in Settings</div>
      {/* Camera circle */}
      <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: C.tGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
    </div>
  )
}

function EditModeBanner() {
  return (
    <div style={{ background: C.eGrad, border: '1px solid rgba(245,166,35,0.25)', borderRadius: 16, padding: '12px 16px', marginBottom: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#fff', fontWeight: 700, marginBottom: 4 }}>✏ Hold any widget → Edit Mode</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Drag to rearrange · Pinch to resize · + to add · All widgets available</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Saved to your account · Same layout on all devices</div>
    </div>
  )
}

function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'home', icon: '⊞', label: 'Home' },
    { id: 'grades', icon: '📋', label: 'Grades' },
    { id: 'scan', icon: '📷', label: 'Scan' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ]
  return (
    <div style={{ background: '#0a0c12', borderTop: `1px solid ${C.inner}`, padding: '6px 8px 16px', position: 'sticky', bottom: 0 }}>
      <div style={{ fontSize: 8, color: C.hint, marginBottom: 4, paddingLeft: 4 }}>✏ EDITABLE NAV — hold icon or tap + to swap</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 2px',
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontSize: 8, color: item.id === active ? C.blue : C.muted, fontWeight: item.id === active ? 700 : 400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <PhoneShell>
      <div style={{ background: C.bg, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, padding: '12px 10px 0' }}>
          <W1_DailyOverview />
          <W2_TodaysLessons />
          <W3_MyClasses />
          <W4_NeedsAttention />
          <W5_ParentMessages />
          <W6_Reports />
          <W7_Grading />
          <EditModeBanner />
        </div>
        <BottomNav active={activeNav} onSelect={setActiveNav} />
      </div>
    </PhoneShell>
  )
}
