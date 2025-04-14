import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Themis Project Management System</h1>
            <p>Welcome to Themis</p>
          </header>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
