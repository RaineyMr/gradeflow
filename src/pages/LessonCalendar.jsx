import React, { useState, useEffect, useMemo } from 'react'
import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

const C = {
  bg: '#060810',
  card: '#111520',
  inner: '#1a1f2e',
  raised: '#1e2436',
  text: '#eef0f8',
  soft: '#c8cce0',
  muted: '#6b7494',
  border: '#252b3d',
  green: '#22c97a',
  blue: '#3b7ef4',
  red: '#f04a4a',
  amber: '#f5a623',
  purple: '#9b6ef5',
  teal: '#0fb8a0',
}

// ─── LESSON SELECTION POPUP ───────────────────────────────────────────────────
function LessonSelectionPopup({ date, lessons, isOpen, onClose, onSelectLesson }) {
  if (!isOpen) return null

  const dateObj = new Date(date)
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
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
          maxHeight: '80vh',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
              Lessons
            </h2>
            <div style={{ fontSize: 12, color: C.muted }}>
              {dateStr}
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
              fontSize: 20,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {lessons && lessons.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                style={{
                  width: '100%',
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.blue
                  e.currentTarget.style.background = C.raised
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.border
                  e.currentTarget.style.background = C.inner
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {lesson.title || 'Untitled Lesson'}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.muted }}>
                      <span>Class {lesson.classId || 1}</span>
                      <span>{lesson.duration || 45} min</span>
                      <span style={{ textTransform: 'capitalize' }}>{lesson.status || 'pending'}</span>
                    </div>
                  </div>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: lesson.status === 'completed' ? C.green : lesson.status === 'in-progress' ? C.amber : C.blue,
                  }} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 14 }}>
            No lessons scheduled for this day
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FULL LESSON VIEW ────────────────────────────────────────────────────────
function FullLessonView({ lesson, isOpen, onClose, onBack }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: 800,
          maxHeight: '90vh',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onBack}
              style={{
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                color: C.muted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.blue
                e.currentTarget.style.background = C.raised
                e.currentTarget.style.color = C.blue
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.background = C.inner
                e.currentTarget.style.color = C.muted
              }}
            >
              <ChevronLeft size={14} />
              Back to Calendar
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
                {lesson.title || 'Untitled Lesson'}
              </h1>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.muted }}>
                <span>Class {lesson.classId || 1}</span>
                <span>{lesson.duration || 45} minutes</span>
                <span style={{ textTransform: 'capitalize' }}>{lesson.status || 'pending'}</span>
              </div>
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
              fontSize: 20,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ background: C.inner, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 12px 0' }}>Lesson Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 13, color: C.text }}>
                {new Date(lesson.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: 13, color: C.text }}>{lesson.duration || 45} minutes</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{lesson.status || 'pending'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Class</div>
              <div style={{ fontSize: 13, color: C.text }}>Class {lesson.classId || 1}</div>
            </div>
          </div>
        </div>

        <div style={{ background: C.inner, borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 12px 0' }}>Lesson Content</h3>
          <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.6 }}>
            {lesson.content || 'No lesson content available yet. This lesson plan is ready to be developed.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            style={{
              flex: 1,
              background: C.blue,
              border: 'none',
              borderRadius: 8,
              padding: '12px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#4a8ff5'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = C.blue
            }}
          >
            Edit Lesson
          </button>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '12px 16px',
              color: C.soft,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.blue
              e.currentTarget.style.background = C.inner
              e.currentTarget.style.color = C.blue
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = C.soft
            }}
          >
            Share Lesson
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CREATE LESSON MODAL ─────────────────────────────────────────────────────
function CreateLessonModal({ date, isOpen, onClose, onSelect }) {
  if (!isOpen) return null

  const dateObj = new Date(date)
  const dateStr = dateObj.toISOString().split('T')[0]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
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
          maxWidth: 450,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>
              Create Lesson
            </h2>
            <div style={{ fontSize: 12, color: C.muted }}>
              {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              fontSize: 20,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'ai', icon: '✨', label: 'AI Generate', desc: '3 questions → full lesson', color: C.purple },
            { id: 'build', icon: '📝', label: 'Build from Scratch', desc: 'Write your own lesson', color: C.blue },
            { id: 'upload', icon: '📤', label: 'Upload Document', desc: 'PDF, Word, or image', color: C.teal },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                onSelect(dateStr, mode.id)
                onClose()
              }}
              style={{
                width: '100%',
                background: C.inner,
                border: `1px solid ${mode.color}30`,
                borderRadius: 12,
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = mode.color
                e.currentTarget.style.background = C.raised
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${mode.color}30`
                e.currentTarget.style.background = C.inner
              }}
            >
              <div style={{ fontSize: 18 }}>{mode.icon}</div>
              <div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{mode.label}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DAY CELL ────────────────────────────────────────────────────────────────
function DayCell({ date, lessons, isToday, isCurrentMonth, onAdd, onClick }) {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 10,
        border: `1px solid ${isToday ? C.blue : C.border}`,
        background: isCurrentMonth ? (isToday ? C.raised : C.card) : 'transparent',
        padding: 10,
        minHeight: 100,
        cursor: isCurrentMonth ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        opacity: isCurrentMonth ? 1 : 0.35,
      }}
      onMouseEnter={e => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = C.blue
          e.currentTarget.style.background = C.raised
        }
      }}
      onMouseLeave={e => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = isToday ? C.blue : C.border
          e.currentTarget.style.background = isToday ? C.raised : C.card
        }
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 2 }}>
          {dayName}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? C.blue : C.text }}>
          {day}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6, minHeight: 30 }}>
        {(lessons || []).slice(0, 1).map(lesson => (
          <div
            key={lesson.id}
            style={{
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 4,
              background: `${C.blue}20`,
              color: C.blue,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              border: `0.5px solid ${C.blue}40`,
            }}
            title={lesson.title}
          >
            {lesson.title}
          </div>
        ))}
        {(lessons || []).length > 1 && (
          <div style={{ fontSize: 8, color: C.muted, paddingLeft: 4 }}>
            +{lessons.length - 1} more
          </div>
        )}
      </div>

      {isCurrentMonth && (
        <button
          onClick={e => {
            e.stopPropagation()
            onAdd(date)
          }}
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${C.green}15`,
            border: `1px solid ${C.green}40`,
            color: C.green,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${C.green}30`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${C.green}15`
          }}
        >
          <Plus size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

