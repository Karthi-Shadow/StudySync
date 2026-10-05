import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext.jsx';
import { Plus, BookOpen, Calendar, Clock, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { formatMinutes } from '../utils/formatTime.js';

const SubjectsPlannerPage = () => {
  const { subjects, addSubject } = useStudy();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [targetHours, setTargetHours] = useState(25);
  const [deadline, setDeadline] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState([]);

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    setTopics([...topics, { title: topicInput.trim(), isCompleted: false }]);
    setTopicInput('');
  };

  const handleRemoveTopic = (idx) => {
    setTopics(topics.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !deadline) return;

    const success = await addSubject({
      name,
      code,
      color,
      targetHours: Number(targetHours),
      deadline,
      difficulty,
      topics
    });

    if (success) {
      setShowModal(false);
      setName('');
      setCode('');
      setTargetHours(25);
      setDeadline('');
      setTopics([]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">My Subjects</h1>
          <p className="page-subtitle">Add your courses, set target study hours, and track upcoming deadlines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
        {subjects.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            <BookOpen size={36} color="#8b5cf6" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>No Subjects Added Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Add your first subject to start tracking study hours and schedule!
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Subject
            </button>
          </div>
        ) : (
          subjects.map(sbj => {
            const compMins = Math.round((sbj.completedHours || 0) * 60);
            const targetMins = Math.round((sbj.targetHours || 1) * 60);
            const percent = Math.min(100, Math.round((compMins / targetMins) * 100));
            const daysLeft = Math.max(0, Math.ceil((new Date(sbj.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

            return (
              <div key={sbj._id || sbj.id} className="glass-panel glass-panel-interactive" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sbj.color || '#6366f1' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{sbj.name}</h3>
                  </div>
                  {sbj.code && <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{sbj.code}</span>}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {compMins} / {targetMins} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: daysLeft < 7 ? '#f43f5e' : 'var(--text-muted)' }}>
                    <Calendar size={13} /> {daysLeft} days left
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Study Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{percent}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${percent}%`, background: sbj.color || 'var(--primary-gradient)' }} />
                  </div>
                </div>

                {/* Topics Checklist Preview */}
                {sbj.topics && sbj.topics.length > 0 && (
                  <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Topic List ({sbj.topics.filter(t => t.isCompleted).length}/{sbj.topics.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                      {sbj.topics.slice(0, 3).map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-main)' }}>
                          {t.isCompleted ? <CheckCircle2 size={13} color="#10b981" /> : <Circle size={13} color="var(--text-dim)" />}
                          <span style={{ textDecoration: t.isCompleted ? 'line-through' : 'none' }}>{t.title}</span>
                        </div>
                      ))}
                      {sbj.topics.length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>+{sbj.topics.length - 3} more topics</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Add New Subject</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input type="text" className="form-input" required placeholder="e.g. Mathematics or Computer Science" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Course Code (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. CS101" value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Goal Study Hours *</label>
                  <input type="number" className="form-input" required min="1" value={targetHours} onChange={e => setTargetHours(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Deadline *</label>
                  <input type="date" className="form-input" required value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Color</label>
                  <input type="color" className="form-input" style={{ padding: '0.2rem 0.4rem', height: '40px', cursor: 'pointer' }} value={color} onChange={e => setColor(e.target.value)} />
                </div>
              </div>

              {/* Add Topics */}
              <div className="form-group">
                <label className="form-label">Add Topics / Chapter Checklist</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input type="text" className="form-input" placeholder="e.g. Chapter 1 Basics" value={topicInput} onChange={e => setTopicInput(e.target.value)} />
                  <button type="button" className="btn btn-secondary" onClick={handleAddTopic}>Add</button>
                </div>
                {topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                    {topics.map((t, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                        {t.title}
                        <Trash2 size={11} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTopic(idx)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPlannerPage;
