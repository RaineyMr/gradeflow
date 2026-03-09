import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar, GradeBadge, TrendBadge, Tag, Modal } from '../components/ui'

function DailyOverview() {
  const { messages, getNeedsAttention, classes, setScreen } = useStore()
  const pending = messages.filter(m => m.status === 'pending').length
  const attention = getNeedsAttention().length
  const reminders = 2

  const stats = [
    { icon: '💬', value: pending, label: 'Pending Msgs', color: '#3b7ef4', screen: 'parentMessages' },
    { icon: '⚑', value: attention, label: 'Need Attention', color: '#f04a4a', screen: 'gradebook' },
    { icon: '📚', value: classes.length, label: 'Classes', color: '#22c97a', screen: 'gradebook' },
    { icon: '🔔', value: reminders, label: 'Reminders', color: '#f5a623', screen: 'dashboard' },
  ]

  return (
    <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)' }}>
      <p className="tag-label mb-3">Daily Overview</p>
      <div className="grid grid-cols-4 gap-2">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => setScreen(s.screen)}
            className="stat-box transition-all hover:scale-[1.05] hover:opacity-90"
          >
            <span className="text-xl mb-1">{s.icon}</span>
            <span className="font-display font-bold text-2xl text-white">{s.value}</span>
            <span className="text-xs mt-1 text-center leading-tight" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px' }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TodaysLessons() {
  const { lessons, setScreen } = useStore()
  const [doneIndex, setDoneIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [modalIndex, setModalIndex] = useState(0)
  const current = lessons[doneIndex]

  function handleAction(action) {
    setPendingAction(action)
    setModalIndex(doneIndex + 1 < lessons.length ? doneIndex + 1 : doneIndex)
    setShowModal(true)
  }

  function handleSelect() {
    setDoneIndex(modalIndex)
    setShowModal(false)
  }

  function handleModalClose() {
    // X just saves next lesson without selecting
    setDoneIndex(prev => prev + 1 < lessons.length ? prev + 1 : prev)
    setShowModal(false)
  }

  if (!current) return (
    <div className="widget cursor-pointer hover:opacity-90 transition-all" onClick={() => setScreen('lessonPlan')}>
      <p className="tag-label mb-2">Today's Lessons</p>
      <p className="text-text-muted text-sm">All lessons complete for today 🎉</p>
    </div>
  )

  return (
    <>
      <div
        className="rounded-widget p-4 cursor-pointer hover:opacity-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)', border: '1px solid #1a3a2a' }}
        onClick={() => setScreen('lessonPlan')}
      >
        <p className="tag-label mb-2">Today's Lessons</p>
        <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2" style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
          {current.period} Period · {current.subject}
        </div>
        <p className="font-display font-bold text-base text-text-primary mb-1">{current.title}</p>
        <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>Pages {current.pages} · {current.duration} min</p>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleAction('done')}
            className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
            style={{ background: '#22c97a22', color: '#22c97a', border: '1px solid #22c97a40' }}
          >
            ✓ Done
          </button>
          <button
            onClick={() => handleAction('tbc')}
            className="px-4 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
            style={{ background: '#f5a62322', color: '#f5a623', border: '1px solid #f5a62340' }}
          >
            TBC →
          </button>
        </div>
        {doneIndex < lessons.length - 1 && (
          <p className="text-text-muted mt-2" style={{ fontSize: '9px' }}>→ {lessons.length - doneIndex - 1} more lesson{lessons.length - doneIndex - 1 !== 1 ? 's' : ''} today</p>
        )}
      </div>

      {/* Lesson picker modal */}
      <Modal open={showModal} onClose={handleModalClose} title="Select Next Lesson">
        <p className="text-text-muted text-sm mb-4">Swipe or tap to pick your next lesson. Press ✕ to auto-advance.</p>
        <div className="space-y-2 mb-4">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => setModalIndex(i)}
              className="w-full p-3 rounded-card text-left transition-all"
              style={{
                background: modalIndex === i ? 'var(--school-color)22' : '#1e2231',
                border: `1px solid ${modalIndex === i ? 'var(--school-color)' : 'transparent'}`
              }}
            >
              <p className="font-bold text-sm text-text-primary">{lesson.title}</p>
              <p className="text-text-muted text-xs">{lesson.period} Period · {lesson.subject} · {lesson.duration} min</p>
            </button>
          ))}
        </div>
        <button
          onClick={handleSelect}
          className="w-full py-2.5 rounded-pill font-bold text-white text-sm"
          style={{ background: 'var(--school-color)' }}
        >
          Select This Lesson
        </button>
      </Modal>
    </>
  )
}

