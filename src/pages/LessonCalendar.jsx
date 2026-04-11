import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'
import { supabase } from '@lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import CurriculumPrepopulate from '@components/curriculum/CurriculumPrepopulate'

const C = {
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

// ── Day cell with lessons for that date ────────────────────────────────────
function DayCell({ date, lessons, isToday, onSelectDay }) {
  const dateObj = new Date(date)
  const dayNum = dateObj.getDate()
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

  return (
    <div
      onClick={() => onSelectDay(date)}
      style={{
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background: isToday ? C.raised : C.card,
        padding: '12px 8px',
        minHeight: 120,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--school-color, ' + C.blue + ')'
        e.currentTarget.style.background = C.raised
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.border
        e.currentTarget.style.background = isToday ? C.raised : C.card
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
          {dayName}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? 'var(--school-color, ' + C.blue + ')' : C.text }}>
          {dayNum}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {(lessons || []).slice(0, 2).map(lesson => (
          <div
            key={lesson.id}
            style={{
              fontSize: 10,
              padding: '4px 6px',
              borderRadius: 6,
              background: 'rgba(59, 126, 244, 0.15)',
              color: C.blue,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lesson.title}
          </div>
        ))}
        {(lessons || []).length > 2 && (
          <div style={{ fontSize: 9, color: C.muted, paddingLeft: 6 }}>
            +{lessons.length - 2} more
          </div>
        )}
      </div>

      <button
        onClick={e => {
          e.stopPropagation()
        }}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'rgba(34, 201, 122, 0.1)',
          border: 'none',
          color: C.green,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(34, 201, 122, 0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(34, 201, 122, 0.1)'
        }}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

// ── Lesson Options Modal (AI / Build / Upload) ────────────────────────────
function LessonOptionsModal({ date, onClose, navigate }) {
  const dateObj = new Date(date)
  const dateStr = dateObj.toISOString().split('T')[0]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 8, 16, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: 500,
          background: C.card,
          borderRadius: '20px',
          padding: '32px',
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
              New Lesson
            </h2>
            <div style={{ fontSize: 13, color: C.muted }}>
              {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { id: 'ai', icon: '✨', label: 'AI Generate', desc: 'Fill in subject, grade, topic → full lesson plan', color: C.purple },
            { id: 'build', icon: '📝', label: 'Build from Scratch', desc: 'Write your own lesson plan with guided sections', color: C.blue },
            { id: 'upload', icon: '📤', label: 'Upload Document', desc: 'PDF · Word · CSV · Image — AI scans for accommodations', color: C.teal },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                onClose()
                setTimeout(() => {
                  navigate(`/teacher/lessons?date=${dateStr}&mode=${item.id}`)
                }, 100)
              }}
              style={{
                width: '100%',
                background: C.inner,
                border: `1px solid ${item.color}22`,
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = item.color
                e.currentTarget.style.background = C.raised
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${item.color}22`
                e.currentTarget.style.background = C.inner
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${item.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────
export default function LessonCalendar() {
  const navigate = useNavigate()
  const { user, classes, fetchCalendarLessons } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [calendarLessons, setCalendarLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPrepopulate, setShowPrepopulate] = useState(false)

  // Load curriculum data on mount
  useEffect(() => {
    // Simulate loading
    setLoading(false)
  }, [])

  // Group lessons by date
  const lessonsByDate = useMemo(() => {
    const grouped = {}
    ;(calendarLessons || []).forEach(lesson => {
      const dateKey = lesson.lesson_date || lesson.date
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(lesson)
    })
    return grouped
  }, [calendarLessons])

  // Get calendar days for current month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDayOfWeek = new Date(year, month, 1).getDay()

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i))
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function handleSelectDay(date) {
    setSelectedDay(date)
  }

  function handlePrepopulateSuccess(result) {
    // Refresh calendar lessons after successful prepopulation
    fetchCalendarLessons()
    console.log('Prepopulated lessons:', result)
  }

  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  if (loading) {
    return (
      <div style={{ padding: '16px', paddingBottom: 100, textAlign: 'center', color: C.muted }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>📚</div>
        <div>Loading calendar...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', paddingBottom: 100 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => navigate('/teacher/lessons')}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>
            Lesson Calendar
          </h1>
        </div>
        <p style={{ fontSize: 14, color: C.muted, margin: 0, paddingLeft: 40 }}>
          Plan your lessons by date
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '8px 12px',
            color: C.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronLeft size={18} /> Prev
        </button>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        <button
          onClick={goToNextMonth}
          style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '8px 12px',
            color: C.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      {/* Prepopulate Button */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <button
          onClick={() => setShowPrepopulate(true)}
          style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`,
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(155, 110, 245, 0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          Populate from Curriculum
        </button>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 8, margin: 0 }}>
          Auto-create lesson shells from your curriculum standards
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 32 }}>
        {calendarDays.map((date, idx) =>
          date ? (
            <DayCell
              key={date.toISOString()}
              date={date.toISOString().split('T')[0]}
              lessons={lessonsByDate[date.toISOString().split('T')[0]] || []}
              isToday={date.toISOString().split('T')[0] === todayKey}
              onSelectDay={handleSelectDay}
            />
          ) : (
            <div key={`empty-${idx}`} />
          )
        )}
      </div>

      {selectedDay && (
        <LessonOptionsModal
          date={selectedDay}
          onClose={() => setSelectedDay(null)}
          navigate={navigate}
        />
      )}

      {showPrepopulate && (
        <CurriculumPrepopulate
          isOpen={showPrepopulate}
          onClose={() => setShowPrepopulate(false)}
          onSuccess={handlePrepopulateSuccess}
        />
      )}
    </div>
  )
}
