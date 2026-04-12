import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './LessonCalendar.css';

export default function LessonCalendar() {
  const [lessons, setLessons] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
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

      // First, resolve the teacher UUID (handle both UUID and legacy_id lookups)
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .or(`id.eq.${currentUser.id},legacy_id.eq.${currentUser.id}`)
        .single();

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

  return (
    <div className="lesson-calendar">
      <div className="calendar-header">
        <div>
          <h2>{monthName}</h2>
          <p className="calendar-subtitle">
            {loading ? '⏳ Loading...' : `✅ ${monthLessons.length} lessons loaded`}
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

      <div className="lessons-list">
        {monthLessons.length === 0 ? (
          <div className="empty-state">
            <p>No lessons for {monthName}</p>
          </div>
        ) : (
          monthLessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card" style={{ borderLeftColor: lesson.classColor }}>
              <div className="lesson-header">
                <h3>{lesson.title}</h3>
                <span className="lesson-status" style={{ backgroundColor: lesson.classColor }}>
                  {lesson.status}
                </span>
              </div>
              <div className="lesson-meta">
                <span className="lesson-date">
                  {new Date(lesson.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="lesson-period">Period {lesson.period || '—'}</span>
                <span className="lesson-duration">⏱️ {lesson.duration} min</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}