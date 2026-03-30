import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../../lib/store';
import Widget from '../../ui/Widget';
import ActionBtn from '../../ui/ActionBtn';
import styles from '../../../styles/Dashboard.module.css';

function TodaysLessonsWidget({ navigate }) {
  const { classes, setActiveLessonClass, setLessonStatus, getTodayLesson } = useStore();
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id || 1);
  const lesson = getTodayLesson(activeClassId);

  const openLesson = () => {
    setActiveLessonClass(activeClassId);
    navigate('lessonPlan');
  };

  const markDone = (e) => {
    e.stopPropagation();
    setLessonStatus(activeClassId, 'done');
  };

  const markTBD = (e) => {
    e.stopPropagation();
    setLessonStatus(activeClassId, 'tbd');
  };

  return (
    <Widget onClick={openLesson} title="TODAY'S LESSONS">
      <div className="class-selector scrollX">
        {classes.map(c => (
          <button 
            key={c.id} 
            onClick={(e) => { e.stopPropagation(); setActiveClassId(c.id); }}
            aria-label={`Select class ${c.period} ${c.subject}`}
          >
            {c.period} · {c.subject}
          </button>
        ))}
      </div>
      {lesson ? (
        <>
          {lesson.status === 'tbd' && <div className="tbd-badge">⟳ TBD — Repeating this session</div>}
          <div className="lesson-title">{lesson.title}</div>
          <div className="lesson-meta">{[lesson.pages, lesson.duration].filter(Boolean).join(' · ')}</div>
          {lesson.objective && <div className="lesson-objective">"{lesson.objective.substring(0,80)}..."</div>}
          <div className="lesson-actions flexGap">
            <ActionBtn label="📋 Full Plan" color="#0fb8a0" onClick={openLesson} />
            {lesson.status !== 'done' && (
              <>
                <ActionBtn label="✓ Done" color="#22c97a" onClick={markDone} />
                <ActionBtn label="⟳ TBD" color="#f5a623" onClick={markTBD} />
              </>
            )}
            {lesson.status === 'done' && <span>✓ Lesson completed</span>}
          </div>
        </>
      ) : (
        <div className="no-lesson flexCenter">
          <ActionBtn label="+ Create Lesson" color="#0fb8a0" onClick={openLesson} />
        </div>
      )}
    </Widget>
  );
}

TodaysLessonsWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(TodaysLessonsWidget);

