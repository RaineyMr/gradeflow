import React, { useState, useEffect, useMemo } from 'react'
import { useStore } from '@lib/store'
import { supabase } from '@lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, AlertCircle } from 'lucide-react'

const COLORS = {
  bg: '#060810',
  card: '#161923',
  inner: '#1e2231',
  raised: '#252b3d',
  text: '#eef0f8',
  soft: '#c8cce0',
  muted: '#6b7494',
  border: '#2a2f42',
  green: '#22c97a',
  blue: '#3b7ef4',
  red: '#f04a4a',
  amber: '#f5a623',
  purple: '#9b6ef5',
  teal: '#0fb8a0',
}

// ────────────────────────────────────────────────────────────────────────────
// MODAL: Create Lesson (AI / Build / Upload)
// ────────────────────────────────────────────────────────────────────────────
function CreateLessonModal({ date, isOpen, onClose, onCreateMode }) {
  if (!isOpen) return null

  const dateObj = new Date(date)
  const dateStr = dateObj.toISOString().split('T')[0]
  const displayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const modes = [
    {
      id: 'ai',
      icon: '✨',
      label: 'AI Generate',
      desc: 'Answer 3 questions → full lesson plan',
      color: COLORS.purple,
    },
    {
      id: 'build',
      icon: '📝',
      label: 'Build from Scratch',
      desc: 'Write your own lesson with guided sections',
      color: COLORS.blue,
    },
    {
      id: 'upload',
      icon: '📤',
      label: 'Upload Document',
      desc: 'PDF, Word, image — AI extracts lesson details',
      color: COLORS.teal,
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 8, 16, 0.85)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '100%',
          background: COLORS.card,
          borderRadius: '24px 24px 0 0',
          padding: '32px 20px',
          borderTop: `1px solid ${COLORS.border}`,
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, marginBottom: 4 }}>
              Create Lesson
            </h2>
            <div style={{ fontSize: 13, color: COLORS.muted }}>
              {displayDate}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.muted,
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                onCreateMode(dateStr, mode.id)
                onClose()
              }}
              style={{
                width: '100%',
                background: COLORS.inner,
                border: `1.5px solid ${mode.color}30`,
                borderRadius: 14,
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = mode.color
                e.currentTarget.style.background = COLORS.raised
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${mode.color}30`
                e.currentTarget.style.background = COLORS.inner
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${mode.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: `1px solid ${mode.color}44`,
                }}
              >
                {mode.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>
                  {mode.label}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
                  {mode.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: COLORS.border, margin: '24px 0' }} />

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '12px',
              color: COLORS.soft,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = COLORS.inner
              e.currentTarget.style.borderColor = COLORS.blue
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = COLORS.border
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            style={{
              background: COLORS.blue,
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Browse Templates
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// DAY CELL: Single calendar day with lessons
// ────────────────────────────────────────────────────────────────────────────
function DayCell({ date, lessons, isToday, isCurrentMonth, onAddClick, onDayClick }) {
  const dateObj = new Date(date)
  const dayNum = dateObj.getDate()
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

  return (
    <div
      onClick={() => onDayClick(date)}
      style={{
        borderRadius: 12,
        border: `1px solid ${isToday ? COLORS.blue : COLORS.border}`,
        background: isCurrentMonth ? (isToday ? COLORS.raised : COLORS.card) : 'transparent',
        padding: '12px 8px',
        minHeight: 120,
        cursor: isCurrentMonth ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        opacity: isCurrentMonth ? 1 : 0.4,
      }}
      onMouseEnter={e => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = COLORS.blue
          e.currentTarget.style.background = COLORS.raised
        }
      }}
      onMouseLeave={e => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = isToday ? COLORS.blue : COLORS.border
          e.currentTarget.style.background = isToday ? COLORS.raised : COLORS.card
        }
      }}
    >
      {/* Date header */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 10,
            color: COLORS.muted,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: 4,
          }}
        >
          {dayName}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: isToday ? COLORS.blue : COLORS.text,
          }}
        >
          {dayNum}
        </div>
      </div>

      {/* Lessons list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8, minHeight: 40 }}>
        {(lessons || []).slice(0, 2).map(lesson => (
          <div
            key={lesson.id}
            style={{
              fontSize: 9,
              padding: '3px 6px',
              borderRadius: 5,
              background: `${COLORS.blue}22`,
              color: COLORS.blue,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              border: `0.5px solid ${COLORS.blue}44`,
            }}
            title={lesson.title}
          >
            {lesson.title}
          </div>
        ))}
        {(lessons || []).length > 2 && (
          <div style={{ fontSize: 9, color: COLORS.muted, paddingLeft: 6 }}>
            +{lessons.length - 2} more
          </div>
        )}
      </div>

      {/* Add button */}
      {isCurrentMonth && (
        <button
          onClick={e => {
            e.stopPropagation()
            onAddClick(date)
          }}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${COLORS.green}15`,
            border: `1px solid ${COLORS.green}44`,
            color: COLORS.green,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${COLORS.green}30`
            e.currentTarget.style.borderColor = COLORS.green
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${COLORS.green}15`
            e.currentTarget.style.borderColor = `${COLORS.green}44`
          }}
          title="Add lesson"
          aria-label="Add lesson"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export default function LessonCalendar() {
  const { currentUser, lessons, activeLessonClassId } = useStore()

  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allLessons, setAllLessons] = useState([])

  // Load lessons on mount and when class changes
  useEffect(() => {
    loadLessons()
  }, [currentUser, activeLessonClassId])

  async function loadLessons() {
    try {
      setLoading(true)
      setError(null)

      const classId = activeLessonClassId || 1

      // Check if demo account
      const isDemo = currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')

      if (isDemo) {
        // Demo mode: use store data
        const classLessons = lessons[classId] || []
        setAllLessons(classLessons)
      } else {
        // Real mode: fetch from Supabase
        const { data, error: queryError } = await supabase
          .from('lessons')
          .select('*')
          .eq('class_id', classId)
          .order('lesson_date', { ascending: true })

        if (queryError) throw queryError

        // Map database rows to lesson objects
        const mapped = (data || []).map(row => ({
          id: row.id,
          classId: row.class_id,
          date: row.lesson_date,
          title: row.title || 'Untitled',
          duration: row.duration || 45,
          pages: row.pages || '',
          objective: row.plan_data?.objective || '',
          status: row.status || 'pending',
        }))

        setAllLessons(mapped)
      }
    } catch (err) {
      console.error('Load lessons error:', err)
      setError('Failed to load lessons. Showing demo data.')
      // Fallback to demo
      setAllLessons(lessons[activeLessonClassId || 1] || [])
    } finally {
      setLoading(false)
    }
  }

  // Group lessons by date (YYYY-MM-DD)
  const lessonsByDate = useMemo(() => {
    const grouped = {}
    allLessons.forEach(lesson => {
      if (!lesson.date) return
      const dateKey = typeof lesson.date === 'string'
        ? lesson.date.split('T')[0]
        : lesson.date.toISOString().split('T')[0]
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(lesson)
    })
    return grouped
  }, [allLessons])

  // Calendar grid calculation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Build calendar array (may include prev/next month dates)
  const calendarDays = []

  // Prev month filler
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push(new Date(year, month - 1, prevMonthLastDay - i))
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  // Next month filler
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(new Date(year, month + 1, day))
  }

  // Navigation
  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function handleAddClick(date) {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  function handleCreateMode(dateStr, mode) {
    // Route to appropriate creation page
    const routes = {
      ai: `/teacher/lessons?date=${dateStr}&mode=ai`,
      build: `/teacher/lessons?date=${dateStr}&mode=build`,
      upload: `/teacher/lessons?date=${dateStr}&mode=upload`,
    }
    window.location.href = routes[mode]
  }

  // Today's date
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  if (loading && allLessons.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: COLORS.muted,
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading calendar...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', paddingBottom: 120, background: COLORS.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: '0 0 8px 0' }}>
          Lesson Calendar
        </h1>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>
          {allLessons.length} {allLessons.length === 1 ? 'lesson' : 'lessons'} planned
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: `${COLORS.red}15`,
            border: `1px solid ${COLORS.red}44`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: COLORS.red,
            fontSize: 13,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: COLORS.red,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              background: COLORS.inner,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              color: COLORS.muted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.blue
              e.currentTarget.style.background = COLORS.raised
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.background = COLORS.inner
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0, minWidth: 180, textAlign: 'center' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={goToNextMonth}
            style={{
              background: COLORS.inner,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              color: COLORS.muted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.blue
              e.currentTarget.style.background = COLORS.raised
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.background = COLORS.inner
            }}
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={goToToday}
            style={{
              background: COLORS.inner,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              color: COLORS.soft,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.blue
              e.currentTarget.style.background = COLORS.raised
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.background = COLORS.inner
            }}
          >
            Today
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.location.href = '/teacher/lessons'}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 16px',
              color: COLORS.soft,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.blue
              e.currentTarget.style.background = COLORS.inner
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.background = 'none'
            }}
          >
            List View
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: 8,
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          marginBottom: 32,
        }}
      >
        {calendarDays.map((date, idx) => {
          const dateKey = date.toISOString().split('T')[0]
          const isCurrentMonth = date.getMonth() === month
          const isToday = dateKey === todayKey

          return (
            <DayCell
              key={idx}
              date={date}
              lessons={lessonsByDate[dateKey] || []}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onAddClick={handleAddClick}
              onDayClick={() => {
                // Could navigate to day view in future
              }}
            />
          )
        })}
      </div>

      {/* Create modal */}
      <CreateLessonModal
        date={selectedDate || new Date()}
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedDate(null)
        }}
        onCreateMode={handleCreateMode}
      />
    </div>
  )
}
