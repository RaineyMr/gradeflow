import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore } from '../lib/store'
import { GradeBadge, TrendBadge, Tag } from '../components/ui'

// ── Shared modal shell — uses portal to escape any stacking context ───────────
function Popup({ onClose, title, children }) {
  const modal = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 rounded-widget border border-elevated animate-slide-up overflow-hidden"
        style={{ background: '#161923', maxHeight: '85vh', zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-elevated">
          <h3 className="font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
  return ReactDOM.createPortal(modal, document.body)
}

// ── Needs Attention modal ─────────────────────────────────────────────────────
function NeedsAttentionModal({ onClose }) {
  const {
    students,
    messages,
    assignments,
    keyAlertsDismissed,
    dismissKeyAlert,
  } = useStore()

  const belowPassing = students.filter(s => s.grade < 70)
  const ungraded     = students.filter(s => s.submitUngraded)
  const dayOldMsgs   = messages.filter(m => m.status === 'pending' && m.dayOld)
  const missingKeys  = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id))
  const totalCount   = belowPassing.length + ungraded.length + dayOldMsgs.length + missingKeys.length

  function goToStudent(s) {
    onClose()
    useStore.getState().setActiveStudent(s)
  }

  return (
    <Popup onClose={onClose} title={`⚑ Needs Attention — ${totalCount} items`}>
      <div className="p-5 space-y-5">

        {belowPassing.length > 0 && (
          <section>
            <p className="tag-label mb-2">📉 Below Passing ({belowPassing.length})</p>
            <div className="space-y-2">
              {belowPassing.map(s => (
                <button key={s.id} onClick={() => goToStudent(s)}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                    <p className="text-danger" style={{ fontSize: '10px' }}>{s.grade}% — below passing · tap to view</p>
                  </div>
                  <GradeBadge score={s.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {ungraded.length > 0 && (
          <section>
            <p className="tag-label mb-2">📬 Submitted — Awaiting Grade ({ungraded.length})</p>
            <div className="space-y-2">
              {ungraded.map(s => (
                <button key={s.id} onClick={() => goToStudent(s)}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#1a1a0a', border: '1px solid #f5a62320' }}>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                    <p style={{ fontSize: '10px', color: '#f5a623' }}>Submitted — ungraded · tap to grade</p>
                  </div>
                  <GradeBadge score={s.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {dayOldMsgs.length > 0 && (
          <section>
            <p className="tag-label mb-2">💬 Unsent Parent Messages ({dayOldMsgs.length})</p>
            <div className="space-y-2">
              {dayOldMsgs.map(m => (
                <button key={m.id} onClick={() => { onClose(); useStore.getState().setScreen('parentMessages') }}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#0f1a2e', border: '1px solid #3b7ef430' }}>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{m.studentName}</p>
                    <p style={{ fontSize: '10px', color: '#3b7ef4' }}>Triggered: {m.trigger} · tap to send</p>
                  </div>
                  <span className="text-xl">💬</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {missingKeys.length > 0 && (
          <section>
            <p className="tag-label mb-2">🔑 Missing Answer Keys ({missingKeys.length})</p>
            <div className="space-y-2">
              {missingKeys.map(a => (
                <div key={a.id} className="p-3 rounded-card" style={{ background: '#1a1a0a', border: '1px solid #f5a62330' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{a.name}</p>
                      <p style={{ fontSize: '10px', color: '#f5a623' }}>{a.type} · {a.date} · no key uploaded</p>
                    </div>
                    <span className="text-xl">🔑</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onClose(); useStore.getState().setScreen('camera') }}
                      className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                      style={{ background: '#f5a62320', color: '#f5a623' }}>
                      📷 Scan / Upload Key
                    </button>
                    <button onClick={() => dismissKeyAlert(a.id)}
                      className="flex-1 py-1.5 rounded-pill text-xs font-semibold"
                      style={{ background: '#1e2231', color: '#6b7494' }}>
                      ✕ No key needed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-text-muted">Nothing needs attention.</p>
          </div>
        )}
      </div>
    </Popup>
  )
}

// ── Needs Review modal ────────────────────────────────────────────────────────
function NeedsReviewModal({ onClose }) {
  const { students, grades, assignments } = useStore()

  const aiGrades = grades.filter(g => g.aiGraded)
  const reviewItems = aiGrades.map(g => {
    const student    = students.find(s => s.id === g.studentId)
    const assignment = assignments.find(a => a.id === g.assignmentId)
    return { grade: g, student, assignment }
  }).filter(item => item.student && item.assignment)

  const flaggedStudents = students.filter(s => s.flagged && !aiGrades.find(g => g.studentId === s.id))

  return (
    <Popup onClose={onClose} title={`⚑ Needs Review — ${reviewItems.length + flaggedStudents.length} items`}>
      <div className="p-5 space-y-5">
        {reviewItems.length > 0 && (
          <section>
            <p className="tag-label mb-2">🤖 AI-Graded — Awaiting Your Approval ({reviewItems.length})</p>
            <div className="space-y-2">
              {reviewItems.map(({ grade, student, assignment }, i) => (
                <div key={i} className="p-3 rounded-card" style={{ background: '#1a1230', border: '1px solid #9b6ef530' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{student.name}</p>
                      <p style={{ fontSize: '10px', color: '#9b6ef5' }}>{assignment.name} · AI scored {grade.score}%</p>
                      {grade.aiConfidence === 'low' && (
                        <p style={{ fontSize: '9px', color: '#f04a4a' }}>⚠ Low confidence — please verify</p>
                      )}
                    </div>
                    <GradeBadge score={grade.score} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onClose(); useStore.getState().setActiveStudent(student) }}
                      className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                      style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
                      ✏ Review & Edit
                    </button>
                    <button className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                      style={{ background: '#22c97a20', color: '#22c97a' }}>
                      ✓ Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {flaggedStudents.length > 0 && (
          <section>
            <p className="tag-label mb-2">⚑ Flagged for Review ({flaggedStudents.length})</p>
            <div className="space-y-2">
              {flaggedStudents.map(s => (
                <button key={s.id} onClick={() => { onClose(); useStore.getState().setActiveStudent(s) }}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                    <p className="text-danger" style={{ fontSize: '10px' }}>Flagged · {s.grade}% · tap to review</p>
                  </div>
                  <GradeBadge score={s.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {reviewItems.length === 0 && flaggedStudents.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-text-muted">No AI grades waiting for review.</p>
          </div>
        )}
      </div>
    </Popup>
  )
}

// ── Daily Overview ────────────────────────────────────────────────────────────
function DailyOverview() {
  const { messages, getNeedsAttention, classes } = useStore()
  const pending   = messages.filter(m => m.status === 'pending').length
  const attention = getNeedsAttention().length
  const [showReminders, setShowReminders] = useState(false)
  const [showAttention, setShowAttention] = useState(false)

  const reminders = [
    { text: 'Parent-teacher conferences Friday 3pm', icon: '📅' },
    { text: 'Submit grades by end of week',          icon: '📝' },
  ]

  const stats = [
    { icon: '💬', value: pending,          label: 'Pending Msgs',   action: () => useStore.getState().setScreen('parentMessages') },
    { icon: '⚑',  value: attention,        label: 'Need Attention', action: () => setShowAttention(true) },
    { icon: '📚', value: classes.length,   label: 'Classes',        action: () => useStore.getState().setScreen('gradebook') },
    { icon: '🔔', value: reminders.length, label: 'Reminders',      action: () => setShowReminders(true) },
  ]

  return (
    <>
      <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)' }}>
        <p className="tag-label mb-3">Daily Overview</p>
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => (
            <button key={s.label} className="stat-box hover:scale-[1.04] transition-transform" onClick={s.action}>
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="font-display font-bold text-2xl text-white">{s.value}</span>
              <span className="text-xs mt-1 text-center leading-tight" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px' }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showReminders && (
        <Popup onClose={() => setShowReminders(false)} title="🔔 Reminders">
          <div className="p-5 space-y-3">
            {reminders.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-card" style={{ background: '#1e2231' }}>
                <span className="text-xl">{r.icon}</span>
                <p className="text-sm text-text-primary">{r.text}</p>
              </div>
            ))}
            <button
              onClick={() => setShowReminders(false)}
              className="w-full py-2.5 rounded-pill text-sm font-bold text-white mt-2"
              style={{ background: 'var(--school-color)' }}>
              Got it
            </button>
          </div>
        </Popup>
      )}

      {showAttention && <NeedsAttentionModal onClose={() => setShowAttention(false)} />}
    </>
  )
}

// ── Today's Lessons ───────────────────────────────────────────────────────────
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
      <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2"
        style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
        {current.period} Period · {current.subject}
      </div>
      <p className="font-display font-bold text-base text-text-primary mb-1">{current.title}</p>
      <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>Pages {current.pages} · {current.duration} min</p>
      <div className="flex gap-2">
        <button onClick={() => setDoneIndex(i => i + 1)}
          className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
          style={{ background: '#22c97a22', color: '#22c97a', border: '1px solid #22c97a40' }}>
          ✓ Done
        </button>
        <button onClick={() => setDoneIndex(i => i + 1)}
          className="px-4 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
          style={{ background: '#f5a62322', color: '#f5a623', border: '1px solid #f5a62340' }}>
          TBC →
        </button>
      </div>
      {doneIndex < lessons.length - 1 && (
        <p className="text-text-muted mt-2" style={{ fontSize: '9px' }}>
          → {lessons.length - doneIndex - 1} more lesson{lessons.length - doneIndex - 1 !== 1 ? 's' : ''} today
        </p>
      )}
    </div>
  )
}

// ── Needs Attention widget ────────────────────────────────────────────────────
// • Clicking the widget background / title / "View all" → opens full modal
// • Clicking an individual student bubble → navigates directly to that student
//   (e.stopPropagation prevents the widget onClick from also firing)
function NeedsAttentionWidget() {
  const { getNeedsAttention } = useStore()
  const students  = getNeedsAttention()
  const [showModal, setShowModal] = useState(false)

  function goToStudent(e, s) {
    e.stopPropagation()                          // don't bubble up to widget onClick
    useStore.getState().setActiveStudent(s)
  }

  return (
    <>
      {/* The whole widget is clickable — opens the modal */}
      <div
        className="widget"
        style={{ cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="widget-title">
            ⚑ Needs Attention
            {students.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-pill font-bold"
                style={{ background: '#f04a4a20', color: '#f04a4a', fontSize: '10px' }}>
                {students.length}
              </span>
            )}
          </p>
          {/* View all button also opens modal; stopPropagation not needed since
              the parent also opens it, but kept for clarity */}
          <button
            onClick={e => { e.stopPropagation(); setShowModal(true) }}
            className="text-xs font-semibold px-2 py-1 rounded-pill transition-opacity hover:opacity-70"
            style={{ background: '#f04a4a20', color: '#f04a4a' }}>
            View all →
          </button>
        </div>

        {students.length === 0 ? (
          <p className="text-text-muted text-sm">All students on track 🎉</p>
        ) : (
          <div className="space-y-2">
            {students.slice(0, 3).map(s => (
              <button
                key={s.id}
                onClick={e => goToStudent(e, s)}   // goes straight to student profile
                className="w-full flex items-center justify-between p-2.5 rounded-card text-left hover:bg-elevated transition-colors"
                style={{ background: '#1c1012', border: '1px solid #f04a4a15' }}>
                <div>
                  <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                  <p className="text-danger" style={{ fontSize: '10px' }}>
                    {s.grade < 70
                      ? `${s.grade}% — below passing`
                      : s.submitUngraded
                      ? 'Submitted — ungraded'
                      : 'Flagged for review'}
                  </p>
                </div>
                <GradeBadge score={s.grade} />
              </button>
            ))}

            {students.length > 3 && (
              <button
                onClick={e => { e.stopPropagation(); setShowModal(true) }}
                className="w-full text-center text-xs font-semibold py-2 rounded-card transition-opacity hover:opacity-70"
                style={{ background: '#1e2231', color: '#f04a4a' }}>
                +{students.length - 3} more · view all
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && <NeedsAttentionModal onClose={() => setShowModal(false)} />}
    </>
  )
}

// ── My Classes ────────────────────────────────────────────────────────────────
function MyClasses() {
  const { classes } = useStore()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">My Classes</p>
        <button onClick={() => useStore.getState().setScreen('gradebook')} className="text-accent text-xs font-semibold">+ Add</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {classes.map(cls => (
          <button key={cls.id} onClick={() => useStore.getState().setActiveClass(cls)}
            className="p-3 rounded-card text-left transition-all hover:scale-[1.02]"
            style={{ background: '#1e2231', borderLeft: `3px solid ${cls.color}` }}>
            <p className="font-bold text-sm text-text-primary">{cls.period} · {cls.subject}</p>
            <p className="text-text-muted mb-2" style={{ fontSize: '10px' }}>{cls.students} students</p>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white">{cls.gpa}</span>
              <TrendBadge trend={cls.trend} />
            </div>
            {cls.gpa < 70 && (
              <span className="text-danger" style={{ fontSize: '9px' }}>⚑ Needs attention</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Parent Messages widget ────────────────────────────────────────────────────
function ParentMessagesWidget() {
  const { messages } = useStore()
  const pending = messages.filter(m => m.status === 'pending')
  const [reactions, setReactions] = useState({})

  function react(msgId, emoji) {
    setReactions(r => ({ ...r, [`${msgId}-${emoji}`]: (r[`${msgId}-${emoji}`] || 0) + 1 }))
  }

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Parent Messages</p>
        <button onClick={() => useStore.getState().setScreen('parentMessages')} className="text-accent text-xs font-semibold">View all →</button>
      </div>
      {pending.length === 0 ? (
        <p className="text-text-muted text-sm">No pending messages 📭</p>
      ) : (
        <div className="space-y-2">
          {pending.slice(0, 2).map(m => (
            <div key={m.id} className="p-3 rounded-card" style={{ background: '#0f1a2e', border: '1px solid #3b7ef420' }}>
              <p className="font-semibold text-sm text-text-primary mb-0.5">{m.studentName}</p>
              <p style={{ fontSize: '10px', color: '#3b7ef4' }}>{m.trigger}</p>
            </div>
          ))}
          {pending.length > 2 && (
            <button onClick={() => useStore.getState().setScreen('parentMessages')}
              className="w-full text-center text-xs font-semibold py-2 rounded-card"
              style={{ background: '#1e2231', color: '#6b7494' }}>
              +{pending.length - 2} more →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { teacher } = useStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-4 pb-6">
      <div className="pt-2 pb-1">
        <h1 className="font-display font-bold text-2xl text-text-primary">
          {greeting}, {teacher.name.split(' ')[1] || teacher.name} 👋
        </h1>
        <p className="text-text-muted text-sm">{teacher.school}</p>
      </div>

      <DailyOverview />
      <TodaysLessons />
      <NeedsAttentionWidget />
      <MyClasses />
      <ParentMessagesWidget />
    </div>
  )
}
