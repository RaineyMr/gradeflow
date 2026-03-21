import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/store'
import Gradebook      from './Gradebook'
import LessonPlan     from './LessonPlan'
import Reports        from './Reports'
import TestingSuite   from './TestingSuite'
import ClassFeed      from './ClassFeed'
import StudentProfile from './StudentProfile'
import ParentMessages from './ParentMessages'
import Camera         from './Camera'
import Integrations   from './Integrations'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     '#060810',
  card:   '#111520',
  inner:  '#1a1f2e',
  raised: '#1e2436',
  text:   '#eef0f8',
  soft:   '#c8cce0',
  muted:  '#6b7494',
  border: '#252b3d',
  green:  '#22c97a',
  blue:   '#3b7ef4',
  red:    '#f04a4a',
  amber:  '#f5a623',
  teal:   '#0fb8a0',
  purple: '#9b6ef5',
}

// School-specific palette — injected as CSS vars on mount
const SCHOOL_THEMES = {
  kipp:     { primary: '#BA0C2F', secondary: '#000000', surface: '#1a0008', text: '#ffe8ed' },
  hisd:     { primary: '#003057', secondary: '#B3A369', surface: '#000d1a', text: '#e8f0ff' },
  bellaire: { primary: '#B3A369', secondary: '#003057', surface: '#1a1800', text: '#faf7ee' },
  lamar:    { primary: '#461D7C', secondary: '#FDD023', surface: '#0e0718', text: '#f3e8ff' },
}

function applyTheme(key) {
  const t = SCHOOL_THEMES[key] || SCHOOL_THEMES.kipp
  const r = document.documentElement
  r.style.setProperty('--school-color',     t.primary)
  r.style.setProperty('--school-secondary', t.secondary)
  r.style.setProperty('--school-surface',   t.surface)
  r.style.setProperty('--school-text',      t.text)
}

const scrollTop = () => {
  window.scrollTo(0, 0)
  document.querySelector('[data-app-scroll]')?.scrollTo(0, 0)
}

// ─── Tiny helpers ───────────────────────────────────────────────────────────────
function TrendBadge({ trend }) {
  const map = { up: ['↑', C.green], down: ['↓', C.red], stable: ['→', C.muted] }
  const [icon, color] = map[trend] || map.stable
  return <span style={{ fontSize: 11, color, fontWeight: 700 }}>{icon}</span>
}

function GradeBadge({ score }) {
  const color = score >= 90 ? C.green : score >= 80 ? C.blue : score >= 70 ? C.amber : C.red
  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{score}%</div>
      <div style={{ fontSize: 11, fontWeight: 700, color }}>{letter}</div>
    </div>
  )
}

// ─── Widget shell ────────────────────────────────────────────────────────────
// Tap body → navigate. Tap internal buttons → stopPropagation + own action.
function Widget({ onClick, children, style = {}, title, titleRight }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: '16px',
        marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.12s, border-color 0.12s',
        ...style,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = 'var(--school-color)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = style.border?.split(' ').pop() || C.border }}
    >
      {(title || titleRight) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {title && <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>}
          {titleRight}
        </div>
      )}
      {children}
    </div>
  )
}

function ActionBtn({ label, color, onClick, style = {} }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.() }}
      style={{
        background: `${color}20`, color, border: `1px solid ${color}40`,
        borderRadius: 10, padding: '7px 13px', fontSize: 11, fontWeight: 700,
        cursor: 'pointer', whiteSpace: 'nowrap', ...style,
      }}
    >
      {label}
    </button>
  )
}

// ─── SubPage wrapper ──────────────────────────────────────────────────────────
function SubPage({ children }) {
  useEffect(() => { scrollTop() }, [])
  return <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 80 }}>{children}</div>
}

