import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("System Initializing...");
try {
  const rootElem = document.getElementById('root');
  if (rootElem) {
    createRoot(rootElem).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    console.error("Root element not found");
  }
} catch (e) {
  console.error("CRITICAL BOOT ERROR:", e);
  document.body.innerHTML = "<div style='color:white; background:red; padding:20px;'><h1>Boot Error</h1><p>" + e + "</p></div>";
}
