import React from 'react';
import { Sparkles, Clock, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatMinutes } from '../utils/formatTime.js';

const TodayRecommendationCard = ({ recommendation, onStartTimer, onRefresh }) => {
  if (!recommendation) return null;

  const { recommendations, dailyGoalHours, message } = recommendation;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
            <Sparkles size={20} color="#a5b4fc" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Today's Recommended Study Plan
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Based on your upcoming deadlines and daily goal ({formatMinutes((dailyGoalHours || 3) * 60)})
            </span>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={onRefresh}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
        >
          <RefreshCw size={13} /> Refresh Plan
        </button>
      </div>

      {(!recommendations || recommendations.length === 0) ? (
        <div style={{ padding: '1.2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={24} color="#f59e0b" style={{ marginBottom: '0.4rem' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No subjects added yet! Go to <strong>My Subjects</strong> to add your courses and deadlines.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '0.8rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: rec.color || '#8b5cf6' }}>
                    {rec.subjectName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Clock size={12} color="#a5b4fc" />
                    <span>{formatMinutes(rec.allocatedMinutes)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.35rem 0.55rem', borderRadius: '6px' }}>
                  {rec.reason}
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={() => onStartTimer(rec.subjectName, rec.allocatedMinutes)}
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
              >
                <PlayCircle size={15} /> Start Studying
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayRecommendationCard;
