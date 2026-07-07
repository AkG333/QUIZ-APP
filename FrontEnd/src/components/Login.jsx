import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldAlert, Sparkles, Mail, Lock, User as UserIcon, Shield, BookOpen, Lightbulb, GraduationCap, Brain, Compass } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('USER');
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to login. Please check credentials.');
      }

      const token = await response.text();
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role: regRole, // Will be parsed as ROLE_USER / ROLE_ADMIN
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Failed to register.');
      }

      setSuccess('Registration successful! You can now log in.');
      setIsRegistering(false);
      // Auto fill email
      setLoginEmail(regEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Learning Symbols in the background */}
      <div className="login-symbols-bg">
        <BookOpen className="floating-symbol sym-1" size={44} />
        <Lightbulb className="floating-symbol sym-2" size={44} />
        <GraduationCap className="floating-symbol sym-3" size={50} />
        <Brain className="floating-symbol sym-4" size={44} />
        <Compass className="floating-symbol sym-5" size={44} />
      </div>

      <div className="glass-card auth-card">
        
        {/* Glow Header */}
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
            <Sparkles className="text-glow" size={32} style={{ color: 'var(--primary-color)' }} />
          </div>
          <h2 className="auth-title shimmer-text">
            {isRegistering ? 'Create Account' : 'Welcome to Quizovian'}
          </h2>
          <p className="auth-subtitle">
            {isRegistering ? 'Join to start test-taking and ranking' : 'Enter your credentials to access your dashboard'}
          </p>
          <p className="learning-quote">
            "The beautiful thing about learning is that no one can take it away from you." — B.B. King
          </p>
        </div>

        {/* Errors/Success alerts */}
        {error && (
          <div className="alert-box alert-error">
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <Sparkles size={20} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Forms */}
        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="glass-group">
              <label className="glass-label" htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  className="glass-input"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  placeholder="name@quiz.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="glass-group" style={{ marginBottom: '28px' }}>
              <label className="glass-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type="password"
                  className="glass-input"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-glow" style={{ width: '100%' }} disabled={loading}>
              <LogIn size={20} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="glass-group">
              <label className="glass-label" htmlFor="reg-username">Username</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="reg-username"
                  type="text"
                  className="glass-input"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  placeholder="trivia_master"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="glass-group">
              <label className="glass-label" htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="reg-email"
                  type="email"
                  className="glass-input"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  placeholder="challenger@quiz.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="glass-group">
              <label className="glass-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="reg-password"
                  type="password"
                  className="glass-input"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="glass-group" style={{ marginBottom: '28px' }}>
              <label className="glass-label" htmlFor="reg-role">Account Type</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  id="reg-role"
                  className="glass-select"
                  style={{ paddingLeft: '48px', width: '100%' }}
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <option value="USER">Player (Take Quizzes)</option>
                  <option value="ADMIN">Admin (Create & Manage Quizzes)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-glow" style={{ width: '100%' }} disabled={loading}>
              <UserPlus size={20} />
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        {/* Card Toggle footer */}
        <div className="auth-footer-toggle">
          {isRegistering ? (
            <>
              Already have an account?
              <span className="auth-toggle-link" onClick={() => { setIsRegistering(false); setError(''); }}>Sign In</span>
            </>
          ) : (
            <>
              Don't have an account?
              <span className="auth-toggle-link" onClick={() => { setIsRegistering(true); setError(''); }}>Create one</span>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
