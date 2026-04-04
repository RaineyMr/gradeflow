import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useStore from '../../lib/store'; // Adjust path as needed
import Widget from '../ui/Widget';
import ActionBtn from '../ui/ActionBtn';
import TodaysLessonsWidget from './Widgets/TodaysLessonsWidget'; // Will create later
// Import other widgets as created...

const WIDGET_CATALOG = [
  { id:'todaysLessons', label:"Today's Lessons", icon:'📘', desc:'Lesson plan and class schedule' },
  // ... full catalog from original
];

function HomeFeed({ navigate, showAddWidgets, setShowAddWidgets }) {
  const store = useStore();
  const { classes, messages } = store;
  const atRisk = store.getNeedsAttention ? store.getNeedsAttention() : [];
  const pending = messages.filter(m => m.status === 'pending');
  const [activeWidgets, setActiveWidgets] = useState(['todaysLessons', 'classes', 'messages']); // Default active

  const overviewTiles = [
    { icon:'📚', val:classes.length, label:'Classes', page:'classes', color:'#3b7ef4' },
    { icon:'💬', val:pending.length, label:'Messages', page:'parentMessages', color:'#9b6ef5' },
    // ... from original
  ];

  const removeWidget = (id) => setActiveWidgets(prev => prev.filter(w => w !== id));
  const addWidget = (id) => setActiveWidgets(prev => prev.includes(id) ? prev : [...prev, id]);
  const show = (id) => activeWidgets.includes(id);

  return (
style={{ padding: '12px 12px 0' }}
      {/* Add widgets modal logic */}
      <Widget style={{ background: 'var(--school-surface, #1a0008)' }}>
        <div>DAILY OVERVIEW</div>
        {/* Tiles */}
      </Widget>
      {show('todaysLessons') && <TodaysLessonsWidget navigate={navigate} />}
      {/* Conditional widgets */}
      <div className="add-widgets-bar">
        <button onClick={() => setShowAddWidgets(true)}>+ Add widgets</button>
      </div>
    </div>
  );
}

HomeFeed.propTypes = {
  navigate: PropTypes.func.isRequired,
  showAddWidgets: PropTypes.bool.isRequired,
  setShowAddWidgets: PropTypes.func.isRequired,
};

export default React.memo(HomeFeed);

