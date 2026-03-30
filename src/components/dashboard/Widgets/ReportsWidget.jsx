import React from 'react';
import PropTypes from 'prop-types';
import Widget from '../../ui/Widget';
import styles from '../../../styles/Dashboard.module.css';

function ReportsWidget({ navigate }) {
  const reportLinks = ['Class Mastery', 'Student Report', 'Grade Distribution', 'Needs Attention', 'Comm. Log', 'Progress'];

  return (
    <Widget title="📊 Reports">
      <div className="reports-header">
        <button onClick={(e) => { e.stopPropagation(); navigate('reports'); }}>See all →</button>
      </div>
      <div className="report-links">
        {reportLinks.map(l => (
          <button key={l} onClick={(e) => { e.stopPropagation(); navigate('reports'); }}>
            {l}
          </button>
        ))}
      </div>
      <div className="report-export">
        <button>🖨 Print</button>
        <button>↑ PDF</button>
        <button>⬛ Spreadsheet</button>
      </div>
    </Widget>
  );
}

ReportsWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(ReportsWidget);

