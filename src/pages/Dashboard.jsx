import React, { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBadge, TrendBadge } from '../components/ui'
import Gradebook from './Gradebook'
import LessonPlan from './LessonPlan'
import ParentMessages from './ParentMessages'
import Reports from './Reports'
import TestingSuite from './TestingSuite'
import ClassFeed from './ClassFeed'
import StudentProfile from './StudentProfile'

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  bg: '#060810', card: '#161923', inner: '#1e2231',
  text: '#eef0f8', muted: '#6b7494', hint: '#3d4460',
  green: '#22c97a', blue: '#3b7ef4', purple: '#9b6ef5',
  amber: '#f5a623', red: '#f04a4a', teal: '#0fb8a0',
}

// ─── Scroll helper ────────────────────────────────────────────────────────────
function scrollTop() { window.scrollTo(0, 0) }

// ─── Widget shell: clicking body navigates, clicking button runs action ───────
function Widget({ onClick, style, children, title, titleRight, color }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20,
        padding: '14px 16px', margin: '0 10px 12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s',
        ...(color ? { borderLeft: `3px solid ${color}` } : {}),
        ...style,
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'scale(1.005)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {(title || titleRight) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {title && <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</span>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Action button inside widget (stops propagation) ─────────────────────────
function ActionBtn({ label, color = C.blue, onClick, style }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.() }}
      style={{
        background: `${color}22`, color, border: 'none', borderRadius: 999,
        padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
        ...style,
      }}
    >
      {label}
    </button>
  )
}

// ─── Sub-page wrapper (full screen inside dashboard) ─────────────────────────
function SubPage({ children }) {
  useEffect(() => { scrollTop() }, [])
  return <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 80 }}>{children}</div>
}

