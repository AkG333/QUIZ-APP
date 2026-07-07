import React from 'react';
import { LogOut, LayoutDashboard, Trophy, Lightbulb, User } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Navbar({ user, onViewChange, currentView, onLogout, color, setColor, mode, setMode, onQuoteClick }) {
  return (
    <nav className="navbar">
      <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); onQuoteClick(); }} title="View Thought of the Day">
        <Lightbulb size={20} className="text-glow" style={{ color: 'var(--primary-color)', cursor: 'pointer' }} />
        <span>Quizovian</span>
      </a>

      {user && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button 
            className={`btn-nav-logout`}
            style={{ 
              color: currentView === 'dashboard' ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: currentView === 'dashboard' ? '700' : '500'
            }}
            onClick={() => onViewChange('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`btn-nav-logout`}
            style={{ 
              color: currentView === 'leaderboard' ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: currentView === 'leaderboard' ? '700' : '500'
            }}
            onClick={() => onViewChange('leaderboard')}
          >
            <Trophy size={18} />
            <span>Leaderboard</span>
          </button>
        </div>
      )}

      <div className="nav-actions">
        <ThemeSelector color={color} setColor={setColor} mode={mode} setMode={setMode} />
        
        {user && (
          <>
            <div className="nav-user">
              <User size={14} style={{ color: 'var(--primary-color)' }} />
              <span>{user.username}</span>
              <span className="role-badge">
                {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Player'}
              </span>
            </div>
            <button className="btn-nav-logout" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
