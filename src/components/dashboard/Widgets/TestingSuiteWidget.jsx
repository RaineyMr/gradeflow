// Similar structure as other widgets...
import React from 'react';
import PropTypes from 'prop-types';
import Widget from '../../ui/Widget';

function TestingSuiteWidget({ navigate }) {
  return (
    <Widget title="🧪 Testing Suite">
      {/* Content extracted from original */}
      <button onClick={(e) => { e.stopPropagation(); navigate('testingSuite'); }}>Create Test →</button>
    </Widget>
  );
}

TestingSuiteWidget.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default React.memo(TestingSuiteWidget);

