import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import ViewLessonsModal from './ViewLessonsModal'
import CreateLessonModal from './CreateLessonModal'
import LessonViewModal from '../components/LessonViewModal'
import '../pages/LessonCalendar.css';

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
};

// DAY CELL - Fixed height with proper text wrapping
function DayCell({ date, lessons, isToday, isCurrentMonth, onAdd, onClick }) {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  const CELL_HEIGHT = 120;

  return (
    <div
      onClick={() => {
        if (isCurrentMonth) onClick(date);
      }}
      style={{
        borderRadius: 10,
        border: `1px solid ${isToday ? C.blue : C.border}`,
        background: isCurrentMonth ? (isToday ? C.raised : C.card) : 'transparent',
        padding: 10,
        height: CELL_HEIGHT,
        cursor: isCurrentMonth ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        opacity: isCurrentMonth ? 1 : 0.35,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = C.blue;
          e.currentTarget.style.background = C.raised;
        }
      }}
      onMouseLeave={(e) => {
        if (isCurrentMonth) {
          e.currentTarget.style.borderColor = isToday ? C.blue : C.border;
          e.currentTarget.style.background = isToday ? C.raised : C.card;
        }
      }}
    >
      {/* Date header */}
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 2 }}>{dayName}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? C.blue : C.text }}>{day}</div>
      </div>

      {/* Lessons container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {(lessons || [])
          .slice(0, 2)
          .map((lesson) => {
            const lessonColor = lesson.classColor || C.blue;
            return (
              <div
                key={lesson.id}
                style={{
                  fontSize: 9,
                  padding: '3px 6px',
                  borderRadius: 4,
                  background: `${lessonColor}20`,
                  color: lessonColor,
                  fontWeight: 600,
                  border: `0.5px solid ${lessonColor}40`,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  lineHeight: '1.3em',
                  wordBreak: 'break-word',
                  title: `${lesson.title} - ${lesson.subject || 'Class'} ${lesson.period || ''}`,
                }}
              >
                {lesson.title}
              </div>
            );
          })}

        {(lessons || []).length > 2 && (
          <div style={{ fontSize: 8, color: C.muted, paddingLeft: 4, marginTop: 'auto', flexShrink: 0 }}>
            +{lessons.length - 2} more
          </div>
        )}
      </div>

      {/* Add button */}
      {isCurrentMonth && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(date);
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
            fontSize: 14,
            fontWeight: 700,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${C.green}30`;
            e.currentTarget.style.borderColor = C.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${C.green}15`;
            e.currentTarget.style.borderColor = `${C.green}40`;
          }}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

