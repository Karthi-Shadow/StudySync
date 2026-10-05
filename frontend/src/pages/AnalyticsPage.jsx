import React from 'react';
import { useStudy } from '../context/StudyContext.jsx';
import { BarChart3, Flame, Clock, Calendar, Star, Award } from 'lucide-react';
import { formatMinutes } from '../utils/formatTime.js';

const AnalyticsPage = () => {
  const { stats, subjects } = useStudy();

  const recentSessions = stats?.recentSessions || [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Track your study time, subject progress, and study session history.</p>
      </div>

      {/* Top Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Award size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Day Streak</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.streakDays || 0} Days 🔥</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Clock size={18} color="#8b5cf6" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Study Time</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatMinutes(stats?.totalMinutes || 0)}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <BarChart3 size={18} color="#10b981" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Sessions</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalSessionsCount || 0}</h3>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Time Spent Per Subject
        </h3>

        {subjects.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No study data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjects.map(sbj => {
              const compMins = Math.round((sbj.completedHours || 0) * 60);
              const targetMins = Math.round((sbj.targetHours || 1) * 60);
              const pct = Math.min(100, Math.round((compMins / targetMins) * 100));

              return (
                <div key={sbj._id || sbj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: sbj.color || '#a5b4fc' }}>{sbj.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{compMins} / {targetMins} mins ({pct}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: sbj.color || 'var(--primary-gradient)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sessions Table */}
      <div className="glass-panel" style={{ padding: '1.2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.9rem' }}>
          Recent Study Sessions Logged
        </h3>

        {recentSessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No study sessions recorded yet. Start the Study Timer to log your first session!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Subject</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Study Time</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Mode</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((ses, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem 0.4rem', fontWeight: 600, color: 'var(--text-main)' }}>{ses.subjectName}</td>
                    <td style={{ padding: '0.6rem 0.4rem', color: '#a5b4fc' }}>{ses.durationMinutes} mins</td>
                    <td style={{ padding: '0.6rem 0.4rem' }}>
                      <span className="badge badge-purple">{ses.sessionType}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.4rem', color: 'var(--text-muted)' }}>
                      {new Date(ses.date).toLocaleDateString()} {new Date(ses.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
