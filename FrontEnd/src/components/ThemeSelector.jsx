import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSelector({ color, setColor, mode, setMode }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Accent Color Scheme */}
      <div className="theme-pill">
        <button 
          className={`theme-btn ${color === 'pink' ? 'active' : ''}`}
          onClick={() => setColor('pink')}
          style={{ padding: '6px 12px' }}
        >
          Pink
        </button>
        <button 
          className={`theme-btn ${color === 'blue' ? 'active' : ''}`}
          onClick={() => setColor('blue')}
          style={{ padding: '6px 12px' }}
        >
          Blue
        </button>
      </div>

      {/* Light / Dark Appearance Mode */}
      <div className="theme-pill">
        <button 
          className={`theme-btn ${mode === 'dark' ? 'active' : ''}`}
          onClick={() => setMode('dark')}
          title="Dark Mode"
          style={{ display: 'flex', alignItems: 'center', padding: '6px 10px' }}
        >
          <Moon size={14} />
        </button>
        <button 
          className={`theme-btn ${mode === 'light' ? 'active' : ''}`}
          onClick={() => setMode('light')}
          title="Light Mode"
          style={{ display: 'flex', alignItems: 'center', padding: '6px 10px' }}
        >
          <Sun size={14} />
        </button>
      </div>
    </div>
  );
}
