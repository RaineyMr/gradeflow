import React from 'react';
import PropTypes from 'prop-types';
import './RoleBadge.module.css';

function RoleBadge({ role }) {
  const map = { 
    teacher: { color: '#3b7ef4', text: 'Teacher' }, 
    student: { color: '#22c97a', text: 'Student' }, 
    parent: { color: '#f5a623', text: 'Parent' }, 
    admin: { color: '#9b6ef5', text: 'Admin' } 
  };
  const badge = map[role] || map.teacher;
  return (
    <span 
      className="role-badge"
      style={{ 
        backgroundColor: `${badge.color}18`, 
        color: badge.color 
      }}
    >
      {badge.text}
    </span>
  );
}

RoleBadge.propTypes = {
  role: PropTypes.oneOf(['teacher', 'student', 'parent', 'admin']),
};

export default React.memo(RoleBadge);