// MAIN CALENDAR COMPONENT
export default function LessonCalendar({ onBack }) {
  const store = useStore();
  const currentUser = store.currentUser;

  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonViewModal, setShowLessonViewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allLessons, setAllLessons] = useState([]);

  // Load lessons from Supabase
  const loadLessons = async () => {
    console.log('🔍 Starting loadLessons - currentUser:', currentUser);
    
    if (!currentUser?.id) {
      console.log('⚠️ No current user');
      setAllLessons([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📚 Looking up teacher by ID or legacy_id:', currentUser.id);

      let teacherData = null;
      let teacherError = null;

      // Try legacy_id first (for string IDs like 'demo-teacher-houston')
      const { data: legacyData, error: legacyError } = await supabase
        .from('teachers')
        .select('id')
        .eq('legacy_id', currentUser.id)
        .single();

      if (legacyData) {
        teacherData = legacyData;
      } else {
        // If no legacy_id match, try direct UUID match
        const { data: idData, error: idError } = await supabase
          .from('teachers')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (idData) {
          teacherData = idData;
        } else {
          teacherError = idError || legacyError;
        }
      }

      if (teacherError) {
        console.error('❌ Teacher lookup failed:', teacherError);
        console.error('🔧 Database connection issue - check .env.local Supabase URL');
        setAllLessons([]);
        setError('Database connection issue - check .env.local Supabase URL');
        setLoading(false);
        return;
      }

      if (!teacherData) {
        console.warn('⚠️ Teacher not found');
        console.warn('🔧 Check if teacher exists in database');
        setAllLessons([]);
        setError('Teacher not found - check if teacher exists in database');
        setLoading(false);
        return;
      }

      const teacherId = teacherData.id;
      console.log('✅ Resolved teacher UUID:', teacherId);

      // Query lessons with complete data
      const { data, error } = await supabase
        .from('lessons')
        .select(
          `
          id,
          class_id,
          lesson_date,
          title,
          duration,
          subject,
          warm_up,
          direct_instruction,
          guided_practice,
          independent_practice,
          closure,
          exit_ticket,
          criteria_for_success,
          objectives,
          cultural_notes,
          homework_assignment,
          accommodations_notes,
          enrichment_activities,
          supplemental_links,
          teacher_reflections,
          classes(id, subject, period, color)
        `
        )
        .eq('teacher_id', teacherId)
        .order('lesson_date', { ascending: true });

      if (error) {
        console.error('❌ Failed to load lessons:', error);
        setAllLessons([]);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('❌ Failed to load lessons:', error);
      setAllLessons([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [currentUser]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  const today = new Date().toISOString().split('T')[0];

  // Group lessons by date
  const lessonsByDate = useMemo(() => {
    const map = {};
    console.log('🗓️ Grouping lessons by date. Total lessons:', allLessons.length);
    allLessons.forEach((lesson) => {
      console.log('📅 Processing lesson:', lesson.date, lesson.title);
      if (!map[lesson.date]) {
        map[lesson.date] = [];
      }
      map[lesson.date].push(lesson);
    });
    console.log('📋 Final lessonsByDate map:', map);
    return map;
  }, [allLessons]);

  function handleCreateMode(dateStr, mode) {
    const paths = {
      ai: `?date=${dateStr}&mode=ai`,
      build: `?date=${dateStr}&mode=build`,
      upload: `?date=${dateStr}&mode=upload`,
    };
    window.location.hash = `#/teacher/lessons${paths[mode]}`;
  }

  function handleSelectLesson(lesson) {
    console.log('Selected lesson:', lesson);
    if (!lesson || !lesson.id) {
      console.error('Invalid lesson data:', lesson);
      return;
    }

    // Show lesson in popup modal instead of navigating
    setSelectedLesson(lesson);
    setShowLessonViewModal(true);
    console.log('Opening lesson modal for lesson:', lesson.id);
  }

  return (
    <div style={{ padding: '12px', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
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
          )}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Lesson Calendar</h1>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, marginTop: 4 }}>
              {loading ? '⏳ Loading...' : `✅ ${allLessons.length} lessons planned`}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.background = C.raised;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.inner;
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
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.background = C.raised;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.inner;
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
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.background = C.inner;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = 'none';
          }}
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, gridAutoRows: '120px' }}>
        {days.map((date, idx) => {
          const dateKey = date.toISOString().split('T')[0];
          const isCurrentMonth = date.getMonth() === month;
          const isToday = dateKey === today;
          const dayLessons = lessonsByDate[dateKey] || [];

          return (
            <DayCell
              key={idx}
              date={date}
              lessons={dayLessons}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onAdd={(d) => {
                setSelectedDate(d);
                setShowCreateModal(true);
              }}
              onClick={() => {
                setSelectedDate(date);
                setShowViewModal(true);
              }}
            />
          );
        })}
      </div>

      {/* View Lessons Modal */}
      {selectedDate && (
        <ViewLessonsModal
          date={selectedDate}
          lessons={lessonsByDate[selectedDate.toISOString().split('T')[0]] || []}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          onSelectLesson={handleSelectLesson}
        />
      )}

      {/* Create Lesson Modal */}
      {selectedDate && (
        <CreateLessonModal
          date={selectedDate}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSelect={handleCreateMode}
        />
      )}

      {/* Lesson View Modal */}
      <LessonViewModal
        lesson={selectedLesson}
        isOpen={showLessonViewModal}
        onClose={() => {
          setShowLessonViewModal(false);
          setSelectedLesson(null);
        }}
      />
    </div>
  );
}