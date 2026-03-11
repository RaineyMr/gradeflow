import React, { useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store'

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
}

const LESSONS = [
  {
    id: 0,
    dayLabel: 'Today',
    date: 'Tue · Mar 10',
    classLabel: '3rd Period · Math',
    title: 'Ch. 4 · Fractions & Decimals',
    duration: '45 min',
    pages: 'Pages 84–91',
    objective: 'Students will compare fractions and decimals and convert between forms.',
    warmup: ['Decimal of the day', 'Quick compare: 0.4 vs 3/8'],
    activities: ['Mini-lesson on fraction/decimal conversion', 'Partner station sort', 'Guided practice problems 1–8', 'Exit ticket'],
    materials: ['Workbook', 'Whiteboard', 'Fraction strips', 'Exit ticket slips'],
    homework: 'Workbook page 91, problems 9–14',
  },
  {
    id: 1,
    dayLabel: 'Previous',
    date: 'Mon · Mar 9',
    classLabel: '3rd Period · Math',
    title: 'Ch. 4 · Equivalent Fractions',
    duration: '45 min',
    pages: 'Pages 80–83',
    objective: 'Students will identify and generate equivalent fractions.',
    warmup: ['Visual fraction model review'],
    activities: ['Teacher modeling', 'Small group practice', 'Independent check'],
    materials: ['Workbook', 'Fraction tiles'],
    homework: 'Practice sheet A',
  },
  {
    id: 2,
    dayLabel: 'Next',
    date: 'Wed · Mar 11',
    classLabel: '3rd Period · Math',
    title: 'Ch. 4 · Ordering Fractions',
    duration: '45 min',
    pages: 'Pages 92–96',
    objective: 'Students will order fractions, decimals, and percents.',
    warmup: ['Number line challenge'],
    activities: ['Calendar problem of the day', 'Guided examples', 'Station rotation'],
    materials: ['Workbook', 'Number lines', 'Markers'],
    homework: 'Workbook page 96',
  },
]

function PhoneShell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', width: '100%', background: C.bg,
      fontFamily: 'Inter, -apple-system, Arial, sans-serif',
      boxSizing: 'border-box', overflowX: 'hidden', color: C.text,
    }}>
      {children}
    </div>
  )
}

function TopButton({ label, onClick, color = C.blue, bg = 'rgba(59,126,244,0.12)' }) {
  return (
    <button onClick={onClick} style={{
      background: bg, color, border: 'none', borderRadius: 10,
      padding: '7px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
    }}>
      {label}
    </button>
  )
}

function Header({ title = 'Ms. Johnson 👋', subtitle = 'Lincoln Elementary', onBack, showBack = false }) {
  return (
    <div style={{ background: C.tGrad, padding: '12px 18px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showBack ? (
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '6px 12px', color: C.text, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
              ← Back
            </button>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '6px 12px', fontSize: 13, fontWeight: 800, color: '#fff' }}>
              ⚡ GradeFlow
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>
            {subtitle}
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: C.lGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>
            📷
          </div>
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 9, color: C.hint, marginTop: 6 }}>
        Tap widgets to open detail screens · Swipe lesson cards left/right on mobile
      </div>
    </div>
  )
}

function TileButton({ icon, value, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(255,255,255,0.11)', borderRadius: 13,
      padding: '10px 6px', textAlign: 'center', border: 'none', cursor: 'pointer',
    }}>
      <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{label}</div>
    </button>
  )
}

