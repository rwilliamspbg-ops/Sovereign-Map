import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const container = document.getElementById('root');
  if (container) {
    try {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log("Sovereign Map Engine Initialized.");
    } catch (error) {
      console.error("Failed to render the application:", error);
      container.innerHTML = `<div style="padding: 40px; color: #f43f5e; font-family: 'JetBrains Mono', monospace; background: #020617; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Engine Mount Failure</h2>
        <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); padding: 24px; border-radius: 16px; max-width: 600px; width: 100%; text-align: left; overflow: auto;">
          <pre style="font-size: 12px; line-height: 1.6; white-space: pre-wrap;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 32px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; transition: all 0.2s;">
          Retry Initialization
        </button>
      </div>`;
    }
  } else {
    console.error("Critical Failure: DOM entry point (#root) not found.");
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}