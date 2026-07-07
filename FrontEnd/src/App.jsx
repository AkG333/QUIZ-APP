import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import QuizPlay from './components/QuizPlay';
import Leaderboard from './components/Leaderboard';
import { Lightbulb } from 'lucide-react';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('quizovian_token') || '');
  const [user, setUser] = useState(null);
  const [color, setColor] = useState(() => localStorage.getItem('quizovian_color') || 'pink');
  const [mode, setMode] = useState(() => localStorage.getItem('quizovian_mode') || 'dark');
  const [view, setView] = useState('dashboard');
  const [activeAttempt, setActiveAttempt] = useState(null);

  // Quote states
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const fetchQuote = async () => {
    setQuoteLoading(true);
    const fallbacks = [
      { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
      { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
      { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
      { quote: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", author: "Albert Einstein" },
      { quote: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
      { quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
      { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" }
    ];

    try {
      const res = await fetch('https://dummyjson.com/quotes/random');
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setQuote({ quote: data.quote, author: data.author });
    } catch (err) {
      const randomIdx = Math.floor(Math.random() * fallbacks.length);
      setQuote(fallbacks[randomIdx]);
    } finally {
      setQuoteLoading(false);
      setShowQuoteModal(true);
    }
  };

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
        onQuoteClick={fetchQuote}
      />

      {/* Main Container */}
      <main className="main-content">
        {!user ? (
          <Login onLogin={handleLoginSuccess} onQuoteClick={fetchQuote} />
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

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '36px' }}>
            <button className="modal-close" onClick={() => setShowQuoteModal(false)}>✕</button>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
              <Lightbulb size={32} style={{ color: 'var(--primary-color)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontFamily: 'var(--font-title)' }}>Thought of the Day</h3>
            {quoteLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Seeking inspiration...</p>
            ) : (
              <>
                <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: '1.5', marginBottom: '12px' }}>
                  "{quote?.quote}"
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                  — {quote?.author}
                </p>
              </>
            )}
            <button className="btn-glow" style={{ marginTop: '20px', padding: '8px 24px', fontSize: '0.9rem' }} onClick={() => setShowQuoteModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