function DailyOverview({ onOpen }) {
  const tiles = [
    { key: 'messages',  icon: '💬', value: 3,  label: 'Pending Msgs' },
    { key: 'attention', icon: '⚑',  value: 5,  label: 'Need Attention' },
    { key: 'classes',   icon: '📚', value: 4,  label: 'Classes' },
    { key: 'reminders', icon: '🔔', value: 2,  label: 'Reminders' },
  ]
  return (
    <div style={{ background: C.ovGrad, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>DAILY OVERVIEW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {tiles.map((t) => (
          <TileButton key={t.key} icon={t.icon} value={t.value} label={t.label} onClick={() => onOpen(t.key)} />
        ))}
      </div>
    </div>
  )
}

function LessonWidget({ lesson, onOpenLesson, onOpenCalendar, onPrev, onNext }) {
  const touchStartX = useRef(0)
  return (
    <div
      onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current
        if (diff > 45) onPrev()
        if (diff < -45) onNext()
      }}
      style={{ background: C.lGrad, border: '1px solid #1a3a2a', borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>TODAY&apos;S LESSON</div>
        <TopButton label="📅 Calendar" onClick={onOpenCalendar} color={C.teal} bg="rgba(15,184,160,0.12)" />
      </div>
      <button onClick={onOpenLesson} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(15,184,160,0.12)', borderRadius: 9, padding: '3px 10px', fontSize: 10, color: C.teal, fontWeight: 700, marginBottom: 8 }}>
          {lesson.classLabel}
        </div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 4 }}>{lesson.title}</div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>{lesson.pages} · {lesson.duration} · {lesson.date} · Tap to open full plan</div>
      </button>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <TopButton label="← Previous" onClick={onPrev} color={C.amber} bg="rgba(245,166,35,0.12)" />
        <TopButton label="Open Lesson" onClick={onOpenLesson} />
        <TopButton label="Next →" onClick={onNext} color={C.green} bg="rgba(34,201,122,0.12)" />
      </div>
      <div style={{ fontSize: 9, color: '#7eb4ff', marginTop: 8 }}>On mobile, swipe left/right to move through lessons</div>
    </div>
  )
}

