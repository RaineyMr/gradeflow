import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@lib/store'
import { supabase } from '@lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

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
}

// ── Day cell with lessons for that date ────────────────────────────────────
function DayCell({ date, lessons, isToday, onSelectDay, onAddLesson }) {
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
          const dateStr = typeof date === 'string' ? date : date
          navigate(`/teacher/lessons?date=${dateStr}&mode=build`)
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

// ── Lesson edit modal ────────────────────────────────────────────────────
function LessonModal({ lesson, date, onClose, onSave, curriculumSources = [], curriculumUnits = [], curriculumStandards = [] }) {
  const [title, setTitle] = useState(lesson?.title || '')
  const [subject, setSubject] = useState(lesson?.subject || 'Math')
  const [curriculumId, setCurriculumId] = useState(lesson?.curriculum_id || '')
  const [unitId, setUnitId] = useState(lesson?.curriculum_unit_id || '')
  const [standardId, setStandardId] = useState(lesson?.curriculum_standard_id || '')
  const [objective, setObjective] = useState(lesson?.learning_objective || '')
  const [activities, setActivities] = useState((lesson?.activities || []).join('\n'))
  const [materials, setMaterials] = useState((lesson?.materials || []).join('\n'))
  const [homework, setHomework] = useState(lesson?.homework || '')
  const [status, setStatus] = useState(lesson?.status || 'pending')

  const filteredUnits = useMemo(() => {
    if (!curriculumId) return []
    return (curriculumUnits || []).filter(u => u.curriculum_id === curriculumId && u.subject === subject)
  }, [curriculumId, subject, curriculumUnits])

  const filteredStandards = useMemo(() => {
    if (!unitId) return []
    return (curriculumStandards || []).filter(s => s.curriculum_unit_id === unitId)
  }, [unitId, curriculumStandards])

  const selectedStandard = useMemo(() => {
    return (curriculumStandards || []).find(s => s.id === standardId)
  }, [standardId, curriculumStandards])

  useEffect(() => {
    if (selectedStandard) {
      setTitle(selectedStandard.standard_title || '')
      setObjective(selectedStandard.learning_objective || '')
      setActivities((selectedStandard.suggested_activities || []).join('\n'))
      setMaterials((selectedStandard.suggested_materials || []).join('\n'))
      setHomework(selectedStandard.suggested_homework || '')
    }
  }, [selectedStandard])

  function handleSave() {
    const updatedLesson = {
      id: lesson?.id || `lesson-${Date.now()}`,
      date,
      title: title || 'Untitled Lesson',
      subject,
      objective,
      activities: activities.split('\n').filter(a => a.trim()),
      materials: materials.split('\n').filter(m => m.trim()),
      homework,
      status,
      curriculum_id: curriculumId || null,
      curriculum_unit_id: unitId || null,
      curriculum_standard_id: standardId || null,
    }
    onSave(updatedLesson)
    onClose()
  }

  const inputStyle = {
    width: '100%',
    background: C.inner,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    color: C.text,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'Inter, Arial, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: 6,
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 8, 16, 0.8)',
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
          maxWidth: 600,
          background: C.card,
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          overflowY: 'auto',
          maxHeight: '90vh',
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>
            {lesson ? 'Edit Lesson' : 'New Lesson'}
          </h2>
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

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Subject</label>
            <select
              value={subject}
              onChange={e => {
                setSubject(e.target.value)
                setCurriculumId('')
                setUnitId('')
                setStandardId('')
              }}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
              <option value="Science">Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Writing">Writing</option>
              <option value="ELA">ELA</option>
            </select>
          </div>

          {curriculumSources.length > 0 && (
            <div>
              <label style={labelStyle}>Curriculum</label>
              <select
                value={curriculumId}
                onChange={e => {
                  setCurriculumId(e.target.value)
                  setUnitId('')
                  setStandardId('')
                }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select curriculum...</option>
                {(curriculumSources || [])
                  .filter(c => !c.subjects || c.subjects.includes(subject))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.logo} {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {curriculumId && filteredUnits.length > 0 && (
            <div>
              <label style={labelStyle}>Unit</label>
              <select
                value={unitId}
                onChange={e => {
                  setUnitId(e.target.value)
                  setStandardId('')
                }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select unit...</option>
                {filteredUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unit_number}: {u.unit_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {unitId && filteredStandards.length > 0 && (
            <div>
              <label style={labelStyle}>Standard / Lesson</label>
              <select
                value={standardId}
                onChange={e => setStandardId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select standard (auto-fills form)...</option>
                {filteredStandards.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.standard_code}: {s.standard_title}
                  </option>
                ))}
              </select>
              {selectedStandard && (
                <div style={{ fontSize: 11, color: C.green, marginTop: 8, fontWeight: 600 }}>
                  ✓ Auto-populated from curriculum
                </div>
              )}
            </div>
          )}

          <div>
            <label style={labelStyle}>Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Ch. 4 - Fractions & Decimals"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Learning Objective</label>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="What will students be able to do after this lesson?"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Activities (one per line)</label>
            <textarea
              value={activities}
              onChange={e => setActivities(e.target.value)}
              placeholder="Warm-up&#10;Mini-lesson&#10;Guided practice&#10;Exit ticket"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Materials (one per line)</label>
            <textarea
              value={materials}
              onChange={e => setMaterials(e.target.value)}
              placeholder="Workbook&#10;Whiteboard&#10;Manipulatives"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Homework</label>
            <textarea
              value={homework}
              onChange={e => setHomework(e.target.value)}
              placeholder="Workbook pages 91-95, problems 1-10"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: C.inner,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '11px',
                color: C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                background: 'var(--school-color, ' + C.blue + ')',
                border: 'none',
                borderRadius: 10,
                padding: '11px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Day detail view ────────────────────────────────────────────────────────
function DayDetail({ date, lessons, onClose, onAddLesson }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 8, 16, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 20,
          padding: '32px',
          maxWidth: 500,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <div style={{ fontSize: 12, color: C.muted }}>
              {(lessons || []).length} {(lessons || []).length === 1 ? 'lesson' : 'lessons'}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {(lessons || []).length > 0 ? (
            (lessons || []).map(lesson => (
              <div
                key={lesson.id}
                style={{
                  background: C.inner,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {lesson.title}
                </div>
                {lesson.learning_objective && (
                  <div style={{ fontSize: 12, color: C.soft, marginBottom: 8 }}>
                    {lesson.learning_objective}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {lesson.status === 'done' && (
                    <span style={{ fontSize: 10, background: 'rgba(34, 201, 122, 0.2)', color: C.green, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      ✓ Done
                    </span>
                  )}
                  {(lesson.activities || []).length > 0 && (
                    <span style={{ fontSize: 10, background: 'rgba(59, 126, 244, 0.2)', color: C.blue, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {(lesson.activities || []).length} activities
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 13 }}>No lessons yet</div>
            </div>
          )}
        </div>

        <button
          onClick={() => onAddLesson(date)}
          style={{
            width: '100%',
            background: 'var(--school-color, ' + C.blue + ')',
            border: 'none',
            borderRadius: 10,
            padding: '12px',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Add Lesson
        </button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────
export default function LessonCalendar() {
  const navigate = useNavigate()
  const { calendarLessons = [], assignLessonToDate, currentUser } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [curriculumSources, setCurriculumSources] = useState([])
  const [curriculumUnits, setCurriculumUnits] = useState([])
  const [curriculumStandards, setCurriculumStandards] = useState([])
  const [loading, setLoading] = useState(true)

  // Load curriculum data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: sources } = await supabase.from('curriculum_sources').select('*')
        setCurriculumSources(sources || [])

        const { data: units } = await supabase.from('curriculum_units').select('*')
        setCurriculumUnits(units || [])

        const { data: standards } = await supabase.from('curriculum_standards').select('*')
        setCurriculumStandards(standards || [])

        setLoading(false)
      } catch (error) {
        console.error('Error loading curriculum data:', error)
        setLoading(false)
      }
    }

    loadData()
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

  function handleAddLesson(date) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    setSelectedDay(null)
    setShowAddModal(dateStr)
  }

  function handleSaveLesson(lesson) {
    assignLessonToDate(lesson)
  }

  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  if (loading) {
    return (
      <div style={{ padding: '16px', paddingBottom: 100, textAlign: 'center', color: C.muted }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>📚</div>
        <div>Loading curriculum data...</div>
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
          Plan your lessons by date • {curriculumSources.length} curriculum(s) available
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
              onAddLesson={handleAddLesson}
            />
          ) : (
            <div key={`empty-${idx}`} />
          )
        )}
      </div>

      {selectedDay && (
        <DayDetail
          date={selectedDay}
          lessons={lessonsByDate[selectedDay] || []}
          onClose={() => setSelectedDay(null)}
          onAddLesson={handleAddLesson}
        />
      )}

      {showAddModal && (
        <LessonModal
          lesson={null}
          date={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveLesson}
          curriculumSources={curriculumSources}
          curriculumUnits={curriculumUnits}
          curriculumStandards={curriculumStandards}
        />
      )}
    </div>
  )
}
