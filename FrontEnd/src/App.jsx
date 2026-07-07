import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import QuizPlay from './components/QuizPlay';
import Leaderboard from './components/Leaderboard';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('quizovian_token') || '');
  const [user, setUser] = useState(null);
  const [color, setColor] = useState(() => localStorage.getItem('quizovian_color') || 'pink');
  const [mode, setMode] = useState(() => localStorage.getItem('quizovian_mode') || 'dark');
  const [view, setView] = useState('dashboard');
  const [activeAttempt, setActiveAttempt] = useState(null);

  // Apply theme attributes to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-color', color);
    localStorage.setItem('quizovian_color', color);
  }, [color]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('quizovian_mode', mode);
  }, [mode]);

  // Decode JWT on token load/change
  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('quizovian_token');
      return;
    }

    try {
      // Decode JWT payload (middle block)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Setup current user details
      setUser({
        email: payload.sub,
        username: payload.username || payload.sub, // Fallback if claim is missing
        role: payload.role || 'ROLE_USER', // Fallback to Player
      });
      localStorage.setItem('quizovian_token', token);
    } catch (err) {
      console.error('Failed to decode authentication token:', err);
      // Clean stale token
      setToken('');
      setUser(null);
      localStorage.removeItem('quizovian_token');
    }
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setView('dashboard');
    setActiveAttempt(null);
  };

  const handleStartAttempt = (attempt) => {
    setActiveAttempt(attempt);
    setView('quiz-play');
  };

  const handleBackToDashboard = () => {
    setActiveAttempt(null);
    setView('dashboard');
  };

  return (
    <div className="app-container">
      {/* Drifting Background Orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Floating Navbar */}
      <Navbar 
        user={user} 
        onViewChange={setView} 
        currentView={view} 
        onLogout={handleLogout} 
        color={color}
        setColor={setColor}
        mode={mode}
        setMode={setMode}
      />

      {/* Main Container */}
      <main className="main-content">
        {!user ? (
          <Login onLogin={handleLoginSuccess} />
        ) : (
          <>
            {view === 'dashboard' && (
              user.role === 'ROLE_ADMIN' ? (
                <AdminDashboard token={token} />
              ) : (
                <UserDashboard 
                  token={token} 
                  onStartAttempt={handleStartAttempt} 
                  onViewChange={setView} 
                />
              )
            )}

            {view === 'quiz-play' && activeAttempt && (
              <QuizPlay 
                token={token} 
                activeAttempt={activeAttempt} 
                onBackToDashboard={handleBackToDashboard} 
              />
            )}

            {view === 'leaderboard' && (
              <Leaderboard token={token} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