function MyClasses() {
  const { classes, setActiveClass } = useStore()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">My Classes</p>
        <button className="text-accent text-xs font-semibold">+ Add</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => setActiveClass(cls)}
            className="p-3 rounded-card text-left transition-all hover:scale-[1.02]"
            style={{ background: '#1e2231', borderLeft: `3px solid ${cls.color}` }}
          >
            <p className="font-bold text-sm text-text-primary">{cls.period} · {cls.subject}</p>
            <p className="text-text-muted mb-2" style={{ fontSize: '10px' }}>{cls.students} students</p>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white">{cls.gpa}</span>
              <TrendBadge trend={cls.trend} />
            </div>
            {cls.gpa < 70 && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-danger" style={{ fontSize: '9px' }}>⚑ Needs attention</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function NeedsAttention() {
  const { getNeedsAttention, setActiveStudent, setScreen } = useStore()
  const students = getNeedsAttention()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">⚑ Needs Attention</p>
        <button
          onClick={() => setScreen('parentMessages')}
          className="text-xs font-semibold px-2 py-1 rounded-pill"
          style={{ background: '#f04a4a20', color: '#f04a4a' }}
        >
          📩 Message all
        </button>
      </div>
      {students.length === 0 ? (
        <p className="text-text-muted text-sm">All students on track 🎉</p>
      ) : (
        <div className="space-y-2">
          {students.slice(0, 4).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStudent(s)}
              className="w-full flex items-center justify-between p-2 rounded-card hover:bg-elevated transition-colors text-left"
              style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{s.name}</p>
                <p className="text-danger" style={{ fontSize: '10px' }}>
                  {s.grade < 70 ? `${s.grade}% — below passing` : s.submitUngraded ? 'Submitted — ungraded' : 'Grade dropped'}
                </p>
              </div>
              <GradeBadge score={s.grade} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ParentMessagesWidget() {
  const { messages, setScreen } = useStore()
  const pending = messages.filter(m => m.status === 'pending')

  return (
    <div className="widget cursor-pointer hover:opacity-95 transition-all" onClick={() => setScreen('parentMessages')}>
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Parent Messages</p>
        <button onClick={e => { e.stopPropagation(); setScreen('parentMessages') }} className="text-accent text-xs font-semibold">View all →</button>
      </div>
      {pending.length === 0 ? (
        <p className="text-text-muted text-sm">No pending messages</p>
      ) : (
        <div className="space-y-2">
          {pending.map(m => (
            <div key={m.id} className="p-3 rounded-card" style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{m.studentName}</p>
                  <p className="text-text-muted" style={{ fontSize: '10px' }}>{m.subject} · {m.trigger}</p>
                </div>
                <Tag color="#f5a623">Pending</Tag>
              </div>
              <p className="text-text-muted line-clamp-2" style={{ fontSize: '11px' }}>{m.draft}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-text-muted">AI tone: {m.tone}</span>
                <div className="flex gap-1 ml-auto">
                  {['👍', '❤️', '😂'].map(r => (
                    <span key={r} className="cursor-pointer hover:scale-125 transition-transform">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LessonPlanWidget() {
  const { lessons, setScreen } = useStore()
  const lesson = lessons[0]

  return (
    <div className="widget cursor-pointer hover:opacity-95 transition-all" onClick={() => setScreen('lessonPlan')}>
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Lesson Plan</p>
      </div>
      {lesson ? (
        <>
          <p className="font-bold text-sm text-text-primary mb-1">{lesson.title}</p>
          <p className="text-text-muted mb-3" style={{ fontSize: '10px' }}>{lesson.period} Period · {lesson.subject} · {lesson.duration} min</p>
        </>
      ) : (
        <p className="text-text-muted text-sm mb-3">No lesson planned for today</p>
      )}
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={() => setScreen('lessonPlan')} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
          📖 View Plan
        </button>
        <button onClick={() => setScreen('lessonPlan')} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
          ✨ AI Generate
        </button>
        <button onClick={e => e.stopPropagation()} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
          📤 Share
        </button>
      </div>
    </div>
  )
}

function ReportsWidget() {
  const { setScreen } = useStore()

  const reports = [
    { label: '📊 Class Mastery', id: 'mastery' },
    { label: '👤 Student Report', id: 'student' },
    { label: '📉 Grade Dist.', id: 'dist' },
    { label: '⚑ Needs Attention', id: 'attention' },
    { label: '💬 Comm. Log', id: 'comm' },
    { label: '📈 Progress', id: 'progress' },
  ]

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Reports</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {reports.map(r => (
          <button
            key={r.id}
            onClick={() => setScreen('reports')}
            className="p-2 rounded-card text-center hover:bg-elevated transition-colors"
            style={{ background: '#161923', fontSize: '10px', color: '#eef0f8' }}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {['🖨 Print', '⬇ PDF', '📋 Sheet'].map(e => (
          <button key={e} className="flex-1 py-1 rounded-pill text-xs font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

function GradingWidget() {
  const { setScreen } = useStore()

  // Simulated grading status counts
  const stats = [
    { label: 'Needs Review', value: 4, color: '#f5a623' },
    { label: 'Synced', value: '✓', color: '#22c97a' },
    { label: 'Key Needed', value: 2, color: '#f04a4a' },
  ]

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Grading</p>
        <Tag color="#22c97a">Synced ✓</Tag>
      </div>
      <div className="flex gap-1.5 mb-4">
        {stats.map(s => (
          <div key={s.label} className="flex-1 text-center p-2 rounded-card" style={{ background: '#1e2231' }}>
            <div className="font-bold text-lg mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: '#6b7494', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setScreen('camera')}
        className="w-full py-4 rounded-card font-display font-bold text-lg transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, var(--school-color), #5c9ef8)', color: 'white' }}
      >
        📷 Scan / Grade
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { teacher } = useStore()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-primary">
          Good morning, {teacher.name} 👋
        </h1>
        <p className="text-text-muted text-sm">{teacher.school} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="space-y-4">
        <DailyOverview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodaysLessons />
          <NeedsAttention />
        </div>
        <MyClasses />
        <ParentMessagesWidget />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LessonPlanWidget />
          <GradingWidget />
        </div>
        <ReportsWidget />
      </div>
    </div>
  )
}
