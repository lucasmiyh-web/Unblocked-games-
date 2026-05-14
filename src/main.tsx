import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("%c[SYSTEM INITIALIZING]", "color: #3b82f6; font-weight: bold;");

try {
  const rootElem = document.getElementById('root');
  if (rootElem) {
    console.log("%c[MOUNTING APP]", "color: #10b981; font-weight: bold;");
    createRoot(rootElem).render(
      <App />
    );
  } else {
    console.error("Root element not found");
  }
} catch (e) {
  console.error("CRITICAL BOOT ERROR:", e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = "<div style='color:white; background:#991b1b; padding:20px; font-family:sans-serif;'><h1>Boot Error</h1><p>" + e + "</p></div>";
  }
}
