import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Sparkles, Check } from 'lucide-react';
import { useStudy } from '../context/StudyContext.jsx';

const StudyTimer = ({ initialSubject, initialMinutes }) => {
  const { subjects, tasks, logStudySession, updateTaskStatus } = useStudy();

  const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(initialMinutes || 25);
  const [secondsLeft, setSecondsLeft] = useState((initialMinutes || 25) * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // focus, shortBreak, longBreak
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedMinsLogged, setCompletedMinsLogged] = useState(0);

  useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialMinutes) {
      setTimerMinutes(initialMinutes);
      setSecondsLeft(initialMinutes * 60);
    }
  }, [initialSubject, initialMinutes]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      triggerFinishModal();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const switchMode = (mode, mins) => {
    setIsActive(false);
    setTimerMode(mode);
    setTimerMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const triggerFinishModal = () => {
    const elapsed = Math.max(1, Math.round((timerMinutes * 60 - secondsLeft) / 60));
    setCompletedMinsLogged(elapsed);
    setShowCompleteModal(true);
  };

  const handleConfirmCompletion = async (markTaskDone) => {
    const targetSubj = subjects.find(s => s.name === selectedSubject);

    // 1. Log study minutes to backend
    await logStudySession({
      subjectId: targetSubj ? (targetSubj._id || targetSubj.id) : null,
      subjectName: selectedSubject || 'General Study',
      durationMinutes: completedMinsLogged,
      notes: 'Study session completed',
      sessionType: 'focus_session'
    });

    // 2. If user requested to mark task done, update task status!
    if (markTaskDone && selectedTaskId) {
      await updateTaskStatus(selectedTaskId, 'completed');
    }

    setShowCompleteModal(false);
    resetTimer();
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, ((timerMinutes * 60 - secondsLeft) / (timerMinutes * 60)) * 100));

  const availableTasks = tasks.filter(t => t.status !== 'completed' && (!selectedSubject || t.subjectName === selectedSubject));
  const activeTaskObj = tasks.find(t => t._id === selectedTaskId || t.id === selectedTaskId);

  return (
    <div className="glass-panel" style={{ padding: '1.8rem', maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          Study Timer
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Focus on your studies in 25-minute sessions. Time spent will be added to your study progress automatically.
        </p>
      </div>

      {/* Preset Timer Modes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <button 
          className={`btn ${timerMode === 'focus' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => switchMode('focus', 25)}
          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
        >
          25 Min Study
        </button>
        <button 
          className={`btn ${timerMode === 'shortBreak' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => switchMode('shortBreak', 5)}
          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
        >
          5 Min Rest
        </button>
        <button 
          className={`btn ${timerMode === 'longBreak' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => switchMode('longBreak', 15)}
          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
        >
          15 Min Break
        </button>
      </div>

      {/* Subject & Task Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', textAlign: 'left' }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.76rem' }}>Select Subject:</label>
          <select 
            className="form-select"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTaskId('');
            }}
          >
            <option value="">General Study</option>
            {subjects.map(s => (
              <option key={s._id || s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.76rem' }}>Working On Task (Optional):</label>
          <select 
            className="form-select"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">No task linked</option>
            {availableTasks.map(t => (
              <option key={t._id || t.id} value={t._id || t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timer Progress Ring */}
      <div style={{
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        margin: '0 auto 1.2rem auto',
        background: `conic-gradient(var(--primary) ${progressPercent * 3.6}deg, rgba(148,163,184,0.15) 0deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'var(--bg-dark)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2.3rem', fontWeight: 800, fontFamily: 'Outfit, monospace', color: 'var(--text-main)' }}>
            {formatTime(secondsLeft)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isActive ? 'Studying...' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
        <button 
          className="btn btn-primary"
          onClick={toggleTimer}
          style={{ width: '120px' }}
        >
          {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={resetTimer}
        >
          <RotateCcw size={16} /> Reset
        </button>
        <button 
          className="btn btn-secondary"
          onClick={triggerFinishModal}
          title="Finish session and save study time"
        >
          <CheckCircle size={16} color="#10b981" /> Save Session
        </button>
      </div>

      {/* Session Completion Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Sparkles size={24} color="#10b981" />
            </div>

            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              Study Session Finished 🎉
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              You completed <strong>{completedMinsLogged} minutes</strong> of focus study.
            </p>

            {activeTaskObj ? (
              <div style={{ background: 'var(--input-bg)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.2rem', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Linked Task:</span>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>{activeTaskObj.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Would you like to mark this task as Completed on your task list?</p>
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeTaskObj && (
                <button className="btn btn-primary" onClick={() => handleConfirmCompletion(true)} style={{ width: '100%' }}>
                  <Check size={16} /> Yes, Mark Task as Done!
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => handleConfirmCompletion(false)} style={{ width: '100%' }}>
                {activeTaskObj ? 'Keep Task In Progress & Save Time' : 'Save Study Time'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
