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
  const { students, messages, assignments, keyAlertsDismissed, setActiveStudent, setScreen } = useStore()

  const belowPassing = students.filter(s => s.grade < 70)
  const ungraded = students.filter(s => s.submitUngraded)
  const dayOldMsgs = messages.filter(m => m.status === 'pending' && m.dayOld)
  const missingKeys = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id))

  const totalCount = belowPassing.length + ungraded.length + dayOldMsgs.length + missingKeys.length

  function goToStudent(s) {
    onClose()
    useStore.getState().setActiveStudent(s)
  }

  return (
    <Popup onClose={onClose} title={`⚑ Needs Attention — ${totalCount} items`}>
      <div className="p-5 space-y-5">

        {/* Below passing */}
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
                    <p className="text-danger" style={{ fontSize: '10px' }}>{s.grade}% — below passing · tap to grade</p>
                  </div>
                  <GradeBadge score={s.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Ungraded submissions */}
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
                    <p style={{ fontSize: '10px', color: '#f5a623' }}>Submission waiting for your grade</p>
                  </div>
                  <span className="text-lg">📬</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Day-old messages */}
        {dayOldMsgs.length > 0 && (
          <section>
            <p className="tag-label mb-2">💬 Unsent Messages — Over 24hrs ({dayOldMsgs.length})</p>
            <div className="space-y-2">
              {dayOldMsgs.map(m => (
                <button key={m.id} onClick={() => { onClose(); setScreen('parentMessages') }}
                  className="w-full flex items-start gap-3 p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#0f1a2e', border: '1px solid #3b7ef420' }}>
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{m.studentName}</p>
                    <p style={{ fontSize: '10px', color: '#3b7ef4' }}>{m.subject} · {m.trigger} · waiting to be sent</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Missing answer keys */}
        {missingKeys.length > 0 && (
          <section>
            <p className="tag-label mb-2">🔑 No Answer Key ({missingKeys.length})</p>
            <div className="space-y-2">
              {missingKeys.map(a => (
                <div key={a.id} className="p-3 rounded-card" style={{ background: '#1a1a0a', border: '1px solid #f5a62320' }}>
                  <p className="font-semibold text-sm text-text-primary mb-1">{a.name}</p>
                  <p style={{ fontSize: '10px', color: '#f5a623' }} className="mb-2">{a.type} · no answer key uploaded</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onClose(); setScreen('camera') }}
                      className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                      style={{ background: '#f5a62320', color: '#f5a623' }}>
                      📎 Upload Key
                    </button>
                    <button onClick={() => useStore.getState().dismissKeyAlert(a.id)}
                      className="flex-1 py-1.5 rounded-pill text-xs font-semibold"
                      style={{ background: '#1e2231', color: '#6b7494' }}>
                      No key needed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-text-muted">All caught up! Nothing needs attention.</p>
          </div>
        )}
      </div>
    </Popup>
  )
}

// ── Needs Review modal ────────────────────────────────────────────────────────
function NeedsReviewModal({ onClose }) {
  const { students, grades, assignments, setActiveStudent } = useStore()

  // Find grades that were AI-generated and need teacher approval
  const aiGrades = grades.filter(g => g.aiGraded)
  const reviewItems = aiGrades.map(g => {
    const student = students.find(s => s.id === g.studentId)
    const assignment = assignments.find(a => a.id === g.assignmentId)
    return { grade: g, student, assignment }
  }).filter(item => item.student && item.assignment)

  // Also include flagged students whose work needs review
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

// ── Key Needed modal ──────────────────────────────────────────────────────────
function KeyNeededModal({ onClose }) {
  const { assignments, keyAlertsDismissed, dismissKeyAlert, setScreen } = useStore()
  const missing = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id))

  return (
    <Popup onClose={onClose} title={`🔑 Answer Keys Needed — ${missing.length} assignments`}>
      <div className="p-5 space-y-3">
        {missing.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-text-muted">All assignments have answer keys.</p>
          </div>
        )}
        {missing.map(a => (
          <div key={a.id} className="p-4 rounded-card" style={{ background: '#1a1a0a', border: '1px solid #f5a62330' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-text-primary">{a.name}</p>
                <p style={{ fontSize: '10px', color: '#f5a623' }} className="mt-0.5">{a.type} · {a.date} · no key uploaded</p>
              </div>
              <span className="text-2xl">🔑</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { onClose(); useStore.getState().setScreen('camera') }}
                className="flex-1 py-2 rounded-pill text-xs font-bold"
                style={{ background: '#f5a62320', color: '#f5a623' }}>
                📷 Scan / Upload Key
              </button>
              <button
                onClick={() => dismissKeyAlert(a.id)}
                className="flex-1 py-2 rounded-pill text-xs font-semibold"
                style={{ background: '#1e2231', color: '#6b7494' }}>
                ✕ No key needed
              </button>
            </div>
          </div>
        ))}
        <p className="text-center text-text-muted pb-2" style={{ fontSize: '10px' }}>
          "No key needed" removes this alert permanently for that assignment
        </p>
      </div>
    </Popup>
  )
}

// ── Daily Overview ────────────────────────────────────────────────────────────
function DailyOverview() {
  const { messages, getNeedsAttention, classes } = useStore()
  const pending = messages.filter(m => m.status === 'pending').length
  const attention = getNeedsAttention().length
  const [showReminders, setShowReminders] = useState(false)
  const [showAttention, setShowAttention] = useState(false)

  const reminders = [
    { text: 'Parent-teacher conferences Friday 3pm', icon: '📅' },
    { text: 'Submit grades by end of week', icon: '📝' },
  ]

  const stats = [
    { icon: '💬', value: pending, label: 'Pending Msgs', action: () => useStore.getState().setScreen('parentMessages') },
    { icon: '⚑', value: attention, label: 'Need Attention', action: () => setShowAttention(true) },
    { icon: '📚', value: classes.length, label: 'Classes', action: () => useStore.getState().setScreen('gradebook') },
    { icon: '🔔', value: reminders.length, label: 'Reminders', action: () => setShowReminders(true) },
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
            <button onClick={() => setShowReminders(false)} className="w-full py-2.5 rounded-pill text-sm font-bold text-white mt-2" style={{ background: 'var(--school-color)' }}>
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
      <div className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2" style={{ background: '#0fb8a020', color: '#0fb8a0', fontSize: '10px', fontWeight: 700 }}>
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
        <p className="text-text-muted mt-2" style={{ fontSize: '9px' }}>→ {lessons.length - doneIndex - 1} more lesson{lessons.length - doneIndex - 1 !== 1 ? 's' : ''} today</p>
      )}
    </div>
  )
}