function MyClasses({ onOpen }) {
  const classes = [
    { period: '3rd', subject: 'Math',    students: 24, periodLabel: '1st Period', gpa: 87.4, trend: '↑', trendColor: C.green, attention: 3, attColor: C.red,   color: C.blue   },
    { period: '5th', subject: 'Reading', students: 21, periodLabel: '5th Period', gpa: 91.2, trend: '↑', trendColor: C.green, attention: 1, attColor: C.muted,  color: C.purple },
    { period: '2nd', subject: 'Science', students: 26, periodLabel: '2nd Period', gpa: 63.8, trend: '↓', trendColor: C.red,   attention: 8, attColor: C.red,   color: C.teal   },
    { period: '4th', subject: 'Writing', students: 18, periodLabel: '4th Period', gpa: 84.0, trend: '→', trendColor: C.green, attention: 0, attColor: C.muted,  color: C.pink   },
  ]
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>My Classes</div>
        <div style={{ fontSize: 11, color: C.blue, cursor: 'pointer' }}>+ Add</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {classes.map((c) => (
          <button key={c.period + c.subject} onClick={() => onOpen('classes')} style={{
            background: C.inner, borderRadius: 14, padding: '10px 12px',
            borderLeft: `4px solid ${c.color}`, borderTop: 'none', borderRight: 'none', borderBottom: 'none',
            textAlign: 'left', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{c.period} · {c.subject}</div>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>{c.students} students · {c.periodLabel}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, color: c.gpa < 70 ? C.red : '#fff', fontWeight: 800 }}>{c.gpa}</span>
              <span style={{ fontSize: 10, color: c.trendColor }}>GPA {c.trend}</span>
            </div>
            <div style={{ fontSize: 9, color: c.attColor, marginTop: 2 }}>
              ⚑ {c.attention > 0 ? `${c.attention} need attention` : '0'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SimpleCard({ title, children, rightText }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.inner}`, borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{title}</div>
        {rightText ? <div style={{ fontSize: 10, color: C.blue }}>{rightText}</div> : null}
      </div>
      {children}
    </div>
  )
}

// ── Camera Widget (new) ───────────────────────────────────────────────────────
function CameraWidget() {
  const [status, setStatus] = useState('idle') // idle | scanning | done

  return (
    <div style={{
      background: C.card,
      border: '1px solid rgba(34,201,122,0.2)',
      borderRadius: 20,
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>📷 Camera Grader</div>
        <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>AI-POWERED</div>
      </div>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 12 }}>
        Capture student work · GradeFlow grades it and updates your gradebook instantly
      </div>

      {/* Viewfinder mock */}
      <div style={{
        background: '#0a0c14',
        border: '1px dashed rgba(34,201,122,0.3)',
        borderRadius: 14,
        height: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner markers */}
        {[['0','0',''], ['0','auto','scaleX(-1)'], ['auto','0','scaleY(-1)'], ['auto','auto','scale(-1)']].map(([top, left, transform], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: top !== 'auto' ? 10 : 'auto',
            bottom: top === 'auto' ? 10 : 'auto',
            left: left !== 'auto' ? 10 : 'auto',
            right: left === 'auto' ? 10 : 'auto',
            width: 16, height: 16,
            borderTop: top !== 'auto' ? `2px solid ${C.green}` : 'none',
            borderBottom: top === 'auto' ? `2px solid ${C.green}` : 'none',
            borderLeft: left !== 'auto' ? `2px solid ${C.green}` : 'none',
            borderRight: left === 'auto' ? `2px solid ${C.green}` : 'none',
          }} />
        ))}
        <div style={{ fontSize: 22 }}>📄</div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
          {status === 'idle' ? 'Point camera at student work' : status === 'scanning' ? '🔍 Scanning...' : '✅ Graded & saved to gradebook'}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { setStatus('scanning'); setTimeout(() => setStatus('done'), 1500) }}
          style={{
            flex: 2, background: 'rgba(34,201,122,0.14)', color: C.green,
            border: 'none', borderRadius: 12, padding: '10px 0',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📷 Capture &amp; Grade
        </button>
        <button
          onClick={() => setStatus('idle')}
          style={{
            flex: 1, background: C.inner, color: C.muted,
            border: 'none', borderRadius: 12, padding: '10px 0',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {status === 'done' && (
        <div style={{ marginTop: 10, background: 'rgba(34,201,122,0.08)', border: '1px solid rgba(34,201,122,0.2)', borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✅ Graded: Marcus T. — Math · 88%</div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Gradebook updated · Parent notified</div>
        </div>
      )}
    </div>
  )
}

function ScreenShell({ title, subtitle, onBack, children }) {
  return (
    <>
      <Header title={title} subtitle={subtitle} onBack={onBack} showBack />
      <div style={{ padding: '10px 10px 24px' }}>{children}</div>
    </>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.text }}>{value}</div>
    </div>
  )
}

function LessonPlanScreen({ lesson, viewMode, setViewMode, onPrev, onNext, onBack }) {
  return (
    <ScreenShell title="Lesson Plan" subtitle="Lincoln Elementary" onBack={onBack}>
      <div style={{ background: C.lGrad, borderRadius: 20, padding: '16px', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{lesson.date}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{lesson.title}</div>
        <div style={{ fontSize: 11, color: '#b3d4ff' }}>{lesson.classLabel}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <TopButton label="← Previous" onClick={onPrev} color={C.amber} bg="rgba(245,166,35,0.12)" />
          <TopButton label="Next →" onClick={onNext} color={C.green} bg="rgba(34,201,122,0.12)" />
          <TopButton
            label={`View: ${viewMode[0].toUpperCase()}${viewMode.slice(1)}`}
            onClick={() => { const order = ['daily', 'weekly', 'monthly']; setViewMode(order[(order.indexOf(viewMode) + 1) % order.length]) }}
            color={C.teal} bg="rgba(15,184,160,0.12)"
          />
        </div>
      </div>
      <SimpleCard title="Overview">
        <DetailRow label="Objective" value={lesson.objective} />
        <DetailRow label="Pages" value={lesson.pages} />
        <DetailRow label="Duration" value={lesson.duration} />
        <DetailRow label="Homework" value={lesson.homework} />
      </SimpleCard>
      <SimpleCard title="Warm-Up">
        {lesson.warmup.map((item) => <div key={item} style={{ fontSize: 12, color: C.text, marginBottom: 8 }}>• {item}</div>)}
      </SimpleCard>
      <SimpleCard title="Activities">
        {lesson.activities.map((item) => <div key={item} style={{ fontSize: 12, color: C.text, marginBottom: 8 }}>• {item}</div>)}
      </SimpleCard>
      <SimpleCard title="Materials">
        {lesson.materials.map((item) => <div key={item} style={{ fontSize: 12, color: C.text, marginBottom: 8 }}>• {item}</div>)}
      </SimpleCard>
    </ScreenShell>
  )
}

function CalendarScreen({ viewMode, setViewMode, onBack, lessons }) {
  const labels = viewMode === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    : viewMode === 'weekly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

  return (
    <ScreenShell title="Lesson Calendar" subtitle="Lincoln Elementary" onBack={onBack}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['daily', 'weekly', 'monthly'].map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{
            flex: 1, background: viewMode === mode ? 'rgba(59,126,244,0.18)' : C.card,
            color: viewMode === mode ? C.blue : C.muted,
            border: `1px solid ${viewMode === mode ? 'rgba(59,126,244,0.35)' : C.inner}`,
            borderRadius: 12, padding: '10px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            {mode[0].toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      <SimpleCard title="Calendar View" rightText={viewMode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {labels.map((label, idx) => (
            <div key={label} style={{ background: C.inner, borderRadius: 12, padding: '12px' }}>
              <div style={{ fontSize: 11, color: C.text, fontWeight: 700, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{lessons[idx % lessons.length].title}</div>
            </div>
          ))}
        </div>
      </SimpleCard>
    </ScreenShell>
  )
}

function OverviewScreen({ section, onBack }) {
  const content = {
    messages:  { title: 'Pending Messages',         items: ['Parent follow-up from Marcus T.', 'Question from Sofia D.', 'Schedule change request'] },
    attention: { title: 'Students Needing Attention', items: ['Marcus T. – failed recent assessment', 'Sofia D. – dropped 11 points', '3 more students flagged by AI'] },
    classes:   { title: 'Classes Overview',          items: ['Math – 24 students', 'Reading – 21 students', 'Science – 26 students', 'Writing – 18 students'] },
    reminders: { title: "Today's Reminders",         items: ['Grade exit tickets', 'Call parent at 2:30 PM', "Upload tomorrow's lesson resources"] },
  }[section] || { title: 'Overview', items: [] }

  return (
    <ScreenShell title={content.title} subtitle="Lincoln Elementary" onBack={onBack}>
      <SimpleCard title={content.title}>
        {content.items.map((item) => (
          <div key={item} style={{ fontSize: 12, color: C.text, marginBottom: 10 }}>• {item}</div>
        ))}
      </SimpleCard>
    </ScreenShell>
  )
}

function BottomNav({ active, onSelect }) {
  const items = [
    { id: 'home',     icon: '🏠', label: 'Home' },
    { id: 'classes',  icon: '📚', label: 'Classes' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'more',     icon: '⋯',  label: 'More' },
  ]
  return (
    <div style={{ background: '#0d1117', borderTop: `1px solid ${C.inner}`, padding: '6px 8px 16px', position: 'sticky', bottom: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
        {items.map((item) => (
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

export default function Dashboard() {
  const store = useStore?.() || {}
  const classes = store.classes || []

  const [activeNav, setActiveNav] = useState('home')
  const [screen, setScreen] = useState('home')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [calendarView, setCalendarView] = useState('daily')

  const lesson = useMemo(() => LESSONS[lessonIndex], [lessonIndex])

  const goPrevLesson = () => setLessonIndex((prev) => (prev === 0 ? LESSONS.length - 1 : prev - 1))
  const goNextLesson = () => setLessonIndex((prev) => (prev === LESSONS.length - 1 ? 0 : prev + 1))

  const openOverview = (section) => setScreen(`overview:${section}`)
  const goHome = () => setScreen('home')

  const renderHome = () => (
    <>
      <Header />
      <div style={{ padding: '10px 10px 0' }}>
        <DailyOverview onOpen={openOverview} />
        <LessonWidget
          lesson={lesson}
          onOpenLesson={() => setScreen('lesson')}
          onOpenCalendar={() => setScreen('calendar')}
          onPrev={goPrevLesson}
          onNext={goNextLesson}
        />
        <MyClasses onOpen={(section) => openOverview(section)} />
        <SimpleCard title="Needs Attention ⚑">
          <div style={{ background: '#1c1012', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>Marcus T. · Math 58% Failed · Sofia D. dropped 11pts</div>
            <div style={{ fontSize: 10, color: C.red, marginTop: 4 }}>Tap Daily Overview → Need Attention to view all</div>
          </div>
        </SimpleCard>
        <SimpleCard title="Parent Messages" rightText="See all →">
          <div style={{ background: C.inner, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>Marcus T. Parent</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Can we discuss Marcus's math grade this week?</div>
          </div>
        </SimpleCard>
        {/* ── Camera Widget at bottom of feed ── */}
        <CameraWidget />
      </div>
    </>
  )

  let body = renderHome()

  if (screen === 'lesson') {
    body = (
      <LessonPlanScreen
        lesson={lesson} viewMode={calendarView} setViewMode={setCalendarView}
        onPrev={goPrevLesson} onNext={goNextLesson} onBack={goHome}
      />
    )
  } else if (screen === 'calendar') {
    body = <CalendarScreen viewMode={calendarView} setViewMode={setCalendarView} onBack={goHome} lessons={LESSONS} />
  } else if (screen.startsWith('overview:')) {
    body = <OverviewScreen section={screen.split(':')[1]} onBack={goHome} />
  }

  return (
    <PhoneShell>
      {body}
      <BottomNav
        active={activeNav}
        onSelect={(id) => {
          setActiveNav(id)
          if (id === 'calendar') setScreen('calendar')
          else setScreen('home')
        }}
      />
    </PhoneShell>
  )
}
