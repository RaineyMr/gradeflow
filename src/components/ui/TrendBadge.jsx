import React from 'react';
import PropTypes from 'prop-types';

function TrendBadge({ trend }) {
  const map = { 
    up: ['↑', '#22c97a'], 
    down: ['↓', '#f04a4a'], 
    stable: ['→', '#6b7494'] 
  };
  const [icon, color] = map[trend] || map.stable;
  return <span className="trend-badge" style={{ color }}>{icon}</span>;
}

TrendBadge.propTypes = {
  trend: PropTypes.oneOf(['up', 'down', 'stable']),
};

export default React.memo(TrendBadge);

