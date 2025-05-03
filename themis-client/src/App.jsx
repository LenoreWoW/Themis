import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Login from './pages/Login';

// Import the TestAuthProvider
import { TestAuthProvider } from './context/TestAuthContext';

// Import LanguageSwitcher
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('themisUser') !== null
  );
  
  return (
    <Router>
      <TestAuthProvider>
        <div className="App">
          {isAuthenticated && (
            <header className="App-header">
              <h1>Themis Project Management System</h1>
              <nav className="App-nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/projects" className="nav-link">Projects</Link>
                <Link to="/tasks" className="nav-link">Tasks</Link>
                <Link to="/settings" className="nav-link">Settings</Link>
                <div className="nav-right">
                  <LanguageSwitcher />
                  <button 
                    onClick={() => {
                      localStorage.removeItem('themisUser');
                      setIsAuthenticated(false);
                    }}
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </header>
          )}
          
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            } />
            <Route path="/projects" element={
              isAuthenticated ? <Projects /> : <Navigate to="/login" replace />
            } />
            <Route path="/tasks" element={
              isAuthenticated ? (
                <div className="page-container">
                  <h2>Tasks</h2>
                  <p>Task management coming soon</p>
                </div>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/settings" element={
              isAuthenticated ? (
                <div className="page-container">
                  <h2>Settings</h2>
                  <p>Settings page coming soon</p>
                </div>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </TestAuthProvider>
    </Router>
  );
}

export default App; 