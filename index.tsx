import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handling for early-stage debugging
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Critical Application Error:", { message, source, lineno, colno, error });
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="color: #f43f5e; padding: 40px; font-family: 'JetBrains Mono', monospace; background: #020617; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <h1 style="font-size: 20px; border-bottom: 1px solid rgba(244, 63, 94, 0.3); padding-bottom: 10px; margin-bottom: 20px;">RUNTIME_EXCEPTION</h1>
      <pre style="margin-top: 0; white-space: pre-wrap; font-size: 12px; color: #94a3b8; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">${message}</pre>
    </div>`;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Sovereign Map Engine [v2035.1] Active");
} catch (e) {
  console.error("Initialization Failed:", e);
  rootElement.innerHTML = `
    <div style="color: #f43f5e; padding: 40px; font-family: 'JetBrains Mono', monospace; background: #020617; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 20px; color: #fb7185;">ENGINE_BOOT_FAILURE</h1>
      <div style="background: rgba(244, 63, 94, 0.05); padding: 30px; border-radius: 20px; border: 1px solid rgba(244, 63, 94, 0.2); max-width: 600px; text-align: left;">
        <div style="color: #fda4af; font-size: 14px; margin-bottom: 10px; font-weight: bold;">STACK_TRACE:</div>
        <pre style="white-space: pre-wrap; font-size: 11px; color: #94a3b8; margin: 0;">${e instanceof Error ? e.stack : e}</pre>
      </div>
      <p style="margin-top: 30px; color: #475569; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">Check terminal for system diagnostics</p>
    </div>`;
}