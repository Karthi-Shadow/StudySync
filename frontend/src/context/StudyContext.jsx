import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      refreshData();
    } else {
      setSubjects([]);
      setTasks([]);
      setRecommendation(null);
      setStats(null);
    }
  }, [token]);

  const refreshData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchSubjects(),
        fetchTasks(),
        fetchRecommendations(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Refresh data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.subjects || []);
    }
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks || []);
    }
  };

  const fetchRecommendations = async () => {
    const res = await fetch('/api/study/recommendation', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setRecommendation(data);
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/study/stats', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  const addSubject = async (subjectData) => {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(subjectData)
    });
    if (res.ok) {
      refreshData();
      return true;
    }
    return false;
  };

  const addTask = async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    if (res.ok) {
      refreshData();
      return true;
    }
    return false;
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      fetchTasks();
    }
  };

  const logStudySession = async (sessionData) => {
    const res = await fetch('/api/study/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(sessionData)
    });
    if (res.ok) {
      refreshData();
      return true;
    }
    return false;
  };

  return (
    <StudyContext.Provider value={{
      subjects,
      tasks,
      recommendation,
      stats,
      loading,
      refreshData,
      addSubject,
      addTask,
      updateTaskStatus,
      logStudySession
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => useContext(StudyContext);
