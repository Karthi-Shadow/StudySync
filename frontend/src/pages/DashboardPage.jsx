import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStudy } from '../context/StudyContext.jsx';
import TodayRecommendationCard from '../components/TodayRecommendationCard.jsx';
import { Flame, Clock, BookOpen, CheckCircle, Plus, Calendar, ArrowRight } from 'lucide-react';
import { formatMinutes, formatHoursToMinutes } from '../utils/formatTime.js';

const DashboardPage = ({ setActiveTab, onStartTimerForSubject }) => {
  const { user } = useAuth();
  const { subjects, tasks, recommendation, stats, refreshData } = useStudy();

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">
          Welcome back, {user?.name || 'Student'}! 👋
        </h1>
        <p className="page-subtitle">
          Here is your personal study overview for today.
        </p>
      </div>

      {/* Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.18)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Flame size={20} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Day Streak</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.streakDays || 0} Days</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.18)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Clock size={20} color="#8b5cf6" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Today's Study Time</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatMinutes(stats?.todayMinutes || 0)}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.18)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <BookOpen size={20} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Subjects</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{subjects.length}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.18)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <CheckCircle size={20} color="#ec4899" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Study Time</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatMinutes(stats?.totalMinutes || 0)}</h3>
          </div>
        </div>
      </div>

      {/* AI Smart Today Recommendation Card */}
      <TodayRecommendationCard 
        recommendation={recommendation} 
        onStartTimer={(subjectName, mins) => onStartTimerForSubject(subjectName, mins)}
        onRefresh={refreshData}
      />

      {/* Subjects & Tasks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.2rem' }}>
        {/* Subjects Overview */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Subject Progress</h3>
            <button className="btn btn-secondary" onClick={() => setActiveTab('subjects')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          {subjects.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No subjects added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {subjects.slice(0, 4).map(sbj => {
                const compMins = Math.round((sbj.completedHours || 0) * 60);
                const targetMins = Math.round((sbj.targetHours || 1) * 60);
                const percent = Math.min(100, Math.round((compMins / targetMins) * 100));

                return (
                  <div key={sbj._id || sbj.id} style={{ background: 'var(--input-bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: sbj.color || '#a5b4fc' }}>{sbj.name}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{compMins} / {targetMins} mins ({percent}%)</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${percent}%`, background: sbj.color || 'var(--primary-gradient)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Study Tasks */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Tasks To Do</h3>
            <button className="btn btn-secondary" onClick={() => setActiveTab('tasks')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              All Tasks <ArrowRight size={12} />
            </button>
          </div>

          {tasks.filter(t => t.status !== 'completed').length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All caught up! No pending tasks.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tasks.filter(t => t.status !== 'completed').slice(0, 4).map(task => (
                <div key={task._id || task.id} style={{ background: 'var(--input-bg)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.subjectName}</span>
                  </div>
                  <span className={`badge ${task.priority === 'high' ? 'badge-rose' : 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
