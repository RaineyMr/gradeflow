import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { GradeBar, GradeBadge, TrendBadge, Tag } from '../components/ui'

function DailyOverview() {
  const { messages, getNeedsAttention, classes } = useStore()
  const pending = messages.filter(m => m.status === 'pending').length
  const attention = getNeedsAttention().length
  const reminders = 2

  const stats = [
    { icon: '💬', value: pending, label: 'Pending Msgs', color: '#3b7ef4' },
    { icon: '⚑', value: attention, label: 'Need Attention', color: '#f04a4a' },
    { icon: '📚', value: classes.length, label: 'Classes', color: '#22c97a' },
    { icon: '🔔', value: reminders, label: 'Reminders', color: '#f5a623' },
  ]

  return (
    <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)' }}>
      <p className="tag-label mb-3">Daily Overview</p>
      <div className="grid grid-cols-4 gap-2">
        {stats.map(s => (
          <div key={s.label} className="stat-box">
            <span className="text-xl mb-1">{s.icon}</span>
            <span className="font-display font-bold text-2xl text-white">{s.value}</span>
            <span className="text-xs mt-1 text-center leading-tight" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TodaysLessons() {
  const { lessons } = useStore()
  const [doneIndex, setDoneIndex] = useState(0)
  const current = lessons[doneIndex]

  if (!current) return (
    <div className="widget">
      <p className="tag-label mb-2">Today's Lessons</p>
      <p className="text-text-muted text-sm">All lessons complete for today 🎉</p>
    </div>
  )

  return (
    <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)', border: '1px solid #1a3a2a' }}>
      <p className="tag-label mb-2">Today's Lessons</p>
      <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2" style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
        {current.period} Period · {current.subject}
      </div>
      <p className="font-display font-bold text-base text-text-primary mb-1">{current.title}</p>
      <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>Pages {current.pages} · {current.duration} min</p>
      <div className="flex gap-2">
        <button
          onClick={() => setDoneIndex(i => i + 1)}
          className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
          style={{ background: '#22c97a22', color: '#22c97a', border: '1px solid #22c97a40' }}
        >
          ✓ Done
        </button>
        <button
          onClick={() => setDoneIndex(i => i + 1)}
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
            onClick={() => useStore.getState().setActiveClass(cls)}
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
  const { getNeedsAttention, setActiveStudent } = useStore()
  const students = getNeedsAttention()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">⚑ Needs Attention</p>
        <button className="text-xs font-semibold px-2 py-1 rounded-pill" style={{ background: '#f04a4a20', color: '#f04a4a' }}>
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
              onClick={() => useStore.getState().setActiveStudent(s)}
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
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Parent Messages</p>
        <button onClick={() => useStore.getState().setScreen('parentMessages')} className="text-accent text-xs font-semibold">View all →</button>
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
    <div className="widget">
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
      <div className="flex gap-2">
        <button onClick={() => useStore.getState().setScreen('lessonPlan')} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
          📖 View Plan
        </button>
        <button onClick={() => useStore.getState().setScreen('lessonPlan')} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
          ✨ AI Generate
        </button>
        <button className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
          📤 Share
        </button>
      </div>
    </div>
  )
}

function ReportsWidget() {
  const { setScreen } = useStore()
  const reports = ['📊 Class Mastery', '👤 Student Report', '📉 Grade Dist.', '⚑ Needs Attention', '💬 Comm. Log', '📈 Progress']

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Reports</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {reports.map(r => (
          <button
            key={r}
            onClick={() => useStore.getState().setScreen('reports')}
            className="p-2 rounded-card text-center hover:bg-elevated transition-colors"
            style={{ background: '#161923', fontSize: '10px', color: '#eef0f8' }}
          >
            {r}
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
  const [editWeights, setEditWeights] = React.useState(false)
  const [localWeights, setLocalWeights] = React.useState(null)
  const { weights } = useStore()
  const displayWeights = localWeights || weights

  function openWeights() {
    setLocalWeights({ ...weights })
    setEditWeights(true)
  }
  function saveWeights() {
    useStore.setState({ weights: localWeights })
    setEditWeights(false)
  }

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Grading</p>
        <Tag color="#22c97a">Synced ✓</Tag>
      </div>
      <p className="tag-label mb-2">Tap to adjust weights</p>
      <div className="flex gap-1.5 mb-4">
        {Object.entries(displayWeights).map(([type, w]) => (
          <button key={type} onClick={openWeights}
            className="flex-1 text-center p-2 rounded-card transition-all hover:bg-elevated"
            style={{ background: '#1e2231' }}>
            <div className="text-xs font-bold mb-1" style={{ color: '#6b7494', fontSize: '9px' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            <span className="font-bold text-sm" style={{ color: '#eef0f8' }}>{w}%</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => useStore.getState().setScreen('camera')}
        className="w-full py-4 rounded-card font-display font-bold text-lg transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, var(--school-color), #5c9ef8)', color: 'white' }}
      >
        📷 Scan / Grade
      </button>

      {editWeights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" onClick={() => setEditWeights(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-elevated rounded-widget p-6 w-full max-w-sm animate-slide-up mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-text-primary mb-4">Assignment Weights</h3>
            <div className="space-y-3 mb-4">
              {Object.entries(localWeights).map(([type, w]) => (
                <div key={type} className="flex items-center justify-between">
                  <label className="text-sm text-text-primary capitalize">{type}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" max="100"
                      className="w-16 bg-elevated border border-border rounded-card px-2 py-1 text-text-primary text-sm text-center"
                      value={w} onChange={e => setLocalWeights(lw => ({ ...lw, [type]: Number(e.target.value) }))} />
                    <span className="text-text-muted text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-text-muted text-xs mb-4">Total: {Object.values(localWeights).reduce((a, b) => a + b, 0)}% (should equal 100%)</p>
            <div className="flex gap-2">
              <button onClick={() => setEditWeights(false)} className="flex-1 py-2 rounded-pill text-sm" style={{ background: '#1e2231', color: '#6b7494' }}>Cancel</button>
              <button onClick={saveWeights} className="flex-1 py-2 rounded-pill text-sm font-bold text-white" style={{ background: 'var(--school-color)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
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
