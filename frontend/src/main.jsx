import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// import App from './App.jsx'
// import { ThemeProvider } from './context/ThemeContext'
// import { AuthProvider } from './context/AuthContext'
// import { ChatProvider } from './context/ChatContext'
// import { AppsProvider } from './context/AppsContext'
// import ErrorBoundary from './components/ErrorBoundary';

const root = createRoot(document.getElementById('root'));

try {
  root.render(
    <div style={{ color: 'white', padding: 50 }}>
      <h1>System Diagnostics Mode</h1>
      <p>React is working. The issue is in the App components.</p>
    </div>
  );
} catch (error) {
  console.error("Critical Render Error:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace; background: #1a1a1a; height: 100vh;">
      <h1>CRITICAL RENDER ERROR</h1>
      <pre>${error.toString()}</pre>
    </div>
  `;
}
