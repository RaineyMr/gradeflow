import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './LessonCalendar.css';

export default function LessonCalendar() {
  const [lessons, setLessons] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [loading, setLoading] = useState(false);
  const currentUser = useStore((state) => state.currentUser);

  // Load lessons from Supabase
  const loadLessons = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('⚠️ No current user');
      setLessons([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📚 Looking up teacher by ID or legacy_id:', currentUser.id);

      // First, try to find teacher by legacy_id if currentUser.id is a string
      // If it's a UUID, try direct ID lookup
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
        setLessons([]);
        setLoading(false);
        return;
      }

      if (!teacherData) {
        console.warn('⚠️ Teacher not found');
        setLessons([]);
        setLoading(false);
        return;
      }

      const teacherId = teacherData.id;
      console.log('✅ Resolved teacher UUID:', teacherId);

      // Now query lessons with the resolved UUID
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          class_id,
          lesson_date,
          title,
          duration,
          subject,
          classes(id, subject, period, color)
        `)
        .eq('teacher_id', teacherId)
        .order('lesson_date', { ascending: true });

      if (error) {
        console.error('❌ Failed to load lessons:', error);
        setLessons([]);
        setLoading(false);
        return;
      }

      console.log('✅ Loaded', data.length, 'lessons');

      // Map Supabase data to component format
      const mappedLessons = data.map((row) => ({
        id: row.id,
        classId: row.class_id,
        date: row.lesson_date,
        title: row.title || 'Untitled',
        duration: row.duration || 45,
        status: 'pending',
        subject: row.subject || row.classes?.subject,
        period: row.classes?.period,
        classColor: row.classes?.color || '#3b7ef4',
      }));

      setLessons(mappedLessons);
    } catch (err) {
      console.error('❌ Unexpected error loading lessons:', err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load lessons on mount and when user changes
  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Get lessons for current month
  const monthLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getMonth() === currentDate.getMonth() &&
        lessonDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [lessons, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build calendar grid
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }

  // Next month's leading days
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  // Get lessons for a specific date
  const getLessonsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthLessons.filter((lesson) => lesson.date === dateStr);
  };

  return (
    <div className="lesson-calendar">
      <div className="calendar-header">
        <div>
          <h2>{monthName}</h2>
          <p className="calendar-subtitle">
            {loading ? '⏳ Loading...' : `✅ ${monthLessons.length} lessons`}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" title="New Lesson">
          <Plus size={18} />
        </button>
      </div>

      <div className="calendar-nav">
        <button onClick={handlePrevMonth} className="btn-icon">
          <ChevronLeft size={20} />
        </button>
        <span>{monthName}</span>
        <button onClick={handleNextMonth} className="btn-icon">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map((dayObj, idx) => {
          const dayLessons = getLessonsForDate(dayObj.date);
          const isToday =
            dayObj.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              className={`calendar-day ${
                !dayObj.isCurrentMonth ? 'other-month' : ''
              } ${isToday ? 'today' : ''}`}
            >
              <div className="day-number">{dayObj.day}</div>
              <div className="day-lessons">
                {dayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="lesson-badge"
                    style={{ backgroundColor: lesson.classColor }}
                    title={`${lesson.title} (${lesson.duration} min)`}
                  >
                    <span className="lesson-title">{lesson.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}