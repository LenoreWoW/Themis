import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="container">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/new" element={<ProjectForm />} />
            <Route path="/edit/:id" element={<ProjectForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 