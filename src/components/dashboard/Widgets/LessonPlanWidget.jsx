import React from 'react';
import PropTypes from 'prop-types';
import Widget from '../../ui/Widget';
import ActionBtn from '../../ui/ActionBtn';
import styles from '../../../styles/Dashboard.module.css';

function LessonPlanWidget({ navigate }) {
  return (
    <Widget title="📋 Lesson Plan Builder">
      <div className="lesson-tools">
        <button>📤 Upload lesson plan</button>
        <button>✨ AI Generate</button>
        <button>📝 Build from scratch</button>
      </div>
      {/* More extracted content */}
      <button onClick={(e) => { e.stopPropagation(); navigate('lessonPlan'); }}>Open →</button>
    </Widget>
  );
}

LessonPlanWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(LessonPlanWidget);

