import React from 'react';
import StudyTimer from '../components/StudyTimer.jsx';

const TimerPage = ({ selectedSubject, selectedMinutes }) => {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Study Timer</h1>
        <p className="page-subtitle">Immerse yourself in focused study sessions with automatic time logging.</p>
      </div>

      <StudyTimer initialSubject={selectedSubject} initialMinutes={selectedMinutes} />
    </div>
  );
};

export default TimerPage;
