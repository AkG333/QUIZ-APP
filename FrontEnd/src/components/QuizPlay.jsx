import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Check, X, Award, LogOut, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizPlay({ token, activeAttempt, onBackToDashboard }) {
  const attemptId = activeAttempt.attemptId;
  const quizTitle = activeAttempt.quizTitle;
  const totalQuestions = activeAttempt.totalQuestions;

  // Active question states
  const [currentQuestion, setCurrentQuestion] = useState(activeAttempt.firstQuestion);
  const [qIndex, setQIndex] = useState(1);
  const [selectedOpt, setSelectedOpt] = useState(''); // 'A', 'B', 'C', 'D'
  
  // Submission feedback
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Ending screen
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalPercentage, setFinalPercentage] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(activeAttempt.timeLimit || 0);

  // Clean-up or trigger confetti on completion
  useEffect(() => {
    if (quizCompleted) {
      // Nice double blast confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }, [quizCompleted]);

  const handleTimeExpired = async () => {
    setError("Time's up! Finalizing your quiz attempt...");
    setLoading(true);
    try {
      const response = await fetch(`/api/attempts/${attemptId}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to auto-submit quiz');
      const data = await response.json();
      setFinalScore(data.score);
      setFinalPercentage(data.percentage);
      setQuizCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!timeLeft || quizCompleted) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quizCompleted]);

  const handleSelectOption = (optCode) => {
    if (isSubmitted) return; // Cannot change after submit
    setSelectedOpt(optCode);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOpt || isSubmitted || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          selectedAnswer: selectedOpt
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      const data = await response.json();
      setSubmitResult(data);
      setIsSubmitted(true);

      if (data.completed) {
        setFinalScore(data.score);
        setFinalPercentage(data.percentage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!isSubmitted || loading) return;
    
    // Check if that was the last question or completed
    if (submitResult?.completed || qIndex >= totalQuestions) {
      setQuizCompleted(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/attempts/${attemptId}/next`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load next question');
      const nextQ = await response.json();
      
      // Reset state for new question
      setCurrentQuestion(nextQ);
      setQIndex(prev => prev + 1);
      setSelectedOpt('');
      setIsSubmitted(false);
      setSubmitResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper styles for option buttons
  const getOptionClass = (optCode) => {
    if (!isSubmitted) {
      return selectedOpt === optCode ? 'selected' : '';
    }
    
    // After submission logic
    const isUserChoice = selectedOpt === optCode;
    const isCorrectChoice = submitResult?.correctAnswer === optCode;

    if (isCorrectChoice) return 'correct';
    if (isUserChoice && !isCorrectChoice) return 'incorrect';
    return '';
  };

  // Radial dash offset calculation
  // Radius = 70, Circumference = 2 * PI * 70 = 439.8
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finalPercentage / 100) * circumference;

  if (quizCompleted) {
    return (
      <div className="quiz-play-container">
        <div className="glass-card quiz-ended-card">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', border: '1px solid var(--card-border)' }}>
            <Award className="text-glow" size={48} style={{ color: 'var(--primary-color)' }} />
          </div>
          
          <h2 className="shimmer-text" style={{ fontSize: '2.2rem', marginTop: '20px' }}>
            Quiz Completed!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
            Excellent work. Here is your final performance review for <strong>{quizTitle}</strong>.
          </p>

          {/* Radial score indicator */}
          <div className="radial-progress-wrapper">
            <svg className="radial-svg">
              <circle className="radial-circle-bg" cx="90" cy="90" r={radius} />
              <circle 
                className="radial-circle-fill" 
                cx="90" 
                cy="90" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="radial-text">
              <span className="radial-pct">{finalPercentage.toFixed(0)}%</span>
              <span className="radial-score">{finalScore} / {totalQuestions} Correct</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
            <button onClick={onBackToDashboard} className="btn-glow">
              <LogOut size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-play-container">
      
      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}>{quizTitle}</h2>
      </div>

      <div className="glass-card">
        {/* Progress Bar */}
        <div className="quiz-progress-bar">
          <div 
            className="quiz-progress-fill" 
            style={{ width: `${(qIndex / totalQuestions) * 100}%` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="quiz-qnum" style={{ marginBottom: 0 }}>
            Question {qIndex} of {totalQuestions}
          </div>
          {activeAttempt.timeLimit > 0 && (
            <div 
              className={`quiz-qnum ${timeLeft < 30 ? 'timer-pulse' : ''}`}
              style={{
                marginBottom: 0,
                fontSize: '1rem',
                color: timeLeft < 30 ? 'var(--error-color)' : 'var(--text-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>⏱️ {
                timeLeft >= 3600 
                  ? `${Math.floor(timeLeft / 3600)}:${String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
                  : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
              }</span>
            </div>
          )}
        </div>
        
        <h3 className="quiz-qtext">
          {currentQuestion.questionText}
        </h3>

        {/* Options list */}
        <div className="quiz-options">
          <button 
            className={`quiz-opt-btn ${getOptionClass('A')}`} 
            onClick={() => handleSelectOption('A')}
            disabled={isSubmitted}
          >
            <div>
              <span className="opt-letter">A</span>
              <span>{currentQuestion.optionA}</span>
            </div>
            {isSubmitted && submitResult?.correctAnswer === 'A' && <Check size={18} style={{ color: 'var(--success-color)' }} />}
            {isSubmitted && selectedOpt === 'A' && submitResult?.correctAnswer !== 'A' && <X size={18} style={{ color: 'var(--error-color)' }} />}
          </button>

          <button 
            className={`quiz-opt-btn ${getOptionClass('B')}`} 
            onClick={() => handleSelectOption('B')}
            disabled={isSubmitted}
          >
            <div>
              <span className="opt-letter">B</span>
              <span>{currentQuestion.optionB}</span>
            </div>
            {isSubmitted && submitResult?.correctAnswer === 'B' && <Check size={18} style={{ color: 'var(--success-color)' }} />}
            {isSubmitted && selectedOpt === 'B' && submitResult?.correctAnswer !== 'B' && <X size={18} style={{ color: 'var(--error-color)' }} />}
          </button>

          <button 
            className={`quiz-opt-btn ${getOptionClass('C')}`} 
            onClick={() => handleSelectOption('C')}
            disabled={isSubmitted}
          >
            <div>
              <span className="opt-letter">C</span>
              <span>{currentQuestion.optionC}</span>
            </div>
            {isSubmitted && submitResult?.correctAnswer === 'C' && <Check size={18} style={{ color: 'var(--success-color)' }} />}
            {isSubmitted && selectedOpt === 'C' && submitResult?.correctAnswer !== 'C' && <X size={18} style={{ color: 'var(--error-color)' }} />}
          </button>

          <button 
            className={`quiz-opt-btn ${getOptionClass('D')}`} 
            onClick={() => handleSelectOption('D')}
            disabled={isSubmitted}
          >
            <div>
              <span className="opt-letter">D</span>
              <span>{currentQuestion.optionD}</span>
            </div>
            {isSubmitted && submitResult?.correctAnswer === 'D' && <Check size={18} style={{ color: 'var(--success-color)' }} />}
            {isSubmitted && selectedOpt === 'D' && submitResult?.correctAnswer !== 'D' && <X size={18} style={{ color: 'var(--error-color)' }} />}
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          {!isSubmitted ? (
            <button 
              onClick={handleSubmitAnswer}
              className="btn-glow" 
              disabled={!selectedOpt || loading}
              style={{ minWidth: '150px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Submit Answer</span>
              )}
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="btn-glow"
              style={{ minWidth: '150px' }}
            >
              <span>
                {submitResult?.completed || qIndex >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
