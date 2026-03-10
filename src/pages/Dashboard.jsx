import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore } from '../lib/store'
import { GradeBadge, TrendBadge, Tag } from '../components/ui'

// ── Portal modal shell ────────────────────────────────────────────────────────
// Renders at document.body so nothing in the page DOM can trap it.
function Modal({ onClose, title, children }) {
  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 520,
          margin: '0 16px 16px',
          background: '#161923',
          border: '1px solid #2a2f42',
          borderRadius: 16,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp .25s ease forwards',
          zIndex: 9001,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #2a2f42' }}>
          <span style={{ fontWeight: 700, color: '#eef0f8', fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ color: '#6b7494', fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Needs Attention modal ─────────────────────────────────────────────────────
function NeedsAttentionModal({ onClose }) {
  const { students, messages, assignments, keyAlertsDismissed, setScreen } = useStore()

  const belowPassing  = students.filter(s => s.grade < 70)
  const ungraded      = students.filter(s => s.submitUngraded)
  const dayOldMsgs    = messages.filter(m => m.status === 'pending' && m.dayOld)
  const missingKeys   = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id))
  const total         = belowPassing.length + ungraded.length + dayOldMsgs.length + missingKeys.length

  function openStudent(s) {
    onClose()
    useStore.getState().setActiveStudent(s)
  }

  return (
    <Modal onClose={onClose} title={`⚑ Needs Attention — ${total} items`}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {belowPassing.length > 0 && (
          <section>
            <p className="tag-label" style={{ marginBottom: 8 }}>📉 Below Passing ({belowPassing.length})</p>
            {belowPassing.map(s => (
              <button key={s.id} onClick={() => openStudent(s)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, marginBottom: 6, background: '#1c1012', border: '1px solid #f04a4a20', cursor: 'pointer', textAlign: 'left' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8' }}>{s.name}</p>
                  <p style={{ fontSize: 10, color: '#f04a4a' }}>{s.grade}% — below passing · tap to view</p>
                </div>
                <GradeBadge score={s.grade} />
              </button>
            ))}
          </section>
        )}

        {ungraded.length > 0 && (
          <section>
            <p className="tag-label" style={{ marginBottom: 8 }}>📬 Awaiting Grade ({ungraded.length})</p>
            {ungraded.map(s => (
              <button key={s.id} onClick={() => openStudent(s)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, marginBottom: 6, background: '#1a1a0a', border: '1px solid #f5a62320', cursor: 'pointer', textAlign: 'left' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8' }}>{s.name}</p>
                  <p style={{ fontSize: 10, color: '#f5a623' }}>Submission waiting for your grade</p>
                </div>
                <span style={{ fontSize: 20 }}>📬</span>
              </button>
            ))}
          </section>
        )}

        {dayOldMsgs.length > 0 && (
          <section>
            <p className="tag-label" style={{ marginBottom: 8 }}>💬 Unsent Messages Over 24hrs ({dayOldMsgs.length})</p>
            {dayOldMsgs.map(m => (
              <button key={m.id} onClick={() => { onClose(); setScreen('parentMessages') }}
                style={{ width: '100%', display: 'flex', gap: 12, padding: 12, borderRadius: 10, marginBottom: 6, background: '#0f1a2e', border: '1px solid #3b7ef420', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8' }}>{m.studentName}</p>
                  <p style={{ fontSize: 10, color: '#3b7ef4' }}>{m.subject} · {m.trigger} · unsent</p>
                </div>
              </button>
            ))}
          </section>
        )}

        {missingKeys.length > 0 && (
          <section>
            <p className="tag-label" style={{ marginBottom: 8 }}>🔑 No Answer Key ({missingKeys.length})</p>
            {missingKeys.map(a => (
              <div key={a.id} style={{ padding: 12, borderRadius: 10, marginBottom: 6, background: '#1a1a0a', border: '1px solid #f5a62320' }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8', marginBottom: 4 }}>{a.name}</p>
                <p style={{ fontSize: 10, color: '#f5a623', marginBottom: 8 }}>{a.type} · no key uploaded</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { onClose(); setScreen('camera') }}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f5a62320', color: '#f5a623', border: 'none', cursor: 'pointer' }}>
                    📎 Upload Key
                  </button>
                  <button onClick={() => useStore.getState().dismissKeyAlert(a.id)}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#1e2231', color: '#6b7494', border: 'none', cursor: 'pointer' }}>
                    No key needed
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {total === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ color: '#6b7494' }}>All caught up! Nothing needs attention.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Needs Review modal ────────────────────────────────────────────────────────
function NeedsReviewModal({ onClose }) {
  const { students, grades, assignments } = useStore()
  const aiGrades = grades.filter(g => g.aiGraded)
  const reviewItems = aiGrades.map(g => ({
    grade: g,
    student: students.find(s => s.id === g.studentId),
    assignment: assignments.find(a => a.id === g.assignmentId),
  })).filter(x => x.student && x.assignment)
  const flagged = students.filter(s => s.flagged && !aiGrades.find(g => g.studentId === s.id))

  return (
    <Modal onClose={onClose} title={`⚑ Needs Review — ${reviewItems.length + flagged.length} items`}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviewItems.map(({ grade, student, assignment }, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 10, background: '#1a1230', border: '1px solid #9b6ef530' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8' }}>{student.name}</p>
                <p style={{ fontSize: 10, color: '#9b6ef5' }}>{assignment.name} · AI scored {grade.score}%</p>
                {grade.aiConfidence === 'low' && <p style={{ fontSize: 9, color: '#f04a4a' }}>⚠ Low confidence — please verify</p>}
              </div>
              <GradeBadge score={grade.score} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { onClose(); useStore.getState().setActiveStudent(student) }}
                style={{ flex: 1, padding: '6px 0', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#9b6ef520', color: '#9b6ef5', border: 'none', cursor: 'pointer' }}>
                ✏ Review & Edit
              </button>
              <button style={{ flex: 1, padding: '6px 0', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#22c97a20', color: '#22c97a', border: 'none', cursor: 'pointer' }}>
                ✓ Approve
              </button>
            </div>
          </div>
        ))}
        {flagged.map(s => (
          <button key={s.id} onClick={() => { onClose(); useStore.getState().setActiveStudent(s) }}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: 12, borderRadius: 10, background: '#1c1012', border: '1px solid #f04a4a20', cursor: 'pointer', textAlign: 'left' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#eef0f8' }}>{s.name}</p>
              <p style={{ fontSize: 10, color: '#f04a4a' }}>Flagged · {s.grade}% · tap to review</p>
            </div>
            <GradeBadge score={s.grade} />
          </button>
        ))}
        {reviewItems.length === 0 && flagged.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: '#6b7494' }}>No AI grades waiting for review.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Key Needed modal ──────────────────────────────────────────────────────────
function KeyNeededModal({ onClose }) {
  const { assignments, keyAlertsDismissed, dismissKeyAlert } = useStore()
  const missing = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id))

  return (
    <Modal onClose={onClose} title={`🔑 Answer Keys Needed — ${missing.length}`}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {missing.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: '#6b7494' }}>All assignments have answer keys.</p>
          </div>
        )}
        {missing.map(a => (
          <div key={a.id} style={{ padding: 16, borderRadius: 10, background: '#1a1a0a', border: '1px solid #f5a62330' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 600, color: '#eef0f8', marginBottom: 2 }}>{a.name}</p>
                <p style={{ fontSize: 10, color: '#f5a623' }}>{a.type} · {a.date}</p>
              </div>
              <span style={{ fontSize: 24 }}>🔑</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { onClose(); useStore.getState().setScreen('camera') }}
                style={{ flex: 1, padding: '8px 0', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#f5a62320', color: '#f5a623', border: 'none', cursor: 'pointer' }}>
                📷 Scan / Upload Key
              </button>
              <button onClick={() => dismissKeyAlert(a.id)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#1e2231', color: '#6b7494', border: 'none', cursor: 'pointer' }}>
                ✕ No key needed
              </button>
            </div>
          </div>
        ))}
        <p style={{ textAlign: 'center', color: '#6b7494', fontSize: 10 }}>"No key needed" removes this alert permanently</p>
      </div>
    </Modal>
  )
}

// ── Daily Overview ────────────────────────────────────────────────────────────
function DailyOverview() {
  const { messages, getNeedsAttention, classes } = useStore()
  const pending   = messages.filter(m => m.status === 'pending').length
  const attention = getNeedsAttention().length

  const [showReminders, setShowReminders]     = useState(false)
  const [showAttention, setShowAttention]     = useState(false)

  const reminders = [
    { text: 'Parent-teacher conferences Friday 3pm', icon: '📅' },
    { text: 'Submit grades by end of week', icon: '📝' },
  ]

  const stats = [
    { icon: '💬', value: pending,           label: 'Pending Msgs',  action: () => useStore.getState().setScreen('parentMessages'), color: '#3b7ef4' },
    { icon: '⚑',  value: attention,         label: 'Need Attention', action: () => setShowAttention(true),                          color: '#f04a4a' },
    { icon: '📚', value: classes.length,    label: 'Classes',        action: () => useStore.getState().setScreen('gradebook'),      color: '#22c97a' },
    { icon: '🔔', value: reminders.length,  label: 'Reminders',      action: () => setShowReminders(true),                          color: '#f5a623' },
  ]

  return (
    <>
      <div className="rounded-widget p-4" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)' }}>
        <p className="tag-label mb-3">Daily Overview</p>
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => (
            // NOTE: No transform/scale on these buttons — transforms create stacking contexts
            // that can trap fixed-position portals in some browsers.
            <button
              key={s.label}
              onClick={s.action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.10)',
                border: 'none', cursor: 'pointer', transition: 'background .15s',
                minHeight: 80,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            >
              <span style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 24, color: '#fff' }}>{s.value}</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reminders popup */}
      {showReminders && (
        <Modal onClose={() => setShowReminders(false)} title="🔔 Reminders">
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reminders.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: '#1e2231' }}>
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <p style={{ fontSize: 13, color: '#eef0f8' }}>{r.text}</p>
              </div>
            ))}
            <button onClick={() => setShowReminders(false)}
              style={{ padding: '10px 0', borderRadius: 999, fontWeight: 700, color: '#fff', background: 'var(--school-color)', border: 'none', cursor: 'pointer', marginTop: 8, fontSize: 14 }}>
              Got it
            </button>
          </div>
        </Modal>
      )}

      {showAttention && <NeedsAttentionModal onClose={() => setShowAttention(false)} />}
    </>
  )
}

// ── Today's Lessons ───────────────────────────────────────────────────────────
function TodaysLessons() {
  const { lessons, setScreen } = useStore()
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
      <div className="flex items-center justify-between mb-1">
        <p className="tag-label">Today's Lessons</p>
        <Tag color="#22c97a">{doneIndex + 1}/{lessons.length}</Tag>
      </div>
      <p className="font-bold text-text-primary mb-0.5">{current.title}</p>
      <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>{current.period} Period · {current.subject} · {current.duration} min</p>
      <button onClick={() => setScreen('lessonPlan')} className="text-xs mb-3 block" style={{ color: '#22c97a' }}>
        Tap to expand ›
      </button>
      <div className="flex gap-2">
        <button onClick={() => setDoneIndex(i => Math.min(i + 1, lessons.length))}
          className="flex-1 py-2 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
          ✓ Done
        </button>
        <button onClick={() => setDoneIndex(i => Math.min(i + 1, lessons.length))}
          className="flex-1 py-2 rounded-pill text-xs font-semibold" style={{ background: '#1e2231', color: '#6b7494' }}>
          TBC
        </button>
      </div>
    </div>
  )
}

// ── My Classes ────────────────────────────────────────────────────────────────
function MyClasses() {
  const { classes, setActiveClass } = useStore()

  return (
    <div className="widget">
      <p className="widget-title mb-3">My Classes</p>
      <div className="grid grid-cols-2 gap-3">
        {classes.map(cls => (
          <button key={cls.id} onClick={() => setActiveClass(cls)}
            className="p-3 rounded-card text-left transition-all hover:scale-[1.01]"
            style={{ background: '#0c0e14', border: `1px solid ${cls.color}30` }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-bold text-xs" style={{ color: cls.color }}>{cls.period} Period</p>
                <p className="font-semibold text-sm text-text-primary">{cls.subject}</p>
              </div>
              <TrendBadge trend={cls.trend} />
            </div>
            <p className="font-display font-bold text-2xl text-white mb-0.5">{cls.gpa}</p>
            <p className="text-text-muted" style={{ fontSize: '9px' }}>{cls.students} students</p>
            {cls.gpa < 70 && (
              <p className="mt-1 font-bold" style={{ fontSize: '9px', color: '#f04a4a' }}>⚑ Needs attention</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Needs Attention widget ────────────────────────────────────────────────────
function NeedsAttentionWidget() {
  const { students, setActiveStudent, setScreen } = useStore()
  const attention = students.filter(s => s.grade < 70 || s.flagged || s.submitUngraded)

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Needs Attention</p>
        {attention.length > 0 && (
          <button onClick={() => setScreen('parentMessages')}
            className="py-1 px-3 rounded-pill text-xs font-bold" style={{ background: '#f04a4a20', color: '#f04a4a' }}>
            📩 Message All
          </button>
        )}
      </div>
      {attention.length === 0 ? (
        <p className="text-text-muted text-sm">Everyone is on track 🎉</p>
      ) : (
        <div className="space-y-2">
          {attention.map(s => (
            <button key={s.id} onClick={() => setActiveStudent(s)}
              className="w-full flex items-center justify-between p-2 rounded-card text-left transition-all hover:bg-elevated"
              style={{ background: '#0c0e14' }}>
              <div>
                <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                <p style={{ fontSize: '10px', color: '#f04a4a' }}>
                  {s.submitUngraded ? 'Submitted work awaiting grade' : s.flagged ? `Flagged · ${s.grade}%` : `${s.grade}% — failing`}
                </p>
              </div>
              <GradeBadge score={s.grade} />
            </button>
          ))}
          <button onClick={() => setScreen('gradebook')} className="w-full text-center text-xs py-1" style={{ color: '#3b7ef4' }}>
            View all in gradebook ›
          </button>
        </div>
      )}
    </div>
  )
}

// ── Parent Messages widget ────────────────────────────────────────────────────
function ParentMessagesWidget() {
  const { messages, setScreen } = useStore()
  const [reactions, setReactions] = useState({})

  function react(msgId, emoji) {
    setReactions(r => ({ ...r, [`${msgId}-${emoji}`]: (r[`${msgId}-${emoji}`] || 0) + 1 }))
  }

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Parent Messages</p>
        <button onClick={() => setScreen('parentMessages')} className="text-xs" style={{ color: '#3b7ef4' }}>View All ›</button>
      </div>
      <p className="tag-label mb-2">Every negative trigger has a positive version · AI writes both</p>
      <div className="space-y-2">
        {messages.map(m => (
          <div key={m.id} className="p-3 rounded-card" style={{ background: '#0f1a2e', border: '1px solid #3b7ef420' }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-sm text-text-primary">{m.studentName}</p>
                <p style={{ fontSize: '10px', color: '#6b7494' }}>{m.subject} · {m.trigger}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-pill" style={{ background: m.status === 'pending' ? '#f5a62320' : '#22c97a20', color: m.status === 'pending' ? '#f5a623' : '#22c97a' }}>
                {m.status === 'pending' ? 'Pending' : 'Sent'}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {['👍', '❤️', '😂'].map(emoji => (
                <button key={emoji} onClick={() => react(m.id, emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-pill transition-all"
                  style={{ background: '#1e2231', fontSize: 11, color: '#eef0f8' }}>
                  {emoji} <span style={{ fontSize: 9, color: '#6b7494' }}>{reactions[`${m.id}-${emoji}`] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
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
          <p className="font-bold text-sm text-text-primary mb-0.5">{lesson.title}</p>
          <p className="text-text-muted mb-3" style={{ fontSize: '10px' }}>{lesson.period} Period · {lesson.subject} · {lesson.duration} min</p>
        </>
      ) : (
        <p className="text-text-muted text-sm mb-3">No lesson planned for today</p>
      )}
      <div className="flex gap-2">
        <button onClick={() => { useStore.getState().setLessonPlanMode('menu'); useStore.getState().setScreen('lessonPlan') }}
          className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#3b7ef420', color: '#3b7ef4' }}>
          📖 View Plan
        </button>
        <button onClick={() => { useStore.getState().setLessonPlanMode('ai'); useStore.getState().setScreen('lessonPlan') }}
          className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#9b6ef520', color: '#9b6ef5' }}>
          ✨ AI Generate
        </button>
        <button onClick={() => useStore.getState().setScreen('classFeed')}
          className="flex-1 py-1.5 rounded-pill text-xs font-bold" style={{ background: '#22c97a20', color: '#22c97a' }}>
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
  const display = localWeights || weights

  const needsReview = students.filter(s => s.flagged).length + grades.filter(g => g.aiGraded).length
  const keyNeeded   = assignments.filter(a => !a.hasKey && !keyAlertsDismissed.includes(a.id)).length

  function openWeights() { setLocalWeights({ ...weights }); setEditWeights(true) }
  function saveWeights()  { useStore.getState().updateWeights(localWeights); setEditWeights(false) }

  return (
    <>
      <div className="widget">
        <div className="flex items-center justify-between mb-3">
          <p className="widget-title">Grading</p>
          <Tag color="#22c97a">Synced ✓</Tag>
        </div>

        <p className="tag-label mb-2">Assignment weights · tap to edit</p>
        <div className="flex gap-1.5 mb-4">
          {Object.entries(display).map(([type, w]) => (
            <button key={type} onClick={openWeights}
              className="flex-1 text-center p-2 rounded-card transition-all hover:bg-elevated"
              style={{ background: '#1e2231', border: 'none', cursor: 'pointer' }}>
              <div className="text-xs font-bold mb-1" style={{ color: '#6b7494', fontSize: '9px' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              <span className="font-bold text-sm" style={{ color: '#eef0f8' }}>{w}%</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={() => setShowNeedsReview(true)}
            className="p-2 rounded-card text-left"
            style={{ background: '#1c1012', border: '1px solid #f04a4a30', cursor: 'pointer' }}>
            <p className="font-bold" style={{ fontSize: '10px', color: '#f04a4a' }}>⚑ Needs Review</p>
            <p className="font-display font-bold text-lg text-white">{needsReview}</p>
            <p style={{ fontSize: '9px', color: '#6b7494' }}>AI-graded · tap to approve</p>
          </button>
          <button onClick={() => setShowKeyNeeded(true)}
            className="p-2 rounded-card text-left"
            style={{ background: '#1a1a0a', border: '1px solid #f5a62330', cursor: 'pointer' }}>
            <p className="font-bold" style={{ fontSize: '10px', color: '#f5a623' }}>🔑 Key Needed</p>
            <p className="font-display font-bold text-lg text-white">{keyNeeded}</p>
            <p style={{ fontSize: '9px', color: '#6b7494' }}>No answer key · tap to upload</p>
          </button>
        </div>

        <button onClick={() => useStore.getState().setScreen('camera')}
          className="w-full py-4 rounded-card font-display font-bold text-lg"
          style={{ background: 'linear-gradient(135deg, var(--school-color), #5c9ef8)', color: 'white', border: 'none', cursor: 'pointer' }}>
          📷 Scan / Grade
        </button>
      </div>

      {/* Weights modal */}
      {editWeights && (
        <Modal onClose={() => setEditWeights(false)} title="Assignment Weights">
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {Object.entries(localWeights).map(([type, w]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, color: '#eef0f8', textTransform: 'capitalize' }}>{type}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" min="0" max="100"
                      style={{ width: 64, background: '#1e2231', border: '1px solid #2a2f42', borderRadius: 8, padding: '4px 8px', color: '#eef0f8', textAlign: 'center', fontSize: 13 }}
                      value={w}
                      onChange={e => setLocalWeights(lw => ({ ...lw, [type]: Number(e.target.value) }))} />
                    <span style={{ color: '#6b7494', fontSize: 13 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#6b7494', marginBottom: 16 }}>
              Total: {Object.values(localWeights).reduce((a, b) => a + b, 0)}% (should equal 100%)
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditWeights(false)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 999, fontSize: 13, background: '#1e2231', color: '#6b7494', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveWeights}
                style={{ flex: 1, padding: '8px 0', borderRadius: 999, fontSize: 13, fontWeight: 700, background: 'var(--school-color)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showNeedsReview && <NeedsReviewModal onClose={() => setShowNeedsReview(false)} />}
      {showKeyNeeded  && <KeyNeededModal   onClose={() => setShowKeyNeeded(false)} />}
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { teacher } = useStore()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-primary">
          Good morning, {teacher.name} 👋
        </h1>
        <p className="text-text-muted text-sm">
          {teacher.school} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
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

        {/* Reports — single button at bottom, not a widget */}
        <button
          onClick={() => useStore.getState().setScreen('reports')}
          className="w-full py-3 rounded-card flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: '#161923', border: '1px solid #2a2f42', cursor: 'pointer' }}
        >
          <span className="text-xl">📊</span>
          <span className="font-semibold text-text-primary">View Reports</span>
          <span className="text-text-muted text-sm ml-auto">›</span>
        </button>
      </div>
    </div>
  )
}
