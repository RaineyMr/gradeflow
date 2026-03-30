import React from 'react';
import PropTypes from 'prop-types';


const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
};

function Widget({ onClick, children, style = {}, title, titleRight, className = '' }) {
  return (
    <div 
      className={`widget ${className}`}
      onClick={onClick}
      onMouseEnter={onClick ? handleHoverEnter : undefined}
      onMouseLeave={onClick ? handleHoverLeave : undefined}
      style={style}
    >
      {(title || titleRight) && (
        <div className="widget-header">
          {title && <div className="widget-title">{title}</div>}
          {titleRight}
        </div>
      )}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
}

function handleHoverEnter(e) {
  if (e.currentTarget.onClick) {
    e.currentTarget.style.borderColor = 'var(--school-color)';
  }
}

function handleHoverLeave(e) {
  e.currentTarget.style.borderColor = 'var(--school-color, #252b3d)';
}

Widget.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  title: PropTypes.string,
  titleRight: PropTypes.node,
  className: PropTypes.string,
};

Widget.defaultProps = {
  style: {},
  className: '',
};

export default React.memo(Widget);

