import React from 'react';
import PropTypes from 'prop-types';
import './GradeBadge.module.css';

function GradeBadge({ score }) {
  const color = score >= 90 ? '#22c97a' : score >= 80 ? '#3b7ef4' : score >= 70 ? '#f5a623' : '#f04a4a';
  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  return (
    <div className="grade-badge">
      <div className="grade-score" style={{ color }}>{score}%</div>
      <div className="grade-letter" style={{ color }}>{letter}</div>
    </div>
  );
}

GradeBadge.propTypes = {
  score: PropTypes.number.isRequired,
};

export default React.memo(GradeBadge);

