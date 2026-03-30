import React from 'react';
import PropTypes from 'prop-types';
import Widget from '../../ui/Widget';
import styles from '../../../styles/Dashboard.module.css';

const weights = [
  { label:'Test', pct:'40%', color:'#f04a4a' },
  { label:'Quiz', pct:'30%', color:'#f5a623' },
  { label:'Part.', pct:'10%', color:'#0fb8a0' },
  { label:'Other', pct:'20%', color:'#3b7ef4' },
];

function GradingWidget({ navigate }) {
  return (
    <Widget onClick={() => navigate('gradebook')}>
      <div className="grading-header">
        <div>📷 Grading</div>
        <span>Synced: PowerSchool ✓</span>
      </div>
      <div>Last: Today 8:42am · 24 grades · Tap 📷 to scan</div>
      <div className="weight-tags">
        {weights.map(w => (
          <span key={w.label} style={{ '--color': w.color }}>
            {w.label} {w.pct}
          </span>
        ))}
      </div>
      <button>Edit in Settings</button>
    </Widget>
  );
}

GradingWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(GradingWidget);

