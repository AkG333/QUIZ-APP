import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Star, Users } from 'lucide-react';

export default function Leaderboard({ token }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(''); // Empty string means "Overall"
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch lists of quizzes for filtering
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (err) {
        console.error('Error fetching quizzes for dropdown:', err);
      }
    };
    fetchQuizzes();
  }, [token]);

  // Fetch rankings
  const fetchRankings = async () => {
    setLoading(true);
    setError('');
    const url = selectedQuizId 
      ? `/api/leaderboard/quiz/${selectedQuizId}`
      : '/api/leaderboard/overall';
      
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch leaderboard data');
      const data = await res.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [selectedQuizId, token]);

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      
      {/* Header controls */}
      <div className="admin-header-row" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '20px' }}>
        <div>
          <h2 className="shimmer-text" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy className="text-glow" style={{ color: 'var(--primary-color)' }} />
            <span>Championship Leaderboard</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>See top scores and average player rankings</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: '280px' }}>
          <select 
            className="glass-select" 
            style={{ flex: 1 }}
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            <option value="">Global Overall Averages</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
          <button onClick={fetchRankings} className="btn-icon" title="Refresh standings">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Gathering rankings...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ color: 'var(--error-color)' }}>
          <p>{error}</p>
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="empty-state">
          <p>No attempts recorded for this category yet.</p>
        </div>
      ) : (
        /* Leaderboard table */
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table className="leaderboard-table">
            <thead>
              {selectedQuizId ? (
                // Quiz Specific headers
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Score Correct</th>
                  <th>Score Percentage</th>
                  <th>Completed At</th>
                </tr>
              ) : (
                // Overall Averages headers
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Quizzes Taken</th>
                  <th>Accumulated Score</th>
                  <th>Average Score Percentage</th>
                </tr>
              )}
            </thead>
            <tbody>
              {leaderboardData.map((entry, idx) => (
                <tr key={entry.username}>
                  <td>
                    <span className={`rank-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none', padding: '16px 0' }}>
                    {idx === 0 && <Star size={14} style={{ color: '#ffd700', fill: '#ffd700' }} />}
                    <span>{entry.username}</span>
                  </td>
                  
                  {selectedQuizId ? (
                    // Quiz Specific fields
                    <>
                      <td>{entry.score} / {entry.totalQuestions}</td>
                      <td>
                        <span className="badge badge-blue">
                          {(entry.percentage || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(entry.completedAt).toLocaleString()}
                      </td>
                    </>
                  ) : (
                    // Overall Averages fields
                    <>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} style={{ color: 'var(--text-muted)' }} />
                          {entry.quizzesAttempted} Quizzes
                        </span>
                      </td>
                      <td>{entry.totalScore} Points</td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
                          {(entry.averagePercentage || 0).toFixed(1)}%
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
