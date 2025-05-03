import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="projects-container">
      <h1>Projects</h1>
      <p>View and manage your projects</p>
      
      <div className="projects-section">
        <div className="projects-header">
          <h2>All Projects</h2>
          <button className="btn-primary">New Project</button>
        </div>
        
        <div className="projects-filter">
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        
        <div className="projects-list">
          {/* Project row */}
          <div className="project-item">
            <div className="project-info">
              <h3>Digital Transformation</h3>
              <div className="project-meta">
                <span className="status status-in-progress">In Progress</span>
                <span>Department: IT</span>
                <span>Manager: John Doe</span>
              </div>
            </div>
            <div className="project-actions">
              <button className="btn-view">View</button>
            </div>
          </div>
          
          {/* Project row */}
          <div className="project-item">
            <div className="project-info">
              <h3>Infrastructure Upgrade</h3>
              <div className="project-meta">
                <span className="status status-completed">Completed</span>
                <span>Department: Operations</span>
                <span>Manager: Jane Smith</span>
              </div>
            </div>
            <div className="project-actions">
              <button className="btn-view">View</button>
            </div>
          </div>
          
          {/* Project row */}
          <div className="project-item">
            <div className="project-info">
              <h3>Mobile App Development</h3>
              <div className="project-meta">
                <span className="status status-on-hold">On Hold</span>
                <span>Department: Product</span>
                <span>Manager: Mike Johnson</span>
              </div>
            </div>
            <div className="project-actions">
              <button className="btn-view">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
