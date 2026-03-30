import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function StickyHeader({ teacher }) {
  const [now, setNow] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const currentNow = new Date();
      setNow(currentNow);
      const hour = currentNow.getHours();
      setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: 'linear-gradient(135deg, var(--school-color) 0%, var(--school-surface, #0a000a) 100%)', 
      padding: '14px 16px', 
      borderBottom: '1px solid rgba(255,255,255,0.08)' 
    }} aria-label="Dashboard header with greeting and time">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
            {teacher.school?.toUpperCase()}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {greeting}, {teacher.name.split(' ').pop()} 👋
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }} aria-live="polite">
          {timeStr}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

StickyHeader.propTypes = {
  teacher: PropTypes.shape({
    school: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default React.memo(StickyHeader);