// ─── REMINDERS PAGE ───────────────────────────────────────────────────────────
function RemindersPage({ onBack }) {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const [text, setText] = useState('')
  const priorities = { high: C.red, medium: C.amber, low: C.muted }

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>🔔 Reminders</h1>
      </div>
      <div style={{ margin: '0 16px 16px', display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, background: C.inner, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none' }}
          placeholder="Add a reminder..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && text.trim() && (addReminder(text.trim()), setText(''))}
        />
        <button
          onClick={() => { if (text.trim()) { addReminder(text.trim()); setText('') } }}
          style={{ background: 'var(--school-color)', border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Add
        </button>
      </div>
      <div style={{ padding: '0 16px' }}>
        {reminders.map(r => (
          <div key={r.id} style={{ background: C.card, border: `1px solid ${priorities[r.priority]}30`, borderLeft: `3px solid ${priorities[r.priority]}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => toggleReminder(r.id)}
              style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${r.done ? C.green : C.border}`, background: r.done ? `${C.green}20` : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green, fontSize: 12 }}>
              {r.done ? '✓' : ''}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: r.done ? C.muted : C.text, textDecoration: r.done ? 'line-through' : 'none' }}>{r.text}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Due: {r.due}</div>
            </div>
            <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>
    </SubPage>
  )
}

// ─── NEEDS ATTENTION PAGE ─────────────────────────────────────────────────────
function NeedsAttentionPage({ onBack }) {
  const { getNeedsAttention, setActiveStudent, setScreen } = useStore()
  const atRisk = getNeedsAttention()

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>⚑ Needs Attention</h1>
      </div>
      <div style={{ padding: '0 16px' }}>
        {atRisk.map(s => (
          <div key={s.id} style={{ background: C.card, border: `1px solid ${C.red}30`, borderLeft: `3px solid ${C.red}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {s.grade < 70 ? `${s.grade}% — below passing` : s.submitUngraded ? 'Submitted — ungraded' : 'Flagged for review'}
                </div>
              </div>
              <GradeBadge score={s.grade} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <ActionBtn label="📩 Message Parent" color={C.purple} onClick={() => {}} />
              <ActionBtn label="✏ View Profile"   color={C.blue}   onClick={() => { setActiveStudent(s); setScreen('studentProfile') }} />
            </div>
          </div>
        ))}
        {atRisk.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>All students on track!</div>
          </div>
        )}
      </div>
    </SubPage>
  )
}

// ─── CLASSES PAGE ─────────────────────────────────────────────────────────────
function ClassesPage({ onBack, navigate }) {
  const { classes, setActiveClass } = useStore()

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>📚 My Classes</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => { setActiveClass(cls); navigate('gradebook') }}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${cls.color}`, borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer', transition: 'transform 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{cls.period} · {cls.subject}</div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>{cls.students} students</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{cls.gpa}</span>
              <TrendBadge trend={cls.trend} />
            </div>
            {cls.needsAttention > 0 && (
              <div style={{ fontSize: 9, color: C.red, marginTop: 6, fontWeight: 700 }}>⚑ {cls.needsAttention} need attention</div>
            )}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ onBack, navigate }) {
  const items = [
    { icon: '🔗', label: 'Integrations',       sub: 'Sync gradebooks, LMS, curriculum',   page: 'integrations' },
    { icon: '⚖',  label: 'Grading Setup',       sub: 'Category weights & grading method',  page: 'gradebook'    },
    { icon: '📚', label: 'Curriculum Links',     sub: 'Connect textbooks for auto-lessons', page: 'integrations' },
    { icon: '🎨', label: 'School Branding',      sub: 'Colors, logo, school name',          page: null           },
    { icon: '🔔', label: 'Notifications',        sub: 'Alerts, emails, push settings',      page: null           },
    { icon: '👤', label: 'Account & Profile',    sub: 'Name, email, password',              page: null           },
    { icon: '🏫', label: 'School Settings',      sub: 'Admin-level configuration',          page: null           },
  ]

  return (
    <SubPage>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: C.inner, border: 'none', borderRadius: 10, padding: '8px 14px', color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>⚙ Settings</h1>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => item.page && navigate(item.page)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', textAlign: 'left', cursor: item.page ? 'pointer' : 'default', opacity: item.page ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{item.sub}</div>
            </div>
            {item.page && <span style={{ color: C.muted, fontSize: 18 }}>›</span>}
            {!item.page && <span style={{ background: C.inner, color: C.muted, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>Soon</span>}
          </button>
        ))}
      </div>
    </SubPage>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'dashboard',      icon: '⊞',  label: 'Home'     },
    { id: 'gradebook',      icon: '📊',  label: 'Grades'   },
    { id: 'camera',         icon: '📷',  label: 'Scan'     },
    { id: 'parentMessages', icon: '💬',  label: 'Messages' },
    { id: 'settings',       icon: '⚙',   label: 'Settings' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(6,8,16,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${C.border}`,
      padding: `8px 0 max(14px, env(safe-area-inset-bottom))`,
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
    }}>
      {items.map(item => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 2px', position: 'relative' }}>
            <span style={{ fontSize: 18, transition: 'transform 0.15s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--school-color)' : C.muted, transition: 'color 0.15s' }}>{item.label}</span>
            {isActive && (
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, background: 'var(--school-color)', borderRadius: 1 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
function UserMenu({ teacher, onNavigate, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const sections = [
    {
      title: 'Navigation',
      items: [
        { icon: '📊', label: 'Gradebook',    page: 'gradebook'      },
        { icon: '📅', label: 'Lesson Plans', page: 'lessonPlan'     },
        { icon: '📣', label: 'Class Feed',   page: 'classFeed'      },
        { icon: '📈', label: 'Reports',      page: 'reports'        },
        { icon: '🧪', label: 'Testing Suite',page: 'testingSuite'   },
        { icon: '💬', label: 'Messages',     page: 'parentMessages' },
        { icon: '🔗', label: 'Integrations', page: 'integrations'   },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile',        page: null },
        { icon: '🏫', label: 'School Settings', page: null },
        { icon: '🚪', label: 'Sign Out',         page: 'logout' },
      ],
    },
  ]

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute', top: '100%', right: 0, zIndex: 999,
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 18, padding: '12px 0', minWidth: 220,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        marginTop: 8,
      }}
    >
      <div style={{ padding: '10px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{teacher.name}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{teacher.school}</div>
      </div>
      {sections.map(section => (
        <div key={section.title}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, padding: '10px 16px 4px' }}>{section.title}</div>
          {section.items.map(item => (
            <button
              key={item.label}
              onClick={() => { if (item.page) onNavigate(item.page); onClose() }}
              style={{ width: '100%', background: 'none', border: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: item.page ? 'pointer' : 'default', opacity: item.page ? 1 : 0.4 }}
              onMouseEnter={e => item.page && (e.currentTarget.style.background = C.inner)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: item.label === 'Sign Out' ? C.red : C.text }}>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── STICKY HEADER ────────────────────────────────────────────────────────────
function StickyHeader({ teacher, onCameraClick, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface, #0a000a) 100%)',
      padding: '14px 16px 14px',
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: school + name */}
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
            {teacher.school?.toUpperCase()}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {greeting}, {teacher.name.split(' ').pop()} 👋
          </div>
        </div>

        {/* Right: time + camera + menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{timeStr}</div>

          {/* Camera icon */}
          <button
            onClick={e => { e.stopPropagation(); onCameraClick?.() }}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
            📷
          </button>

          {/* Hamburger / menu */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 16, height: 2, background: '#fff', borderRadius: 1 }} />
            ))}
          </button>

          {menuOpen && (
            <UserMenu teacher={teacher} onNavigate={navigate} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* Date strip */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

// ─── TODAY'S LESSONS WIDGET ───────────────────────────────────────────────────
// Shows lesson for the currently-selected class tab. Each class has its own lesson queue.
function TodaysLessonsWidget({ navigate }) {
  const { classes, lessons, setActiveLessonClass, setLessonStatus, getTodayLesson } = useStore()
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id || 1)

  const cls    = classes.find(c => c.id === activeClassId) || classes[0]
  const lesson = getTodayLesson(activeClassId)

  function openLesson() {
    setActiveLessonClass(activeClassId)
    navigate('lessonPlan')
  }

  function markDone(e) {
    e.stopPropagation()
    setLessonStatus(activeClassId, 'done')
  }

  function markTBD(e) {
    e.stopPropagation()
    setLessonStatus(activeClassId, 'tbd')
  }

  return (
    <Widget
      onClick={openLesson}
      style={{ background: 'linear-gradient(135deg, #071a30 0%, #0a0a1a 100%)', border: '1px solid #1a3050' }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
        TODAY'S LESSONS
      </div>

      {/* Class selector tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
        {classes.map(c => (
          <button
            key={c.id}
            onClick={e => { e.stopPropagation(); setActiveClassId(c.id) }}
            style={{
              padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
              background: activeClassId === c.id ? c.color : 'rgba(255,255,255,0.08)',
              color:      activeClassId === c.id ? '#fff'   : 'rgba(255,255,255,0.5)',
            }}>
            {c.period} · {c.subject}
          </button>
        ))}
      </div>

      {lesson ? (
        <>
          {/* Status badge */}
          {lesson.status === 'tbd' && (
            <div style={{ background: '#2a1f0a', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, padding: '5px 10px', fontSize: 10, color: C.amber, fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>
              ⟳ TBD — Repeating this session
            </div>
          )}

          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
            {lesson.title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            {[lesson.pages, lesson.duration].filter(Boolean).join(' · ')}
          </div>

          {/* Objective preview */}
          {lesson.objective && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
              "{lesson.objective.substring(0, 80)}{lesson.objective.length > 80 ? '...' : ''}"
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <ActionBtn label="📋 Full Plan" color={C.teal}  onClick={openLesson} />
            {lesson.status !== 'done' && (
              <>
                <ActionBtn label="✓ Done" color={C.green} onClick={markDone} />
                <ActionBtn label="⟳ TBD" color={C.amber} onClick={markTBD} />
              </>
            )}
            {lesson.status === 'done' && (
              <span style={{ fontSize: 11, color: C.green, fontWeight: 700, alignSelf: 'center' }}>✓ Lesson completed</span>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>No lesson scheduled for this class</div>
          <ActionBtn label="+ Create Lesson" color={C.teal} onClick={openLesson} />
        </div>
      )}
    </Widget>
  )
}

// ─── MAIN DASHBOARD HOME FEED ─────────────────────────────────────────────────
function HomeFeed({ navigate }) {
  const store = useStore()
  const { classes, students, messages, reminders, teacher, getNeedsAttention, categories } = store

  const pending = messages.filter(m => m.status === 'pending')
  const atRisk  = getNeedsAttention()
  const dueRems = reminders.filter(r => !r.done)

  // Daily overview mirrors bottom nav minus Home — in same order
  const overviewTiles = [
    { icon: '📊', val: (classes.reduce((s,c) => s+c.gpa,0)/classes.length).toFixed(1), label: 'Grades',   page: 'gradebook',      color: C.blue   },
    { icon: '📷', val: '',                                                               label: 'Scan',     page: 'camera',         color: C.green  },
    { icon: '💬', val: pending.length || '',                                             label: 'Messages', page: 'parentMessages', color: C.purple },
    { icon: '🔔', val: atRisk.length || '',                                              label: 'Alerts',   page: 'attention',      color: C.red    },
    { icon: '⚙',  val: '',                                                               label: 'Settings', page: 'settings',       color: C.muted  },
  ]

  return (
    <div style={{ padding: '12px 12px 0' }}>

      {/* W1: Daily Overview */}
      <Widget style={{ background: 'var(--school-surface, #1a0008)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
          DAILY OVERVIEW
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
          {overviewTiles.map(tile => (
            <button
              key={tile.label}
              onClick={e => { e.stopPropagation(); navigate(tile.page) }}
              style={{ background: `${tile.color}18`, border: `1px solid ${tile.color}30`, borderRadius: 14, padding: '10px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = `${tile.color}30`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${tile.color}18`)}>
              <span style={{ fontSize: 16 }}>{tile.icon}</span>
              {tile.val !== '' && <span style={{ fontSize: 16, fontWeight: 900, color: tile.color, lineHeight: 1 }}>{tile.val}</span>}
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontWeight: 600 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* W2: Today's Lessons — per-class widget with Done/TBD */}
      <TodaysLessonsWidget navigate={navigate} />

      {/* W3: My Classes */}
      <Widget
        onClick={() => navigate('classes')}
        title="📚 My Classes"
        titleRight={<ActionBtn label="+ Add" color={C.blue} onClick={() => navigate('gradebook')} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={e => { e.stopPropagation(); store.setActiveClass(cls); navigate('gradebook') }}
              style={{ background: C.inner, borderRadius: 14, padding: '12px 14px', border: 'none', borderLeft: `3px solid ${cls.color}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = C.raised)}
              onMouseLeave={e => (e.currentTarget.style.background = C.inner)}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.text, marginBottom: 2 }}>{cls.period} · {cls.subject}</div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{cls.students} students</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{cls.gpa}</span>
                <TrendBadge trend={cls.trend} />
              </div>
              {cls.needsAttention > 0 && (
                <div style={{ fontSize: 9, color: C.red, marginTop: 4, fontWeight: 700 }}>⚑ {cls.needsAttention} need attention</div>
              )}
            </button>
          ))}
        </div>
      </Widget>

      {/* W4: Needs Attention */}
      {atRisk.length > 0 && (
        <Widget
          onClick={() => navigate('attention')}
          style={{ border: `1px solid ${C.red}25` }}
          title="⚑ Needs Attention"
          titleRight={<span style={{ background: `${C.red}18`, color: C.red, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{atRisk.length}</span>}
        >
          {atRisk.slice(0, 3).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.inner, borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>
                  {s.grade < 70 ? `${s.grade}% — failing` : s.submitUngraded ? 'Ungraded work' : 'Flagged'}
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>{s.grade}%</span>
            </div>
          ))}
          {atRisk.length > 3 && (
            <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 4 }}>+{atRisk.length - 3} more students</div>
          )}
        </Widget>
      )}

      {/* W5: Messages */}
      <Widget
        onClick={() => navigate('parentMessages')}
        title="💬 Parent Messages"
        titleRight={
          pending.length > 0
            ? <span style={{ background: `${C.purple}20`, color: C.purple, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{pending.length} pending</span>
            : null
        }
      >
        {pending.slice(0, 2).map(m => (
          <div key={m.id} style={{ background: C.inner, borderRadius: 12, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{m.studentName}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{m.trigger}</div>
            </div>
            <ActionBtn label="Send →" color={C.purple} onClick={() => navigate('parentMessages')} />
          </div>
        ))}
        {pending.length === 0 && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '8px 0' }}>No pending messages</div>
        )}
        <ActionBtn label="Open Messages" color={C.purple} onClick={() => navigate('parentMessages')} style={{ width: '100%', marginTop: 4, justifyContent: 'center' }} />
      </Widget>

      {/* W6: Reports quick-access */}
      <Widget
        onClick={() => navigate('reports')}
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #060810 100%)', border: '1px solid #1a2a40' }}
        title="📈 Reports"
        titleRight={<ActionBtn label="View All →" color={C.blue} onClick={() => navigate('reports')} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Class Mastery',  val: '87%',   icon: '🏆', color: C.green  },
            { label: 'At Risk',        val: atRisk.length, icon: '⚑', color: C.red },
            { label: 'Avg GPA',        val: (classes.reduce((s, c) => s + c.gpa, 0) / classes.length).toFixed(1), icon: '📊', color: C.blue },
          ].map(stat => (
            <div key={stat.label} style={{ background: C.inner, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Widget>

      {/* W7: Reminders */}
      <Widget
        onClick={() => navigate('reminders')}
        title="🔔 Reminders"
        titleRight={<ActionBtn label="+ Add" color={C.amber} onClick={() => navigate('reminders')} />}
      >
        {reminders.filter(r => !r.done).slice(0, 3).map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.inner, borderRadius: 10, padding: '9px 12px', marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.priority === 'high' ? C.red : r.priority === 'medium' ? C.amber : C.muted, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12, color: C.text }}>{r.text}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{r.due}</div>
          </div>
        ))}
        {reminders.filter(r => !r.done).length === 0 && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '8px 0' }}>All caught up! 🎉</div>
        )}
      </Widget>

      {/* W8: Integrations quick-connect */}
      <Widget
        onClick={() => navigate('integrations')}
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060810 100%)', border: `1px solid ${C.teal}20` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 2 }}>Sync your tools</div>
            <div style={{ fontSize: 11, color: C.muted }}>Connect PowerSchool, Google Classroom, Canvas & more</div>
          </div>
          <span style={{ color: C.teal, fontSize: 18 }}>›</span>
        </div>
      </Widget>

      {/* W9: Camera / Scan quick-access */}
      <Widget
        onClick={() => navigate('camera')}
        style={{ background: 'linear-gradient(135deg, #0a1a0a 0%, #060810 100%)', border: `1px solid ${C.green}20` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 2 }}>Grade with Camera</div>
            <div style={{ fontSize: 11, color: C.muted }}>Scan assignments · Upload rosters · AI auto-grade</div>
          </div>
          <span style={{ color: C.green, fontSize: 18 }}>›</span>
        </div>
      </Widget>

    </div>
  )
}

// ─── MAIN DASHBOARD EXPORT ────────────────────────────────────────────────────
export default function Dashboard({ currentUser, onCameraClick }) {
  const store = useStore()
  const { teacher, activeScreen, activeStudent, setActiveLessonClass, activeLessonClassId } = store

  const [subPage,   setSubPage]   = useState(null)
  const [activeNav, setActiveNav] = useState('dashboard')

  // Apply school theme on mount
  useEffect(() => {
    applyTheme('kipp') // Teacher is KIPP
    scrollTop()
  }, [])

  // Sync store-driven navigation (e.g. clicking student profile from sub-pages)
  useEffect(() => {
    if (activeScreen === 'studentProfile') setSubPage('studentProfile')
  }, [activeScreen])

  function goHome() {
    setSubPage(null)
    setActiveNav('dashboard')
    store.setScreen('dashboard')
    scrollTop()
  }

  function navigate(id) {
    if (!id) return
    if (id === 'dashboard') { goHome(); return }
    if (id === 'logout') { goHome(); return } // placeholder
    setSubPage(id)
    setActiveNav(id === 'gradebook' ? 'gradebook' : id === 'parentMessages' ? 'parentMessages' : id === 'settings' ? 'settings' : activeNav)
    scrollTop()
  }

  function navSelect(id) {
    if (id === 'camera') { onCameraClick?.(); return }
    navigate(id)
    setActiveNav(id)
  }

  // ── Sub-page router ─────────────────────────────────────────────────────────
  const withNav = (node) => (
    <>
      {node}
      <BottomNav active={activeNav} onSelect={navSelect} />
    </>
  )

  if (subPage === 'gradebook')
    return withNav(<SubPage><Gradebook onBack={goHome} /></SubPage>)

  if (subPage === 'lessonPlan')
    return withNav(
      <SubPage>
        <LessonPlan
          initialMode="view"
          classId={activeLessonClassId}
          onBack={goHome}
        />
      </SubPage>
    )

  if (subPage === 'parentMessages')
    return withNav(<SubPage><ParentMessages onBack={goHome} /></SubPage>)

  if (subPage === 'reports')
    return withNav(<SubPage><Reports onBack={goHome} /></SubPage>)

  if (subPage === 'testingSuite')
    return withNav(<SubPage><TestingSuite onBack={goHome} /></SubPage>)

  if (subPage === 'classFeed')
    return withNav(<SubPage><ClassFeed onBack={goHome} /></SubPage>)

  if (subPage === 'studentProfile')
    return withNav(<SubPage><StudentProfile onBack={goHome} /></SubPage>)

  if (subPage === 'camera')
    return withNav(<SubPage><Camera onBack={goHome} /></SubPage>)

  if (subPage === 'integrations')
    return withNav(<SubPage><Integrations onBack={goHome} /></SubPage>)

  if (subPage === 'reminders')
    return withNav(<RemindersPage onBack={goHome} />)

  if (subPage === 'attention')
    return withNav(<NeedsAttentionPage onBack={goHome} />)

  if (subPage === 'classes')
    return withNav(<ClassesPage onBack={goHome} navigate={navigate} />)

  if (subPage === 'settings')
    return withNav(<SettingsPage onBack={goHome} navigate={navigate} />)

  // ── Home view ───────────────────────────────────────────────────────────────
  return withNav(
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", paddingBottom: 90 }}>
      <StickyHeader teacher={teacher} onCameraClick={onCameraClick} navigate={navigate} />
      <HomeFeed navigate={navigate} />
    </div>
  )
}
