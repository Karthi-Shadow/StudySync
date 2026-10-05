import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { StudyProvider } from './context/StudyContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import SubjectsPlannerPage from './pages/SubjectsPlannerPage.jsx';
import TaskBoardPage from './pages/TaskBoardPage.jsx';
import TimerPage from './pages/TimerPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timerSubject, setTimerSubject] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(25);

  const [theme, setTheme] = useState(() => localStorage.getItem('study_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('study_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
        Loading StudySync Application...
      </div>
    );
  }

  if (!user) {
    return <AuthPage theme={theme} toggleTheme={toggleTheme} />;
  }

  const handleStartTimerForSubject = (subjectName, minutes) => {
    setTimerSubject(subjectName);
    setTimerMinutes(minutes || 25);
    setActiveTab('timer');
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
        
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="main-content">
            {activeTab === 'dashboard' && (
              <DashboardPage 
                setActiveTab={setActiveTab} 
                onStartTimerForSubject={handleStartTimerForSubject} 
              />
            )}
            {activeTab === 'subjects' && <SubjectsPlannerPage />}
            {activeTab === 'tasks' && <TaskBoardPage />}
            {activeTab === 'timer' && (
              <TimerPage selectedSubject={timerSubject} selectedMinutes={timerMinutes} />
            )}
            {activeTab === 'analytics' && <AnalyticsPage />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <MainLayout />
      </StudyProvider>
    </AuthProvider>
  );
}
