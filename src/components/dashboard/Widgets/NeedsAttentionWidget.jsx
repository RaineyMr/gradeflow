import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../../lib/store';
import Widget from '../../ui/Widget';
import GradeBadge from '../../ui/GradeBadge';
import styles from '../../../styles/Dashboard.module.css';

function NeedsAttentionWidget({ navigate, atRisk }) {
  if (atRisk.length === 0) return null;

  return (
    <Widget style={{ borderColor: 'rgba(240, 74, 74, 0.25)' }}>
      <div className="widget-header">
        <div>⚑ Needs Attention</div>
        <span>{atRisk.length} students</span>
      </div>
      <div className="attention-list">
        {atRisk.slice(0,2).map((s, i) => (
          <span key={s.id}>
            <span>{s.name.split(' ')[0]} {s.name.split(' ')[1]?.[0]}.</span>
            <span> · {s.subject} {s.grade}%</span>
          </span>
        ))}
        {atRisk.length > 2 && <span> + {atRisk.length-2} more</span>}
      </div>
      <div className="attention-actions">
        <button onClick={(e) => { e.stopPropagation(); navigate('attention'); }}>Tap to view all</button>
        <button onClick={(e) => { e.stopPropagation(); navigate('parentMessages'); }}>📩 Message group</button>
      </div>
    </Widget>
  );
}

NeedsAttentionWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
  atRisk: PropTypes.array.isRequired,
};

export default React.memo(NeedsAttentionWidget);

