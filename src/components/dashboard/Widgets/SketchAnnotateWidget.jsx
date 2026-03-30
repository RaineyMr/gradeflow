import React from 'react';
import PropTypes from 'prop-types';
import Widget from '../../ui/Widget';
import styles from '../../../styles/Dashboard.module.css';

function SketchAnnotateWidget({ navigate }) {
  const tools = [
    { icon:'🖊', label:'Highlight' },
    { icon:'✏', label:'Free draw' },
    { icon:'◻', label:'Box' },
    { icon:'➤', label:'Arrow' },
    { icon:'T', label:'Text' },
  ];

  return (
    <Widget title="✏ Sketch & Annotate">
      <div className="camera-grid">
        <button onClick={(e) => { e.stopPropagation(); navigate('camera'); }}>
          📷 Use Camera
        </button>
        <button>📄 Upload File</button>
      </div>
      <div className="annotation-tools">
        {tools.map(t => (
          <button key={t.label}>{t.icon}<br/>{t.label}</button>
        ))}
      </div>
    </Widget>
  );
}

SketchAnnotateWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(SketchAnnotateWidget);

