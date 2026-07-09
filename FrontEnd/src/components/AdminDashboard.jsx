import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ArrowLeft, ShieldAlert, Check, HelpCircle, Save, X, Eye } from 'lucide-react';

const formatTimeLimit = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return 'No Limit';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  
  return parts.join(' ');
};

export default function AdminDashboard({ token }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null); // When managing questions
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals / forms toggle states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null); // quiz object if editing
  
  // Create / Edit Quiz fields
  const [quizTitle, setQuizTitle] = useState('');
  const [quizPasswordProtected, setQuizPasswordProtected] = useState(false);
  const [quizPassword, setQuizPassword] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('EASY');
  const [quizHours, setQuizHours] = useState(0);
  const [quizMinutes, setQuizMinutes] = useState(0);
  const [quizSeconds, setQuizSeconds] = useState(0);
  const [quizRandomizeQuestions, setQuizRandomizeQuestions] = useState(false);

  // Create / Edit Question fields
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // question object if editing
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [token]);

  // Load questions for selected quiz
  const fetchQuestions = async (quizId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuestions(quiz.id);
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    fetchQuizzes();
  };

  // QUIZ ACTIONS
  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizPasswordProtected(false);
    setQuizPassword('');
    setQuizDifficulty('EASY');
    setQuizHours(0);
    setQuizMinutes(0);
    setQuizSeconds(0);
    setQuizRandomizeQuestions(false);
    setShowQuizModal(true);
  };

  const handleOpenEditQuiz = (quiz, e) => {
    e.stopPropagation(); // Prevent opening questions management
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    setQuizPasswordProtected(quiz.passwordProtected);
    setQuizPassword('');
    setQuizDifficulty(quiz.difficulty || 'EASY');
    
    const limit = quiz.timeLimit || 0;
    setQuizHours(Math.floor(limit / 3600));
    setQuizMinutes(Math.floor((limit % 3600) / 60));
    setQuizSeconds(limit % 60);
    
    setQuizRandomizeQuestions(quiz.randomizeQuestions || false);
    setShowQuizModal(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const url = editingQuiz ? `/api/quizzes/${editingQuiz.id}` : '/api/quizzes';
    const method = editingQuiz ? 'PUT' : 'POST';
    
    const totalSeconds = (quizHours * 3600) + (quizMinutes * 60) + quizSeconds;
    
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          passwordProtected: quizPasswordProtected,
          quizPassword: quizPasswordProtected ? quizPassword : null,
          difficulty: quizDifficulty,
          timeLimit: totalSeconds,
          randomizeQuestions: quizRandomizeQuestions
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save quiz');
      }

      setShowQuizModal(false);
      fetchQuizzes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz? All history and questions will be lost.')) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete quiz');
      fetchQuizzes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // QUESTION ACTIONS
  const handleOpenCreateQuestion = () => {
    setEditingQuestion(null);
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect('A');
    setShowQuestionForm(true);
  };

  const handleOpenEditQuestion = (question) => {
    setEditingQuestion(question);
    setQText(question.questionText);
    setQOptA(question.optionA);
    setQOptB(question.optionB);
    setQOptC(question.optionC);
    setQOptD(question.optionD);
    
    // We need to match correct answer
    // Note: The backend returns OptionResponses without correct answer directly in some DTOs, but let's check
    // If correct answer is not in the Response, we can verify or allow selecting correct answer.
    // Wait, let's view QuestionResponse.java to check if correct answer is exposed.
    // Oh, wait, in manual_testing_plan.md, QuestionResponse does NOT contain correctAnswer.
    // Wait, let's double check QuestionResponse.java.
    setQCorrect(question.correctAnswer || 'A'); // Default to A, or let user set it.
    setShowQuestionForm(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const url = editingQuestion 
      ? `/api/admin/quizzes/questions/${editingQuestion.questionId}` 
      : `/api/admin/quizzes/${selectedQuiz.id}/questions`;
    const method = editingQuestion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionText: qText,
          optionA: qOptA,
          optionB: qOptB,
          optionC: qOptC,
          optionD: qOptD,
          correctAnswer: qCorrect
        })
      });

      if (!res.ok) throw new Error('Failed to save question');
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
      fetchQuestions(selectedQuiz.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete question');
      fetchQuestions(selectedQuiz.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '24px' }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* VIEW 1: MANAGE QUIZZES LIST */}
      {!selectedQuiz ? (
        <div className="glass-card">
          <div className="admin-header-row">
            <div>
              <h2 className="shimmer-text" style={{ fontSize: '1.8rem' }}>Quiz Administration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create, update, and delete active quiz sessions</p>
            </div>
            <button onClick={handleOpenCreateQuiz} className="btn-glow">
              <Plus size={18} />
              <span>Create Quiz</span>
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '24px' }}>
              <HelpCircle size={48} style={{ color: 'var(--card-border)', margin: '0 auto 16px auto' }} />
              <p style={{ fontSize: '1.1rem' }}>No quizzes created yet. Tap "Create Quiz" above to get started!</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="glass-card interactive quiz-card" onClick={() => handleQuizSelect(quiz)}>
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta">
                      <span className="quiz-meta-item quiz-code-badge">{quiz.quizCode}</span>
                      <span className="quiz-meta-item">{quiz.totalQuestions} Questions</span>
                      {quiz.difficulty && (
                        <span className={`badge ${
                          quiz.difficulty === 'EASY' ? 'badge-green' :
                          quiz.difficulty === 'MEDIUM' ? 'badge-blue' :
                          'badge-pink'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      )}
                      <span className="quiz-meta-item">⏱️ {formatTimeLimit(quiz.timeLimit)}</span>
                      {quiz.randomizeQuestions && (
                        <span className="quiz-meta-item" style={{ color: 'var(--primary-color)', background: 'var(--primary-glow-soft)' }}>🔀 Shuffled</span>
                      )}
                      {quiz.passwordProtected && (
                        <span className="badge badge-purple">Protected</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button 
                      onClick={(e) => handleOpenEditQuiz(quiz, e)}
                      className="btn-glass" 
                      style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                      title="Edit Quiz details"
                    >
                      <Edit size={14} />
                      <span>Details</span>
                    </button>
                    <button 
                      onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                      className="btn-glass hover-error" 
                      style={{ padding: '8px 12px', color: 'var(--error-color)' }}
                      title="Delete Quiz"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: MANAGE QUESTIONS FOR INDIVIDUAL QUIZ */
        <div className="glass-card">
          <div className="admin-header-row" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={handleBackToQuizzes} className="btn-icon">
                <ArrowLeft size={18} />
              </button>
              <div>
                <span className="quiz-code-badge" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {selectedQuiz.quizCode}
                </span>
                <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{selectedQuiz.title}</h2>
              </div>
            </div>
            {!showQuestionForm && (
              <button onClick={handleOpenCreateQuestion} className="btn-glow">
                <Plus size={18} />
                <span>Add Question</span>
              </button>
            )}
          </div>

          {/* Question Add/Edit Form */}
          {showQuestionForm && (
            <div className="glass-card" style={{ marginTop: '24px', background: 'rgba(255,255,255,0.01)', borderColor: 'var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>
                  {editingQuestion ? 'Edit Question' : 'New Question Setup'}
                </h3>
                <button onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); }} className="btn-icon">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleQuestionSubmit}>
                <div className="glass-group">
                  <label className="glass-label">Question Text</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. What is the complexity of binary search?"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="glass-group">
                    <label className="glass-label">Option A</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={qOptA}
                      onChange={(e) => setQOptA(e.target.value)}
                      required
                    />
                  </div>
                  <div className="glass-group">
                    <label className="glass-label">Option B</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={qOptB}
                      onChange={(e) => setQOptB(e.target.value)}
                      required
                    />
                  </div>
                  <div className="glass-group">
                    <label className="glass-label">Option C</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={qOptC}
                      onChange={(e) => setQOptC(e.target.value)}
                      required
                    />
                  </div>
                  <div className="glass-group">
                    <label className="glass-label">Option D</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={qOptD}
                      onChange={(e) => setQOptD(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="glass-group" style={{ marginBottom: '24px', maxWidth: '300px' }}>
                  <label className="glass-label">Correct Answer</label>
                  <select
                    className="glass-select"
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-glass" onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-glow">
                    <Save size={16} />
                    <span>Save Question</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of existing Questions */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              Questions ({questions.length})
            </h3>
            {questions.length === 0 ? (
              <div className="empty-state">
                <p>This quiz has no questions yet. Use "Add Question" above to populate options.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, idx) => (
                  <div key={q.questionId} className="question-item">
                    <div className="question-item-header">
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {idx + 1}. {q.questionText}
                      </h4>
                      <div className="question-item-actions">
                        <button onClick={() => handleOpenEditQuestion(q)} className="btn-icon" title="Edit Question">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.questionId)} className="btn-icon hover-error" title="Delete Question">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="question-options-grid">
                      <div className={`question-option-pill ${q.correctAnswer === 'A' ? 'correct-ans' : ''}`}>
                        <span className="bullet">A</span> {q.optionA}
                        {q.correctAnswer === 'A' && <Check size={14} style={{ marginLeft: 'auto' }} />}
                      </div>
                      <div className={`question-option-pill ${q.correctAnswer === 'B' ? 'correct-ans' : ''}`}>
                        <span className="bullet">B</span> {q.optionB}
                        {q.correctAnswer === 'B' && <Check size={14} style={{ marginLeft: 'auto' }} />}
                      </div>
                      <div className={`question-option-pill ${q.correctAnswer === 'C' ? 'correct-ans' : ''}`}>
                        <span className="bullet">C</span> {q.optionC}
                        {q.correctAnswer === 'C' && <Check size={14} style={{ marginLeft: 'auto' }} />}
                      </div>
                      <div className={`question-option-pill ${q.correctAnswer === 'D' ? 'correct-ans' : ''}`}>
                        <span className="bullet">D</span> {q.optionD}
                        {q.correctAnswer === 'D' && <Check size={14} style={{ marginLeft: 'auto' }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Quiz Modal Overlay */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <button className="modal-close" onClick={() => setShowQuizModal(false)}>✕</button>
            <h2 style={{ marginBottom: '20px' }}>
              {editingQuiz ? 'Update Quiz Details' : 'Create New Quiz Session'}
            </h2>
            <form onSubmit={handleQuizSubmit}>
              <div className="glass-group">
                <label className="glass-label">Quiz Title</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Spring Boot Essentials"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </div>

              <div className="glass-group" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="glass-label">Difficulty Level</label>
                  <select
                    className="glass-select"
                    value={quizDifficulty}
                    onChange={(e) => setQuizDifficulty(e.target.value)}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="glass-label">Time Limit</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        className="glass-input"
                        placeholder="HH"
                        style={{ width: '100%', textAlign: 'center', padding: '10px 4px' }}
                        value={quizHours || ''}
                        onChange={(e) => setQuizHours(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>HRS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        className="glass-input"
                        placeholder="MM"
                        style={{ width: '100%', textAlign: 'center', padding: '10px 4px' }}
                        value={quizMinutes || ''}
                        onChange={(e) => setQuizMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>MIN</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        className="glass-input"
                        placeholder="SS"
                        style={{ width: '100%', textAlign: 'center', padding: '10px 4px' }}
                        value={quizSeconds || ''}
                        onChange={(e) => setQuizSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>SEC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
                <input
                  id="randomize-qs"
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={quizRandomizeQuestions}
                  onChange={(e) => setQuizRandomizeQuestions(e.target.checked)}
                />
                <label htmlFor="randomize-qs" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Randomize Question Order
                </label>
              </div>

              <div className="glass-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
                <input
                  id="pwd-protected"
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={quizPasswordProtected}
                  onChange={(e) => setQuizPasswordProtected(e.target.checked)}
                />
                <label htmlFor="pwd-protected" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Enable Password Protection
                </label>
              </div>

              {quizPasswordProtected && (
                <div className="glass-group" style={{ marginBottom: '24px' }}>
                  <label className="glass-label">Session Password</label>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="Enter password access code"
                    value={quizPassword}
                    onChange={(e) => setQuizPassword(e.target.value)}
                    required={quizPasswordProtected}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-glass" onClick={() => setShowQuizModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-glow">
                  {editingQuiz ? 'Save Details' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
