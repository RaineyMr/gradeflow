import React from 'react';
import PropTypes from 'prop-types';

function ActionBtn({ label, color, onClick, style = {} }) {
  return (
    <button 
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
      className="action-btn"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
        ...style
      }}
    >
      {label}
    </button>
  );
}

ActionBtn.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.object,
};

ActionBtn.defaultProps = {
  style: {},
};

export default React.memo(ActionBtn);

