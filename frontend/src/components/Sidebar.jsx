import React from 'react';
import { LayoutDashboard, BookMarked, CheckSquare, Timer, BarChart3 } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookMarked },
    { id: 'tasks', label: 'Study Tasks', icon: CheckSquare },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'analytics', label: 'My Progress', icon: BarChart3 },
  ];

  return (
    <aside style={{
      width: '250px',
      borderRight: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.8rem 0.5rem 0.8rem' }}>
        Navigation
      </div>
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isActive ? 'var(--primary-gradient)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
              textAlign: 'left'
            }}
          >
            <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
