import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../../lib/store';
import Widget from '../../ui/Widget';
import RoleBadge from '../../ui/RoleBadge';
import styles from '../../../styles/Dashboard.module.css';

const MSG_THREADS = [
  // Keep for now, remove later with real store data
  { id:1, name:'Ms. Thompson', role:'parent', avatar:'👩', subject:'Marcus — Math Assessment', unread:true, aiDrafted:true, status:'pending', preview:"Dear Ms. Thompson, Marcus received 58%..." },
  // ... other threads
];

function MessagesWidget({ navigate }) {
  const unread = MSG_THREADS.filter(t => t.unread).length;
  const store = useStore();
  // Replace with store.messages when available

  return (
    <Widget title="💬 Messages" titleRight={
      <div className="title-right">
        {unread > 0 && <span className="unread-count">{unread} new</span>}
        <button onClick={(e) => { e.stopPropagation(); navigate('parentMessages'); }}>See all →</button>
      </div>
    }>
      {MSG_THREADS.slice(0,3).map(t => (
        <div key={t.id} onClick={(e) => { e.stopPropagation(); navigate('parentMessages'); }} className="message-item" aria-label={`Message from ${t.name}`}>
          <div className="avatar-container">
            <div className="avatar">{t.avatar}</div>
            {t.unread && <div className="unread-dot" />}
          </div>
          <div className="message-content">
            <div className="message-header">
              <span>{t.name}</span>
              <RoleBadge role={t.role} />
              {t.aiDrafted && <span>✨AI</span>}
            </div>
            <div className="message-preview">{t.preview}</div>
          </div>
          <span>Reply →</span>
        </div>
      ))}
      <div className="messages-footer">
        ✨ AI writes every message · Every negative has a positive version · Multilingual
      </div>
    </Widget>
  );
}

MessagesWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(MessagesWidget);