// ─── MAIN CALENDAR COMPONENT ─────────────────────────────────────────────────
export default function LessonCalendar({ onBack }) {
  const store = useStore()
  const t = useT()
  const { currentUser, lessons, activeLessonClassId } = store

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showLessonPopup, setShowLessonPopup] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allLessons, setAllLessons] = useState([])

  useEffect(() => {
    loadLessons()
  }, [currentUser, activeLessonClassId])

  async function loadLessons() {
    try {
      setLoading(true)

      const isDemo = currentUser?.email?.includes('@demo') || currentUser?.id?.startsWith('demo-')

      if (isDemo) {
        // Load lessons from all classes for demo
        const allClassLessons = []
        Object.keys(lessons).forEach(classId => {
          const classLessons = lessons[classId] || []
          allClassLessons.push(...classLessons.map(lesson => ({
            ...lesson,
            classId: parseInt(classId)
          })))
        })
        setAllLessons(allClassLessons)
      } else {
        // Load lessons from all classes for real users
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('lesson_date', { ascending: true })

        if (error) throw error

        const mapped = (data || []).map(row => ({
          id: row.id,
          classId: row.class_id,
          date: row.lesson_date,
          title: row.title || 'Untitled',
          duration: row.duration || 45,
          status: row.status || 'pending',
          content: row.content || null,
        }))

        setAllLessons(mapped)
      }
    } catch (err) {
      console.error('Load lessons error:', err)
      // Fallback to demo data
      const allClassLessons = []
      Object.keys(lessons).forEach(classId => {
        const classLessons = lessons[classId] || []
        allClassLessons.push(...classLessons.map(lesson => ({
          ...lesson,
          classId: parseInt(classId)
        })))
      })
      setAllLessons(allClassLessons)
    } finally {
      setLoading(false)
    }
  }

  const lessonsByDate = useMemo(() => {
    const grouped = {}
    allLessons.forEach(lesson => {
      if (!lesson.date) return
      const key = typeof lesson.date === 'string'
        ? lesson.date.split('T')[0]
        : lesson.date.toISOString().split('T')[0]
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(lesson)
    })
    return grouped
  }, [allLessons])

  // Calendar grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i))
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i))
  }

  const today = new Date().toISOString().split('T')[0]

  function handleCreateMode(dateStr, mode) {
    const paths = {
      ai: `?date=${dateStr}&mode=ai`,
      build: `?date=${dateStr}&mode=build`,
      upload: `?date=${dateStr}&mode=upload`,
    }
    window.location.hash = `#/teacher/lessons${paths[mode]}`
  }

  return (
    <div style={{ padding: '12px', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              cursor: 'pointer',
              fontSize: 20,
              padding: '4px 8px',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>
              Lesson Calendar
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, marginTop: 4 }}>
              {allLessons.length} lessons planned
            </p>
          </div>
        </div>
      </div>

      {/* Month controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 8,
        }}
      >
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '6px 10px',
            color: C.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.blue
            e.currentTarget.style.background = C.raised
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.background = C.inner
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, minWidth: 140, textAlign: 'center' }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          style={{
            background: C.inner,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '6px 10px',
            color: C.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.blue
            e.currentTarget.style.background = C.raised
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.background = C.inner
          }}
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => setCurrentDate(new Date())}
          style={{
            background: 'none',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '6px 10px',
            color: C.soft,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.blue
            e.currentTarget.style.background = C.inner
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.background = 'none'
          }}
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: C.muted,
              textTransform: 'uppercase',
              paddingBottom: 6,
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((date, idx) => {
          const dateKey = date.toISOString().split('T')[0]
          const isCurrentMonth = date.getMonth() === month
          const isToday = dateKey === today

          return (
            <DayCell
              key={idx}
              date={date}
              lessons={lessonsByDate[dateKey] || []}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onAdd={d => {
                setSelectedDate(d)
                setShowModal(true)
              }}
              onClick={() => {
                const dayLessons = lessonsByDate[dateKey] || []
                if (dayLessons.length > 0) {
                  setSelectedDate(date)
                  setShowLessonPopup(true)
                }
              }}
            />
          )
        })}
      </div>

      {/* Modals */}
      <CreateLessonModal
        date={selectedDate || new Date()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleCreateMode}
      />

      <LessonSelectionPopup
        date={selectedDate || new Date()}
        lessons={lessonsByDate[selectedDate?.toISOString().split('T')[0]] || []}
        isOpen={showLessonPopup}
        onClose={() => setShowLessonPopup(false)}
        onSelectLesson={(lesson) => {
          setSelectedLesson(lesson)
          setShowLessonPopup(false)
        }}
      />

      <FullLessonView
        lesson={selectedLesson}
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onBack={() => {
          setSelectedLesson(null)
          setShowLessonPopup(true)
        }}
      />
    </div>
  )
}
