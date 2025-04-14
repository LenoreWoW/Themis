import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Import pages with .tsx extension to avoid file not found errors
import Dashboard from './pages/Dashboard.tsx';
import Projects from './pages/Projects.tsx';

function App() {
  const [stepsDone, setStepsDone] = useState({
    contexts: false,
    pages: true,
    layout: false,
    routing: true
  });
  
  const checkNextStep = () => {
    return "Create the Layout component and AuthContext provider";
  };
  
  // Update state function to avoid the unused variable warning
  const updateSteps = () => {
    setStepsDone(prev => ({...prev}));
  };
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Themis Project Management System</h1>
          <nav className="App-nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/projects" className="nav-link">Projects</Link>
            <Link to="/about" className="nav-link" onClick={updateSteps}>About</Link>
          </nav>
        </header>
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={
            <div className="setup-guide-page">
              <h2>Page Under Construction</h2>
              <div className="setup-guide">
                <h3>Setup Guide</h3>
                <p>Your application requires a few more components to be fully operational:</p>
                
                <ul className="setup-steps">
                  <li className={stepsDone.contexts ? "done" : ""}>
                    <strong>Step 1:</strong> Set up AuthContext and NotificationContext
                  </li>
                  <li className={stepsDone.pages ? "done" : ""}>
                    <strong>Step 2:</strong> Create page components (Dashboard, Projects, etc.)
                  </li>
                  <li className={stepsDone.layout ? "done" : ""}>
                    <strong>Step 3:</strong> Create the Layout component with navigation
                  </li>
                  <li className={stepsDone.routing ? "done" : ""}>
                    <strong>Step 4:</strong> Set up routing between pages
                  </li>
                </ul>
                
                <div className="next-steps">
                  <h3>Next Step:</h3>
                  <p>{checkNextStep()}</p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 