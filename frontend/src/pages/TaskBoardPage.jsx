import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext.jsx';
import { Plus, CheckSquare, Clock, Play, CheckCircle, RotateCcw, FileText } from 'lucide-react';

const TaskBoardPage = () => {
  const { tasks, subjects, addTask, updateTaskStatus } = useStudy();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    const targetSubj = subjects.find(s => (s._id === subjectId || s.id === subjectId));

    const success = await addTask({
      title,
      description,
      subjectId: subjectId || null,
      subjectName: targetSubj ? targetSubj.name : 'General Study',
      priority,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes)
    });

    if (success) {
      setShowModal(false);
      setTitle('');
      setDescription('');
      setSubjectId('');
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', badgeClass: 'badge-purple' },
    { id: 'in_progress', title: 'In Progress', badgeClass: 'badge-amber' },
    { id: 'review', title: 'Needs Review', badgeClass: 'badge-rose' },
    { id: 'completed', title: 'Done', badgeClass: 'badge-emerald' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">My Study Tasks</h1>
          <p className="page-subtitle">Track your daily study goals and mark tasks as done when completed.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New Task
        </button>
      </div>

      {/* Task Board Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', alignItems: 'start' }}>
        {columns.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="glass-panel" style={{ padding: '1rem', minHeight: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className={`badge ${col.badgeClass}`}>{col.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>({columnTasks.length})</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {columnTasks.map(task => (
                  <div key={task._id || task.id} style={{ background: 'var(--input-bg)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{task.title}</h4>
                      <span className={`badge ${task.priority === 'high' ? 'badge-rose' : task.priority === 'medium' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                      </span>
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{task.description}</p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: '#a5b4fc' }}>{task.subjectName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {task.estimatedMinutes} mins
                      </span>
                    </div>

                    {/* Human Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                      {col.id === 'todo' && (
                        <>
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'in_progress')}
                          >
                            <Play size={12} /> Start Task
                          </button>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'completed')}
                            title="Mark directly as Done"
                          >
                            <CheckCircle size={12} color="#10b981" /> Done
                          </button>
                        </>
                      )}

                      {col.id === 'in_progress' && (
                        <>
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'completed')}
                          >
                            <CheckCircle size={12} /> Mark Done
                          </button>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'review')}
                            title="Send to Review"
                          >
                            <FileText size={12} /> Review
                          </button>
                        </>
                      )}

                      {col.id === 'review' && (
                        <>
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'completed')}
                          >
                            <CheckCircle size={12} /> Approve & Done
                          </button>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => updateTaskStatus(task._id || task.id, 'in_progress')}
                            title="Move back to In Progress"
                          >
                            <RotateCcw size={12} /> Needs Work
                          </button>
                        </>
                      )}

                      {col.id === 'completed' && (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                          onClick={() => updateTaskStatus(task._id || task.id, 'todo')}
                        >
                          <RotateCcw size={12} /> Put Back to To-Do
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Add New Study Task</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input type="text" className="form-input" required placeholder="e.g. Read Chapter 3 and solve exercises" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Details / Notes</label>
                <textarea className="form-textarea" rows="2" placeholder="Add study notes or resource link..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Subject</label>
                  <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                    <option value="">General Task</option>
                    {subjects.map(s => (
                      <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expected Time (Minutes)</label>
                  <input type="number" className="form-input" min="5" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Due Date</label>
                  <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoardPage;