// ─── Reminders page ───────────────────────────────────────────────────────────
function RemindersPage({ onBack }) {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const [text, setText] = useState('')

  function handleAdd() {
    if (!text.trim()) return
    addReminder(text.trim())
    setText('')
  }

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>🔔 Reminders</h1>
      </div>
      <div style={{ margin: '0 10px 16px', display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, background: C.inner, border: '1px solid #2a2f42', borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none' }}
          placeholder="Add a reminder..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} style={{ background: 'var(--school-color)', border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add</button>
      </div>
      {reminders.map(r => (
        <div key={r.id} style={{ margin: '0 10px 8px', background: C.card, border: `1px solid ${C.inner}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => toggleReminder(r.id)} style={{ background: r.done ? '#22c97a22' : C.inner, border: `1px solid ${r.done ? C.green : '#2a2f42'}`, borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green, fontSize: 12 }}>
            {r.done ? '✓' : ''}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: r.done ? C.muted : C.text, textDecoration: r.done ? 'line-through' : 'none' }}>{r.text}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{r.due}</div>
          </div>
          <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16 }}>×</button>
        </div>
      ))}
      {reminders.length === 0 && <p style={{ textAlign: 'center', color: C.muted, marginTop: 40 }}>No reminders yet.</p>}
    </SubPage>
  )
}

// ─── Needs Attention page ─────────────────────────────────────────────────────
function NeedsAttentionPage({ onBack }) {
  const { getNeedsAttention, setActiveStudent, setScreen } = useStore()
  const students = getNeedsAttention()

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>⚑ Needs Attention</h1>
      </div>
      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ color: C.muted }}>All students on track!</p>
        </div>
      ) : students.map(s => (
        <div key={s.id} onClick={() => { setActiveStudent(s); setScreen('studentProfile') }}
          style={{ margin: '0 10px 10px', background: '#1c1012', border: '1px solid #f04a4a20', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: C.red }}>
              {s.grade < 70 ? `${s.grade}% — below passing` : s.submitUngraded ? 'Submitted — ungraded' : 'Flagged for review'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <ActionBtn label="📩 Message Parent" color={C.purple} onClick={() => {}} />
              <ActionBtn label="✏ View Profile"   color={C.blue}   onClick={() => { setActiveStudent(s); setScreen('studentProfile') }} />
            </div>
          </div>
          <GradeBadge score={s.grade} />
        </div>
      ))}
    </SubPage>
  )
}

// ─── Classes overview page ────────────────────────────────────────────────────
function ClassesPage({ onBack, navigate }) {
  const { classes, setActiveClass } = useStore()
  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>📚 My Classes</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 10px' }}>
        {classes.map(cls => (
          <button key={cls.id} onClick={() => { setActiveClass(cls); navigate('gradebook') }}
            style={{ background: C.card, border: `1px solid ${C.inner}`, borderLeft: `3px solid ${cls.color}`, borderRadius: 14, padding: 14, textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{cls.period} · {cls.subject}</div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{cls.students} students</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{cls.gpa}</span>
              <TrendBadge trend={cls.trend} />
            </div>
            {cls.needsAttention > 0 && <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>⚑ {cls.needsAttention} need attention</div>}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'dashboard',     icon: '🏠',  label: 'Home'     },
    { id: 'gradebook',     icon: '📚',  label: 'Grades'   },
    { id: 'camera',        icon: '📷',  label: 'Scan'     },
    { id: 'parentMessages',icon: '💬',  label: 'Messages' },
    { id: 'settings',      icon: '⚙',   label: 'Settings' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,12,18,0.97)', borderTop: `1px solid ${C.inner}`,
      padding: '6px 0 max(16px, env(safe-area-inset-bottom))',
      display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`,
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 2px' }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ fontSize: 9, color: item.id === active ? 'var(--school-color)' : C.muted, fontWeight: item.id === active ? 700 : 400 }}>{item.label}</span>
          {item.id === active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--school-color)' }} />}
        </button>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ currentUser, onCameraClick }) {
  const store = useStore()
  const { classes, students, messages, reminders, lessons, teacher, getNeedsAttention, activeScreen, activeStudent } = store

  const [subPage, setSubPage] = useState(null)  // null | 'reminders' | 'attention' | 'classes' | screen name
  const [activeNav, setActiveNav] = useState('dashboard')
  const [lessonIdx, setLessonIdx] = useState(0)

  const lesson = lessons[lessonIdx] || lessons[0]
  const pending = messages.filter(m => m.status === 'pending')
  const atRisk  = getNeedsAttention()

  // Handle store-driven navigation (from sub-pages like NeedsAttention)
  useEffect(() => {
    if (activeScreen === 'studentProfile') setSubPage('studentProfile')
  }, [activeScreen])

  function goHome() { setSubPage(null); setActiveNav('dashboard'); store.setScreen('dashboard') }

  function navSelect(id) {
    setActiveNav(id)
    if (id === 'camera') { onCameraClick?.(); return }
    if (id === 'dashboard') { goHome(); return }
    setSubPage(id)
  }

  // ── Sub-page routing ─────────────────────────────────────────────────────────
  if (subPage === 'gradebook')      return <><SubPage><Gradebook onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'parentMessages') return <><SubPage><ParentMessages onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'lessonPlan')     return <><SubPage><LessonPlan onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'reports')        return <><SubPage><Reports onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'testingSuite')   return <><SubPage><TestingSuite onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'classFeed')      return <><SubPage><ClassFeed onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'studentProfile') return <><SubPage><StudentProfile onBack={goHome} /></SubPage><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'reminders')      return <><RemindersPage onBack={goHome} /><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'attention')      return <><NeedsAttentionPage onBack={goHome} /><BottomNav active={activeNav} onSelect={navSelect} /></>
  if (subPage === 'classes')        return <><ClassesPage onBack={goHome} navigate={setSubPage} /><BottomNav active={activeNav} onSelect={navSelect} /></>

  // ── Home feed ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, Arial, sans-serif', paddingBottom: 80 }}>

      {/* Greeting */}
      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 2px' }}>Good morning, {teacher.name} 👋</h1>
        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* W1: Daily Overview */}
      <Widget onClick={() => {}} style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)', border: 'none' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>DAILY OVERVIEW</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
          {[
            { icon: '💬', val: pending.length, label: 'Pending Msgs', page: 'parentMessages' },
            { icon: '⚑',  val: atRisk.length,  label: 'Need Attention', page: 'attention' },
            { icon: '📚', val: classes.length, label: 'Classes',       page: 'classes' },
            { icon: '🔔', val: reminders.filter(r => !r.done).length, label: 'Reminders', page: 'reminders' },
            { icon: '📋', val: store.assignments?.length || 0, label: 'Assignments', page: 'gradebook' },
          ].map(tile => (
            <button key={tile.label} onClick={e => { e.stopPropagation(); setSubPage(tile.page) }}
              style={{ background: 'rgba(255,255,255,0.11)', borderRadius: 13, padding: '10px 4px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 16 }}>{tile.icon}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{tile.val}</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Today's Lessons */}
      <Widget onClick={() => setSubPage('lessonPlan')} style={{ background: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)', border: '1px solid #1a3a2a' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TODAY'S LESSONS</div>
        <div style={{ display: 'inline-block', background: 'rgba(15,184,160,0.2)', borderRadius: 999, padding: '3px 10px', fontSize: 10, color: C.teal, fontWeight: 700, marginBottom: 8 }}>
          {lesson?.classLabel}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{lesson?.title}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Pages {lesson?.pages} · {lesson?.duration}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn label="← Prev"   color={C.amber} onClick={() => setLessonIdx(i => Math.max(0, i-1))} />
          <ActionBtn label="Next →"   color={C.green} onClick={() => setLessonIdx(i => Math.min(lessons.length-1, i+1))} />
          <ActionBtn label="Full Plan" color={C.teal}  onClick={() => setSubPage('lessonPlan')} />
        </div>
      </Widget>

      {/* W3: My Classes */}
      <Widget onClick={() => setSubPage('classes')} title="My Classes"
        titleRight={<ActionBtn label="+ Add" color={C.blue} onClick={() => setSubPage('gradebook')} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {classes.map(cls => (
            <button key={cls.id} onClick={e => { e.stopPropagation(); store.setActiveClass(cls); setSubPage('gradebook') }}
              style={{ background: C.inner, borderRadius: 14, padding: '12px 14px', border: 'none', borderLeft: `3px solid ${cls.color}`, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{cls.period} · {cls.subject}</div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{cls.students} students</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{cls.gpa}</span>
                <TrendBadge trend={cls.trend} />
              </div>
              {cls.needsAttention > 0 && <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>⚑ {cls.needsAttention} need attention</div>}
            </button>
          ))}
        </div>
      </Widget>

      {/* W4: Needs Attention */}
      <Widget onClick={() => setSubPage('attention')} style={{ border: '1px solid rgba(240,74,74,0.2)' }}
        title="Needs Attention ⚑"
        titleRight={<span style={{ background: '#f04a4a18', color: C.red, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{atRisk.length} students</span>}>
        <div style={{ background: '#1c1012', borderRadius: 12, padding: '10px 12px', marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>
            {atRisk.slice(0,2).map(s => s.name.split(' ')[0]).join(' · ')} {atRisk.length > 2 ? `+ ${atRisk.length-2} more` : ''}
          </div>
          <div style={{ fontSize: 10, color: C.red, marginTop: 4 }}>Tap to view all · Message individually or as group</div>
        </div>
        <ActionBtn label="📩 Message All" color={C.purple} onClick={() => setSubPage('parentMessages')} />
      </Widget>

      {/* W5: Parent Messages */}
      <Widget onClick={() => setSubPage('parentMessages')} title="Parent Messages"
        titleRight={<ActionBtn label="See all →" color={C.blue} onClick={() => setSubPage('parentMessages')} />}>
        {pending.slice(0,2).map(m => (
          <div key={m.id} style={{ background: '#1c1012', borderRadius: 12, padding: '10px 12px', marginBottom: 8, border: '1px solid rgba(240,74,74,0.1)' }}>
            <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>⚑ {m.studentName} · {m.subject} · {m.trigger}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>AI drafted · {m.tone}</div>
          </div>
        ))}
        {pending.length === 0 && <p style={{ fontSize: 12, color: C.muted }}>No pending messages.</p>}
      </Widget>

      {/* W6: Reports */}
      <Widget onClick={() => setSubPage('reports')} title="Reports 📊"
        titleRight={<ActionBtn label="See all →" color={C.blue} onClick={() => setSubPage('reports')} />}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Class Mastery · Student Report · Grade Distribution · Needs Attention · Comm. Log · Progress</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionBtn label="🖨 Print"       color={C.green}  onClick={() => window.print()} />
          <ActionBtn label="⬇ PDF"         color={C.blue}   onClick={() => window.print()} />
          <ActionBtn label="📋 Spreadsheet" color={C.purple} onClick={() => alert('Spreadsheet export coming soon')} />
        </div>
      </Widget>

      {/* W7: Grading */}
      <Widget onClick={() => onCameraClick?.()} title="Grading 📷"
        style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Tap 📷 to scan · Synced: PowerSchool ✓</div>
          <div style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>Weights: Test 40% · Quiz 30% · HW 20% · Part. 10%</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onCameraClick?.() }}
          style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #4c1d95)', border: 'none', cursor: 'pointer', fontSize: 24, flexShrink: 0 }}>
          📷
        </button>
      </Widget>

      {/* W8: Class Feed */}
      <Widget onClick={() => setSubPage('classFeed')} title="Class Feed 📢"
        titleRight={<ActionBtn label="+ Post" color={C.teal} onClick={() => setSubPage('classFeed')} />}>
        {store.feed?.slice(0,1).map(f => (
          <div key={f.id} style={{ background: C.inner, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{f.content.substring(0,60)}...</div>
            <div style={{ fontSize: 10, color: C.muted }}>{f.time}</div>
          </div>
        ))}
      </Widget>

      <BottomNav active={activeNav} onSelect={navSelect} />
    </div>
  )
}