// ── Needs Attention widget (full list, no limit) ───────────────────────────────
function NeedsAttentionWidget() {
  const { getNeedsAttention } = useStore()
  const students = getNeedsAttention()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">⚑ Needs Attention</p>
        <button onClick={() => useStore.getState().setScreen('parentMessages')}
          className="text-xs font-semibold px-2 py-1 rounded-pill"
          style={{ background: '#f04a4a20', color: '#f04a4a' }}>
          📩 Message all
        </button>
      </div>
      {students.length === 0 ? (
        <p className="text-text-muted text-sm">All students on track 🎉</p>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <button key={s.id} onClick={() => useStore.getState().setActiveStudent(s)}
              className="w-full flex items-center justify-between p-2 rounded-card hover:bg-elevated transition-colors text-left"
              style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}>
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
                <div className="flex items-center gap-1">
                  {m.dayOld && <Tag color="#f04a4a">24hr+</Tag>}
                  <Tag color="#f5a623">Pending</Tag>
                </div>
              </div>
              <p className="text-text-muted line-clamp-2" style={{ fontSize: '11px' }}>{m.draft}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-text-muted">AI tone: {m.tone}</span>
                <div className="flex gap-1 ml-auto">
                  {['👍', '❤️', '😂'].map(r => (
                    <button key={r} onClick={() => react(m.id, r)}
                      className="flex items-center gap-0.5 hover:scale-125 transition-transform text-xs"
                      title="React">
                      {r}{reactions[`${m.id}-${r}`] > 0 && <span style={{ fontSize: '9px', color: '#6b7494' }}>{reactions[`${m.id}-${r}`]}</span>}
                    </button>
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

// ── Lesson Plan widget ────────────────────────────────────────────────────────
function LessonPlanWidget() {
  const { lessons } = useStore()
  const lesson = lessons[0]

  return (
    <div className="widget">
      <p className="widget-title mb-3">Lesson Plan</p>
      {lesson ? (
        <>
          <p className="font-bold text-sm text-text-primary mb-1">{lesson.title}</p>
          <p className="text-text-muted mb-3" style={{ fontSize: '10px' }}>{lesson.period} Period · {lesson.subject} · {lesson.duration} min</p>
        </>
      ) : (
        <p className="text-text-muted text-sm mb-3">No lesson planned for today</p>
      )}
      <div className="flex gap-2">
        <button onClick={() => { useStore.getState().setLessonPlanMode('menu'); useStore.getState().setScreen('lessonPlan') }} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
          📖 View Plan
        </button>
        <button onClick={() => { useStore.getState().setLessonPlanMode('ai'); useStore.getState().setScreen('lessonPlan') }} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
          ✨ AI Generate
        </button>
        <button onClick={() => useStore.getState().setScreen('classFeed')} className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
          📤 Share
        </button>
      </div>
    </div>
  )
}

// ── Grading widget ────────────────────────────────────────────────────────────
function GradingWidget() {
  const [editWeights, setEditWeights] = useState(false)
  const [localWeights, setLocalWeights] = useState(null)
  const [showNeedsReview, setShowNeedsReview] = useState(false)
  const [showKeyNeeded, setShowKeyNeeded] = useState(false)
  const { weights, students, grades, assignments, keyAlertsDismissed } = useStore()
  const displayWeights = localWeights || weights

  const needsReview = students.filter(s => s.flagged).length + grades.filter(g => g.aiGraded).length
  const keyNeeded = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id)).length

  function openWeights() { setLocalWeights({ ...weights }); setEditWeights(true) }
  function saveWeights() { useStore.getState().updateWeights(localWeights); setEditWeights(false) }

  return (
    <>
      <div className="widget">
        <div className="flex items-center justify-between mb-3">
          <p className="widget-title">Grading</p>
          <Tag color="#22c97a">Synced ✓</Tag>
        </div>
        <p className="tag-label mb-2">Assignment weights · tap to edit</p>
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

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={() => setShowNeedsReview(true)}
            className="p-2 rounded-card text-left transition-all hover:scale-[1.02]"
            style={{ background: '#1c1012', border: '1px solid #f04a4a30' }}>
            <p className="font-bold" style={{ fontSize: '10px', color: '#f04a4a' }}>⚑ Needs Review</p>
            <p className="font-display font-bold text-lg text-white">{needsReview}</p>
            <p style={{ fontSize: '9px', color: '#6b7494' }}>AI-graded · tap to approve</p>
          </button>
          <button onClick={() => setShowKeyNeeded(true)}
            className="p-2 rounded-card text-left transition-all hover:scale-[1.02]"
            style={{ background: '#1a1a0a', border: '1px solid #f5a62330' }}>
            <p className="font-bold" style={{ fontSize: '10px', color: '#f5a623' }}>🔑 Key Needed</p>
            <p className="font-display font-bold text-lg text-white">{keyNeeded}</p>
            <p style={{ fontSize: '9px', color: '#6b7494' }}>No answer key · tap to upload</p>
          </button>
        </div>

        <button onClick={() => useStore.getState().setScreen('camera')}
          className="w-full py-4 rounded-card font-display font-bold text-lg transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, var(--school-color), #5c9ef8)', color: 'white' }}>
          📷 Scan / Grade
        </button>

        {/* Weights editor modal */}
        {editWeights && ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center" style={{zIndex:9999}} onClick={() => setEditWeights(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative bg-card border border-elevated rounded-widget p-6 w-full max-w-sm mx-4 animate-slide-up" style={{zIndex:10000}} onClick={e => e.stopPropagation()}>
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
        , document.body)}
      </div>

      {showNeedsReview && <NeedsReviewModal onClose={() => setShowNeedsReview(false)} />}
      {showKeyNeeded && <KeyNeededModal onClose={() => setShowKeyNeeded(false)} />}
    </>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
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
          <NeedsAttentionWidget />
        </div>
        <MyClasses />
        <ParentMessagesWidget />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LessonPlanWidget />
          <GradingWidget />
        </div>

        {/* Reports — single button at bottom instead of widget */}
        <button
          onClick={() => useStore.getState().setScreen('reports')}
          className="w-full py-3 rounded-card flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: '#161923', border: '1px solid #2a2f42' }}
        >
          <span className="text-xl">📊</span>
          <span className="font-semibold text-text-primary">View Reports</span>
          <span className="text-text-muted text-sm ml-auto">›</span>
        </button>
      </div>
    </div>
  )
}
