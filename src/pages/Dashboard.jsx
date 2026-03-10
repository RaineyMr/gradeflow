import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore } from '../lib/store'
import { GradeBadge, TrendBadge } from '../components/ui'

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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-elevated">
          <h3 className="font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}

function NeedsAttentionModal({ onClose }) {
  const {
    students,
    messages,
    assignments,
    keyAlertsDismissed,
    dismissKeyAlert,
  } = useStore()

  const belowPassing = students.filter((student) => student.grade < 70)
  const ungraded = students.filter((student) => student.submitUngraded)
  const dayOldMessages = messages.filter(
    (message) => message.status === 'pending' && message.dayOld
  )
  const missingKeys = assignments.filter(
    (assignment) => !assignment.hasKey && !keyAlertsDismissed.includes(assignment.id)
  )

  const totalCount =
    belowPassing.length +
    ungraded.length +
    dayOldMessages.length +
    missingKeys.length

  function goToStudent(student) {
    onClose()
    useStore.getState().setActiveStudent(student)
  }

  return (
    <Popup onClose={onClose} title={`⚑ Needs Attention — ${totalCount} items`}>
      <div className="p-5 space-y-5">
        {belowPassing.length > 0 && (
          <section>
            <p className="tag-label mb-2">📉 Below Passing ({belowPassing.length})</p>
            <div className="space-y-2">
              {belowPassing.map((student) => (
                <button
                  key={student.id}
                  onClick={() => goToStudent(student)}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#1c1012', border: '1px solid #f04a4a20' }}
                >
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{student.name}</p>
                    <p className="text-danger" style={{ fontSize: '10px' }}>
                      {student.grade}% — below passing · tap to view
                    </p>
                  </div>
                  <GradeBadge score={student.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {ungraded.length > 0 && (
          <section>
            <p className="tag-label mb-2">
              📬 Submitted — Awaiting Grade ({ungraded.length})
            </p>
            <div className="space-y-2">
              {ungraded.map((student) => (
                <button
                  key={student.id}
                  onClick={() => goToStudent(student)}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#1a1a0a', border: '1px solid #f5a62320' }}
                >
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{student.name}</p>
                    <p style={{ fontSize: '10px', color: '#f5a623' }}>
                      Submitted — ungraded · tap to grade
                    </p>
                  </div>
                  <GradeBadge score={student.grade} />
                </button>
              ))}
            </div>
          </section>
        )}

        {dayOldMessages.length > 0 && (
          <section>
            <p className="tag-label mb-2">
              💬 Unsent Parent Messages ({dayOldMessages.length})
            </p>
            <div className="space-y-2">
              {dayOldMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => {
                    onClose()
                    useStore.getState().setScreen('parentMessages')
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-card text-left transition-all hover:bg-elevated"
                  style={{ background: '#0f1a2e', border: '1px solid #3b7ef430' }}
                >
                  <div>
                    <p className="font-semibold text-sm text-text-primary">
                      {message.studentName}
                    </p>
                    <p style={{ fontSize: '10px', color: '#3b7ef4' }}>
                      Triggered: {message.trigger} · tap to send
                    </p>
                  </div>
                  <span className="text-xl">💬</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {missingKeys.length > 0 && (
          <section>
            <p className="tag-label mb-2">
              🔑 Missing Answer Keys ({missingKeys.length})
            </p>
            <div className="space-y-2">
              {missingKeys.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-card"
                  style={{ background: '#1a1a0a', border: '1px solid #f5a62330' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">
                        {assignment.name}
                      </p>
                      <p style={{ fontSize: '10px', color: '#f5a623' }}>
                        {assignment.type} · {assignment.date} · no key uploaded
                      </p>
                    </div>
                    <span className="text-xl">🔑</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose()
                        useStore.getState().setScreen('camera')
                      }}
                      className="flex-1 py-1.5 rounded-pill text-xs font-bold"
                      style={{ background: '#f5a62320', color: '#f5a623' }}
                    >
                      📷 Scan / Upload Key
                    </button>
                    <button
                      onClick={() => dismissKeyAlert(assignment.id)}
                      className="flex-1 py-1.5 rounded-pill text-xs font-semibold"
                      style={{ background: '#1e2231', color: '#6b7494' }}
                    >
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

function DailyOverview() {
  const { messages, getNeedsAttention, classes } = useStore()
  const pending = messages.filter((message) => message.status === 'pending').length
  const attention = getNeedsAttention().length
  const [showReminders, setShowReminders] = useState(false)
  const [showAttention, setShowAttention] = useState(false)

  const reminders = [
    { text: 'Parent-teacher conferences Friday 3pm', icon: '📅' },
    { text: 'Submit grades by end of week', icon: '📝' },
  ]

  const stats = [
    {
      icon: '💬',
      value: pending,
      label: 'Pending Msgs',
      action: () => useStore.getState().setScreen('parentMessages'),
    },
    {
      icon: '⚑',
      value: attention,
      label: 'Need Attention',
      action: () => setShowAttention(true),
    },
    {
      icon: '📚',
      value: classes.length,
      label: 'Classes',
      action: () => useStore.getState().setScreen('gradebook'),
    },
    {
      icon: '🔔',
      value: reminders.length,
      label: 'Reminders',
      action: () => setShowReminders(true),
    },
  ]

  return (
    <>
      <div
        className="rounded-widget p-4"
        style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)' }}
      >
        <p className="tag-label mb-3">Daily Overview</p>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <button
              key={stat.label}
              className="stat-box hover:scale-[1.04] transition-transform"
              onClick={stat.action}
            >
              <span className="text-xl mb-1">{stat.icon}</span>
              <span className="font-display font-bold text-2xl text-white">
                {stat.value}
              </span>
              <span
                className="text-xs mt-1 text-center leading-tight"
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px' }}
              >
                {stat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showReminders && (
        <Popup onClose={() => setShowReminders(false)} title="🔔 Reminders">
          <div className="p-5 space-y-3">
            {reminders.map((reminder, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-card"
                style={{ background: '#1e2231' }}
              >
                <span className="text-xl">{reminder.icon}</span>
                <p className="text-sm text-text-primary">{reminder.text}</p>
              </div>
            ))}
            <button
              onClick={() => setShowReminders(false)}
              className="w-full py-2.5 rounded-pill text-sm font-bold text-white mt-2"
              style={{ background: 'var(--school-color)' }}
            >
              Got it
            </button>
          </div>
        </Popup>
      )}

      {showAttention && <NeedsAttentionModal onClose={() => setShowAttention(false)} />}
    </>
  )
}

function LessonCalendarModal({ onClose, onSelectDay }) {
  const { lessons } = useStore()
  const [calView, setCalView] = useState('week')

  const today = new Date()
  const todayStr = today.toDateString()

  function getWeekDays() {
    const days = []
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return days
  }

  function getMonthDays() {
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const weekDays = getWeekDays()
  const monthDays = getMonthDays()

  const lessonDays = new Set([
    todayStr,
    new Date(today.getTime() - 86400000).toDateString(),
    new Date(today.getTime() + 86400000).toDateString(),
    new Date(today.getTime() + 2 * 86400000).toDateString(),
  ])

  function getDayOffset(date) {
    const selected = new Date(date)
    selected.setHours(0, 0, 0, 0)

    const base = new Date()
    base.setHours(0, 0, 0, 0)

    const diff = selected.getTime() - base.getTime()
    return Math.round(diff / 86400000)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <Popup onClose={onClose} title="📅 Lesson Calendar">
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {['day', 'week', 'month'].map((view) => (
            <button
              key={view}
              onClick={() => setCalView(view)}
              className="flex-1 py-1.5 rounded-pill text-xs font-bold capitalize transition-all"
              style={{
                background: calView === view ? 'var(--school-color)' : '#1e2231',
                color: calView === view ? 'white' : '#6b7494',
              }}
            >
              {view}
            </button>
          ))}
        </div>

        {calView === 'day' && (
          <div className="space-y-2">
            <p className="tag-label mb-3">
              Today —{' '}
              {today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  onSelectDay(0)
                  onClose()
                }}
                className="w-full p-3 rounded-card text-left hover:bg-elevated transition-colors"
                style={{ background: '#1e2231', borderLeft: '3px solid #0fb8a0' }}
              >
                <p className="font-bold text-sm text-text-primary">{lesson.title}</p>
                <p className="text-text-muted" style={{ fontSize: '10px' }}>
                  {lesson.period} Period · {lesson.subject} · {lesson.duration} min
                </p>
              </button>
            ))}
          </div>
        )}

        {calView === 'week' && (
          <div>
            <p className="tag-label mb-3">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="text-center"
                  style={{ fontSize: '9px', color: '#6b7494', fontWeight: 700 }}
                >
                  {dayName}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === todayStr
                const hasLesson = lessonDays.has(day.toDateString())
                const offset = getDayOffset(day)

                return (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectDay(offset)
                      onClose()
                    }}
                    className="aspect-square rounded-card flex flex-col items-center justify-center transition-all hover:bg-elevated"
                    style={{
                      background: isToday ? 'var(--school-color)' : '#1e2231',
                      border:
                        hasLesson && !isToday
                          ? '1px solid #0fb8a040'
                          : '1px solid transparent',
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{ color: isToday ? 'white' : '#eef0f8' }}
                    >
                      {day.getDate()}
                    </span>
                    {hasLesson && (
                      <div
                        className="w-1 h-1 rounded-full mt-0.5"
                        style={{ background: isToday ? 'white' : '#0fb8a0' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-text-muted mt-3 text-center" style={{ fontSize: '10px' }}>
              ● = lesson planned
            </p>
          </div>
        )}

        {calView === 'month' && (
          <div>
            <p className="tag-label mb-3">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="text-center"
                  style={{ fontSize: '9px', color: '#6b7494', fontWeight: 700 }}
                >
                  {dayName}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => {
                if (!day) return <div key={index} />

                const isToday = day.toDateString() === todayStr
                const hasLesson = lessonDays.has(day.toDateString())
                const offset = getDayOffset(day)

                return (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectDay(offset)
                      onClose()
                    }}
                    className="aspect-square rounded flex flex-col items-center justify-center transition-all hover:bg-elevated"
                    style={{
                      background: isToday ? 'var(--school-color)' : 'transparent',
                      fontSize: '11px',
                    }}
                  >
                    <span
                      style={{
                        color: isToday ? 'white' : '#eef0f8',
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {day.getDate()}
                    </span>
                    {hasLesson && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: isToday ? 'white' : '#0fb8a0' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-text-muted mt-3 text-center" style={{ fontSize: '10px' }}>
              ● = lesson planned
            </p>
          </div>
        )}
      </div>
    </Popup>
  )
}

function TodaysLessons() {
  const { lessons } = useStore()
  const [doneIndex, setDoneIndex] = useState(0)
  const [dayOffset, setDayOffset] = useState(0)
  const [showCalendar, setShowCalendar] = useState(false)
  const touchStartX = useRef(null)

  const displayDate = new Date()
  displayDate.setDate(displayDate.getDate() + dayOffset)

  const isToday = dayOffset === 0
  const dayLabel = isToday
    ? "Today's Lessons"
    : dayOffset === -1
      ? "Yesterday's Lessons"
      : dayOffset === 1
        ? "Tomorrow's Lessons"
        : displayDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })

  const mockLessonsByOffset = {
    '-1': [
      {
        id: 'prev1',
        period: '1st',
        subject: 'Math',
        title: 'Ch.3 · Multiplication Review',
        pages: '70-83',
        duration: 45,
      },
    ],
    '0': lessons,
    '1': [
      {
        id: 'next1',
        period: '1st',
        subject: 'Math',
        title: 'Ch.5 · Problem Solving',
        pages: '92-99',
        duration: 45,
      },
      {
        id: 'next2',
        period: '2nd',
        subject: 'Reading',
        title: 'Ch.8 · Main Idea & Details',
        pages: '116-128',
        duration: 50,
      },
    ],
    '2': [
      {
        id: 'day2',
        period: '3rd',
        subject: 'Science',
        title: 'Lab: Ecosystems Introduction',
        pages: '44-51',
        duration: 55,
      },
    ],
  }

  const dayLessons = mockLessonsByOffset[String(dayOffset)] || []
  const current = dayLessons[doneIndex] || null

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return

    const deltaX = event.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        setDayOffset((value) => value + 1)
      } else {
        setDayOffset((value) => value - 1)
      }
      setDoneIndex(0)
    }

    touchStartX.current = null
  }

  function openLessonPlan() {
    useStore.getState().setLessonPlanMode('menu')
    useStore.getState().setScreen('lessonPlan')
  }

  function goToPreviousDay(event) {
    event.stopPropagation()
    setDayOffset((value) => value - 1)
    setDoneIndex(0)
  }

  function goToNextDay(event) {
    event.stopPropagation()
    setDayOffset((value) => value + 1)
    setDoneIndex(0)
  }

  function markDone() {
    setDoneIndex((index) => Math.min(index + 1, Math.max(dayLessons.length - 1, 0)))
  }

  return (
    <>
      <div
        className="rounded-widget p-4 cursor-pointer transition-all hover:brightness-110 select-none"
        style={{
          background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)',
          border: '1px solid #1a3a2a',
        }}
        onClick={openLessonPlan}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="tag-label">{dayLabel}</p>
          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
            <button
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-full transition-colors hover:bg-elevated text-text-muted"
              onClick={goToPreviousDay}
              title="Previous day"
              aria-label="Previous day"
            >
              ‹
            </button>
            <button
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-full transition-colors hover:bg-elevated text-text-muted"
              onClick={goToNextDay}
              title="Next day"
              aria-label="Next day"
            >
              ›
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-elevated"
              onClick={(event) => {
                event.stopPropagation()
                setShowCalendar(true)
              }}
              title="View calendar"
              aria-label="View calendar"
            >
              <span style={{ fontSize: '16px' }}>📅</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2 md:hidden">
          {[-1, 0, 1, 2].map((offset) => (
            <div
              key={offset}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: dayOffset === offset ? '#0fb8a0' : '#1e3a2a' }}
            />
          ))}
          <span className="text-text-muted ml-1" style={{ fontSize: '9px' }}>
            swipe to navigate
          </span>
        </div>

        {current ? (
          <>
            <div
              className="inline-flex items-center px-2 py-0.5 rounded-pill mb-2"
              style={{
                background: '#0fb8a020',
                color: '#0fb8a0',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {current.period} Period · {current.subject}
            </div>
            <p className="font-display font-bold text-base text-text-primary mb-1">
              {current.title}
            </p>
            <p className="text-text-muted mb-3" style={{ fontSize: '11px' }}>
              Pages {current.pages} · {current.duration} min
            </p>
            <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
              <button
                onClick={markDone}
                className="flex-1 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
                style={{
                  background: '#22c97a22',
                  color: '#22c97a',
                  border: '1px solid #22c97a40',
                }}
              >
                ✓ Done
              </button>
              <button
                onClick={openLessonPlan}
                className="px-4 py-1.5 rounded-pill text-xs font-bold transition-all hover:opacity-90"
                style={{
                  background: '#3b7ef422',
                  color: '#3b7ef4',
                  border: '1px solid #3b7ef440',
                }}
              >
                View Plan →
              </button>
            </div>
            {doneIndex < dayLessons.length - 1 && (
              <p className="text-text-muted mt-2" style={{ fontSize: '9px' }}>
                → {dayLessons.length - doneIndex - 1} more lesson
                {dayLessons.length - doneIndex - 1 !== 1 ? 's' : ''} {isToday ? 'today' : 'this day'}
              </p>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">
            {isToday ? 'All lessons complete for today 🎉' : 'No lessons planned for this day'}
          </p>
        )}

        <p className="text-text-muted mt-2" style={{ fontSize: '9px', opacity: 0.6 }}>
          tap anywhere to open full lesson plan
        </p>
      </div>

      {showCalendar && (
        <LessonCalendarModal
          onClose={() => setShowCalendar(false)}
          onSelectDay={(offset) => {
            setDayOffset(offset)
            setDoneIndex(0)
          }}
        />
      )}
    </>
  )
}

function NeedsAttentionWidget() {
  const { getNeedsAttention } = useStore()
  const students = getNeedsAttention()
  const [showModal, setShowModal] = useState(false)

  function goToStudent(event, student) {
    event.stopPropagation()
    useStore.getState().setActiveStudent(student)
  }

  return (
    <>
      <div
        className="widget cursor-pointer transition-colors hover:bg-elevated/40"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="widget-title">
            ⚑ Needs Attention
            {students.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-pill font-bold"
                style={{ background: '#f04a4a20', color: '#f04a4a', fontSize: '10px' }}
              >
                {students.length}
              </span>
            )}
          </p>
          <button
            onClick={(event) => {
              event.stopPropagation()
              setShowModal(true)
            }}
            className="text-xs font-semibold px-2 py-1 rounded-pill transition-opacity hover:opacity-70"
            style={{ background: '#f04a4a20', color: '#f04a4a' }}
          >
            View all →
          </button>
        </div>

        {students.length === 0 ? (
          <p className="text-text-muted text-sm">All students on track 🎉</p>
        ) : (
          <div className="space-y-2">
            {students.slice(0, 3).map((student) => (
              <button
                key={student.id}
                onClick={(event) => goToStudent(event, student)}
                className="w-full flex items-center justify-between p-2.5 rounded-card text-left hover:bg-elevated transition-colors"
                style={{ background: '#1c1012', border: '1px solid #f04a4a15' }}
              >
                <div>
                  <p className="font-semibold text-sm text-text-primary">{student.name}</p>
                  <p className="text-danger" style={{ fontSize: '10px' }}>
                    {student.grade < 70
                      ? `${student.grade}% — below passing`
                      : student.submitUngraded
                        ? 'Submitted — ungraded'
                        : 'Flagged for review'}
                  </p>
                </div>
                <GradeBadge score={student.grade} />
              </button>
            ))}

            {students.length > 3 && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setShowModal(true)
                }}
                className="w-full text-center text-xs font-semibold py-2 rounded-card transition-opacity hover:opacity-70"
                style={{ background: '#1e2231', color: '#f04a4a' }}
              >
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

function MyClasses() {
  const { classes } = useStore()

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">My Classes</p>
        <button
          onClick={() => useStore.getState().setScreen('gradebook')}
          className="text-accent text-xs font-semibold"
        >
          + Add
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {classes.map((classItem) => (
          <button
            key={classItem.id}
            onClick={() => useStore.getState().setActiveClass(classItem)}
            className="p-3 rounded-card text-left transition-all hover:scale-[1.02]"
            style={{ background: '#1e2231', borderLeft: `3px solid ${classItem.color}` }}
          >
            <p className="font-bold text-sm text-text-primary">
              {classItem.period} · {classItem.subject}
            </p>
            <p className="text-text-muted mb-2" style={{ fontSize: '10px' }}>
              {classItem.students} students
            </p>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white">
                {classItem.gpa}
              </span>
              <TrendBadge trend={classItem.trend} />
            </div>
            {classItem.gpa < 70 && (
              <span className="text-danger" style={{ fontSize: '9px' }}>
                ⚑ Needs attention
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function ParentMessagesWidget() {
  const { messages } = useStore()
  const pending = messages.filter((message) => message.status === 'pending')

  return (
    <div className="widget">
      <div className="flex items-center justify-between mb-3">
        <p className="widget-title">Parent Messages</p>
        <button
          onClick={() => useStore.getState().setScreen('parentMessages')}
          className="text-accent text-xs font-semibold"
        >
          View all →
        </button>
      </div>

      {pending.length === 0 ? (
        <p className="text-text-muted text-sm">No pending messages 📭</p>
      ) : (
        <div className="space-y-2">
          {pending.slice(0, 2).map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-card"
              style={{ background: '#0f1a2e', border: '1px solid #3b7ef420' }}
            >
              <p className="font-semibold text-sm text-text-primary mb-0.5">
                {message.studentName}
              </p>
              <p style={{ fontSize: '10px', color: '#3b7ef4' }}>
                {message.trigger}
              </p>
            </div>
          ))}

          {pending.length > 2 && (
            <button
              onClick={() => useStore.getState().setScreen('parentMessages')}
              className="w-full text-center text-xs font-semibold py-2 rounded-card"
              style={{ background: '#1e2231', color: '#6b7494' }}
            >
              +{pending.length - 2} more →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { teacher } = useStore()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const teacherFirstName = teacher?.name?.split(' ')[0] || teacher?.name || 'Teacher'

  return (
    <div className="space-y-4 pb-6">
      <div className="pt-2 pb-1">
        <h1 className="font-display font-bold text-2xl text-text-primary">
          {greeting}, {teacherFirstName} 👋
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