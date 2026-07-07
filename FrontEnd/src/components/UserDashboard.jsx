import React, { useState, useEffect } from 'react';
import { Play, Key, Award, Clock, ArrowRight, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function UserDashboard({ token, onStartAttempt, onViewChange }) {
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz join states
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [activeQuizForPassword, setActiveQuizForPassword] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch all quizzes
      const quizRes = await fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!quizRes.ok) throw new Error('Failed to fetch quizzes');
      const quizData = await quizRes.json();
      setQuizzes(quizData);

      // 2. Fetch user attempt history
      const historyRes = await fetch('/api/attempts/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!historyRes.ok) throw new Error('Failed to fetch attempt history');
      const historyData = await historyRes.json();
      setHistory(historyData);

      // 3. Fetch top overall leaderboard
      const lbRes = await fetch('/api/leaderboard/overall', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!lbRes.ok) throw new Error('Failed to fetch leaderboard');
      const lbData = await lbRes.json();
      // Only keep top 5
      setOverallLeaderboard(lbData.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Join quiz by entering code
  const handleJoinByCodeSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    
    // Find if this quiz is already loaded and is password protected
    const matchingQuiz = quizzes.find(q => q.quizCode.toUpperCase() === joinCode.trim().toUpperCase());
    
    if (matchingQuiz && matchingQuiz.passwordProtected) {
      setActiveQuizForPassword(matchingQuiz);
      setShowPasswordModal(true);
      return;
    }
    
    // Attempt to join directly
    await executeJoin(joinCode.trim(), '');
  };

  const handlePasswordModalSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuizForPassword) return;
    await executeJoin(activeQuizForPassword.quizCode, joinPassword);
  };

  const executeJoin = async (code, password) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/attempts/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizCode: code,
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to join quiz. Check code and password.');
      }

      const attemptData = await response.json();
      setShowPasswordModal(false);
      setJoinPassword('');
      setActiveQuizForPassword(null);
      
      // Callback to root component to enter "quiz-play" view
      onStartAttempt(attemptData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuizClick = (quiz) => {
    if (quiz.passwordProtected) {
      setActiveQuizForPassword(quiz);
      setShowPasswordModal(true);
    } else {
      executeJoin(quiz.quizCode, '');
    }
  };

  // Compute overall statistics
  const totalAttempts = history.length;
  const averagePercentage = totalAttempts > 0 
    ? (history.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalAttempts).toFixed(1)
    : 0;

  return (
    <div className="dashboard-grid">
      
      {/* Left Column: Join Quiz & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Join Quiz Glass Card */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key style={{ color: 'var(--primary-color)' }} />
            <span>Join a Quiz Session</span>
          </h2>
          <form onSubmit={handleJoinByCodeSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="glass-input"
                style={{ width: '100%', textTransform: 'uppercase' }}
                placeholder="ENTER QUIZ CODE (e.g. QZ-XXXXXX)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-glow" disabled={loading}>
              <span>Enter Session</span>
              <ArrowRight size={18} />
            </button>
          </form>
          {error && (
            <div className="alert-box alert-error" style={{ marginTop: '16px', marginBottom: 0 }}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* User Stats Summary */}
        <div className="stats-row">
          <div className="glass-card stat-item">
            <Clock size={24} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
            <div className="stat-val">{totalAttempts}</div>
            <div className="stat-lbl">Quizzes Taken</div>
          </div>
          <div className="glass-card stat-item">
            <Award size={24} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
            <div className="stat-val">{averagePercentage}%</div>
            <div className="stat-lbl">Avg Score</div>
          </div>
        </div>

        {/* User Attempt History */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Attempts</h2>
            <button onClick={fetchData} className="btn-glass" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <RefreshCw size={14} />
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="empty-state">
              <p>You haven't attempted any quizzes yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.attemptId}>
                      <td style={{ fontWeight: 600 }}>{item.quizTitle}</td>
                      <td>{item.score} / {item.totalQuestions}</td>
                      <td>
                        <span className={`badge ${item.percentage >= 70 ? 'badge-blue' : 'badge-purple'}`}>
                          {item.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(item.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Available Quizzes & Overall Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Available Quizzes */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px' }}>Available Quizzes</h2>
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <p>No quizzes available currently.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="glass-card interactive" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="quiz-info">
                    <h3 style={{ fontSize: '1.1rem' }}>{quiz.title}</h3>
                    <div className="quiz-meta" style={{ marginBottom: '12px' }}>
                      <span className="quiz-meta-item quiz-code-badge">{quiz.quizCode}</span>
                      <span className="quiz-meta-item">{quiz.totalQuestions} Questions</span>
                      {quiz.passwordProtected && (
                        <span className="quiz-meta-item" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)' }}>
                          Protected
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartQuizClick(quiz)}
                    className="btn-glow" 
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.9rem' }}
                  >
                    <Play size={14} />
                    <span>Start Quiz</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 5 Leaderboard widget */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award style={{ color: 'var(--primary-color)' }} />
              <span>Leaderboard Top 5</span>
            </h2>
            <button onClick={() => onViewChange('leaderboard')} className="auth-toggle-link" style={{ fontSize: '0.85rem' }}>
              View All
            </button>
          </div>
          {overallLeaderboard.length === 0 ? (
            <div className="empty-state">
              <p>No rankings available yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {overallLeaderboard.map((user, idx) => (
                <div key={user.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`rank-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.username}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                    {user.averagePercentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal Overlay */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <button 
              className="modal-close" 
              onClick={() => { setShowPasswordModal(false); setJoinPassword(''); setActiveQuizForPassword(null); }}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key style={{ color: 'var(--primary-color)' }} />
              <span>Enter Quiz Password</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              The quiz <strong>"{activeQuizForPassword?.title}"</strong> requires a password to attempt.
            </p>
            <form onSubmit={handlePasswordModalSubmit}>
              <div className="glass-group" style={{ marginBottom: '24px' }}>
                <label className="glass-label">Quiz Password</label>
                <input
                  type="password"
                  className="glass-input"
                  placeholder="••••••••"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-glass" 
                  onClick={() => { setShowPasswordModal(false); setJoinPassword(''); setActiveQuizForPassword(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-glow">
                  Unlock & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
