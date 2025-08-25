import React from 'react';
import './App.css';
import ScalarMarketTerminal from './components/ScalarMarketTerminal';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="logoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: '#60a5fa', stopOpacity: 1 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: '#3b82f6', stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: '#8b5cf6', stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M16 2L28 10V22L16 30L4 22V10L16 2Z"
                  fill="url(#logoGradient)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                />
                <path
                  d="M16 6L24 10V18L16 22L8 18V10L16 6Z"
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.3"
                />
                <circle cx="16" cy="16" r="2" fill="rgba(255,255,255,0.8)" />
                <line
                  x1="16"
                  y1="8"
                  x2="16"
                  y2="24"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.5"
                />
                <line
                  x1="8"
                  y1="16"
                  x2="24"
                  y2="16"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            <h1>ServeUp</h1>
          </div>
          <div className="header-subtitle"></div>
        </div>
      </header>
      <main>
        <ScalarMarketTerminal />
      </main>
    </div>
  );
}

export default App;
