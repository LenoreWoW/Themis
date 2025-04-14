import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Mock data for the dashboard
const mockTasks = [
  { id: 1, title: 'Research API integration', status: 'todo', priority: 'high', dueDate: '2023-12-15', assignee: 'John Doe' },
  { id: 2, title: 'Design user dashboard', status: 'todo', priority: 'medium', dueDate: '2023-12-18', assignee: 'Sarah Kim' },
  { id: 3, title: 'Implement authentication', status: 'in-progress', priority: 'high', dueDate: '2023-12-10', assignee: 'John Doe' },
  { id: 4, title: 'Fix navigation bug', status: 'in-progress', priority: 'medium', dueDate: '2023-12-08', assignee: 'Jane Smith' },
  { id: 5, title: 'Update user documentation', status: 'review', priority: 'low', dueDate: '2023-12-20', assignee: 'Mike Johnson' },
  { id: 6, title: 'Optimize database queries', status: 'done', priority: 'high', dueDate: '2023-12-05', assignee: 'Jane Smith' },
  { id: 7, title: 'Implement dark mode', status: 'done', priority: 'medium', dueDate: '2023-12-03', assignee: 'Sarah Kim' },
];

const mockProjects = [
  { id: 1, name: 'Website Redesign', progress: 65, tasks: 12, completedTasks: 8 },
  { id: 2, name: 'Mobile App Development', progress: 30, tasks: 20, completedTasks: 6 },
  { id: 3, name: 'Database Migration', progress: 90, tasks: 8, completedTasks: 7 },
];

const mockTeamMembers = [
  { id: 1, name: 'John Doe', role: 'Developer', avatar: 'JD', tasks: 8, completedTasks: 5 },
  { id: 2, name: 'Sarah Kim', role: 'Designer', avatar: 'SK', tasks: 6, completedTasks: 4 },
  { id: 3, name: 'Jane Smith', role: 'Project Manager', avatar: 'JS', tasks: 10, completedTasks: 7 },
  { id: 4, name: 'Mike Johnson', role: 'Content Writer', avatar: 'MJ', tasks: 5, completedTasks: 3 },
];

const mockTimelineEvents = [
  { id: 1, title: 'Project kickoff meeting', date: '2023-12-01', type: 'meeting' },
  { id: 2, title: 'Design phase completion', date: '2023-12-10', type: 'milestone' },
  { id: 3, title: 'Development sprint 1', date: '2023-12-15', type: 'sprint' },
  { id: 4, title: 'User testing', date: '2023-12-25', type: 'testing' },
  { id: 5, title: 'Version 1.0 release', date: '2023-12-31', type: 'milestone' },
];

function Dashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  
  // Calculate task statistics
  const totalTasks = mockTasks.length;
  const todoTasks = mockTasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = mockTasks.filter(task => task.status === 'in-progress').length;
  const reviewTasks = mockTasks.filter(task => task.status === 'review').length;
  const completedTasks = mockTasks.filter(task => task.status === 'done').length;
  
  // Priority breakdown
  const highPriorityTasks = mockTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = mockTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = mockTasks.filter(task => task.priority === 'low').length;
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'in-progress': return 'status-progress';
      case 'review': return 'status-review';
      case 'done': return 'status-done';
      default: return '';
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <span className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="dashboard-views">
          <button 
            className={selectedView === 'overview' ? 'active' : ''} 
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </button>
          <button 
            className={selectedView === 'projects' ? 'active' : ''} 
            onClick={() => setSelectedView('projects')}
          >
            Projects
          </button>
          <button 
            className={selectedView === 'team' ? 'active' : ''} 
            onClick={() => setSelectedView('team')}
          >
            Team
          </button>
          <button 
            className={selectedView === 'timeline' ? 'active' : ''} 
            onClick={() => setSelectedView('timeline')}
          >
            Timeline
          </button>
        </div>
      </div>
      
      {selectedView === 'overview' && (
        <div className="dashboard-overview">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value">{totalTasks}</div>
              <div className="stat-footer">
                <div className="stat-progress" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">To Do</div>
              <div className="stat-value">{todoTasks}</div>
              <div className="stat-footer">
                <div className="stat-progress status-todo" style={{ width: `${(todoTasks / totalTasks) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">In Progress</div>
              <div className="stat-value">{inProgressTasks}</div>
              <div className="stat-footer">
                <div className="stat-progress status-progress" style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Review</div>
              <div className="stat-value">{reviewTasks}</div>
              <div className="stat-footer">
                <div className="stat-progress status-review" style={{ width: `${(reviewTasks / totalTasks) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Completed</div>
              <div className="stat-value">{completedTasks}</div>
              <div className="stat-footer">
                <div className="stat-progress status-done" style={{ width: `${(completedTasks / totalTasks) * 100}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-priorities">
              <div className="section-header">
                <h2>Task Priorities</h2>
              </div>
              <div className="priority-chart">
                <div className="priority-bar">
                  <div className="priority-label">High</div>
                  <div className="priority-bar-container">
                    <div className="priority-bar-fill priority-high" style={{ width: `${(highPriorityTasks / totalTasks) * 100}%` }}></div>
                  </div>
                  <div className="priority-count">{highPriorityTasks}</div>
                </div>
                <div className="priority-bar">
                  <div className="priority-label">Medium</div>
                  <div className="priority-bar-container">
                    <div className="priority-bar-fill priority-medium" style={{ width: `${(mediumPriorityTasks / totalTasks) * 100}%` }}></div>
                  </div>
                  <div className="priority-count">{mediumPriorityTasks}</div>
                </div>
                <div className="priority-bar">
                  <div className="priority-label">Low</div>
                  <div className="priority-bar-container">
                    <div className="priority-bar-fill priority-low" style={{ width: `${(lowPriorityTasks / totalTasks) * 100}%` }}></div>
                  </div>
                  <div className="priority-count">{lowPriorityTasks}</div>
                </div>
              </div>
            </div>
            
            <div className="dashboard-recent-tasks">
              <div className="section-header">
                <h2>Recent Tasks</h2>
                <Link to="/tasks" className="view-all">View All</Link>
              </div>
              <div className="recent-tasks-list">
                {mockTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="task-item">
                    <div className={`task-status ${getStatusClass(task.status)}`}></div>
                    <div className="task-details">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className="task-assignee">{task.assignee}</span>
                        <span className="task-due-date">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="dashboard-projects-preview">
            <div className="section-header">
              <h2>Project Progress</h2>
              <Link to="/projects" className="view-all">View All Projects</Link>
            </div>
            <div className="projects-preview-list">
              {mockProjects.map(project => (
                <div key={project.id} className="project-preview-item">
                  <div className="project-preview-header">
                    <div className="project-preview-name">{project.name}</div>
                    <div className="project-preview-progress">{project.progress}%</div>
                  </div>
                  <div className="project-preview-progress-bar">
                    <div className="project-preview-progress-fill" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <div className="project-preview-footer">
                    <div className="project-preview-tasks">{project.completedTasks} / {project.tasks} tasks completed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'projects' && (
        <div className="dashboard-projects">
          <div className="section-header">
            <h2>All Projects</h2>
            <button className="add-button">+ Add Project</button>
          </div>
          <div className="projects-list">
            {mockProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <div className="project-progress-badge">{project.progress}%</div>
                </div>
                <div className="project-progress-bar">
                  <div className="project-progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="project-stats">
                  <div className="project-stat">
                    <div className="project-stat-label">Tasks</div>
                    <div className="project-stat-value">{project.tasks}</div>
                  </div>
                  <div className="project-stat">
                    <div className="project-stat-label">Completed</div>
                    <div className="project-stat-value">{project.completedTasks}</div>
                  </div>
                  <div className="project-stat">
                    <div className="project-stat-label">Pending</div>
                    <div className="project-stat-value">{project.tasks - project.completedTasks}</div>
                  </div>
                </div>
                <div className="project-card-actions">
                  <button className="project-action-button">View Details</button>
                  <button className="project-action-button">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedView === 'team' && (
        <div className="dashboard-team">
          <div className="section-header">
            <h2>Team Members</h2>
            <button className="add-button">+ Add Member</button>
          </div>
          <div className="team-list">
            {mockTeamMembers.map(member => (
              <div key={member.id} className="team-member-card">
                <div className="team-member-avatar">{member.avatar}</div>
                <div className="team-member-info">
                  <div className="team-member-name">{member.name}</div>
                  <div className="team-member-role">{member.role}</div>
                </div>
                <div className="team-member-stats">
                  <div className="team-member-stat">
                    <div className="team-member-stat-value">{member.tasks}</div>
                    <div className="team-member-stat-label">Tasks</div>
                  </div>
                  <div className="team-member-stat">
                    <div className="team-member-stat-value">{member.completedTasks}</div>
                    <div className="team-member-stat-label">Completed</div>
                  </div>
                  <div className="team-member-stat">
                    <div className="team-member-stat-value">{Math.round((member.completedTasks / member.tasks) * 100)}%</div>
                    <div className="team-member-stat-label">Efficiency</div>
                  </div>
                </div>
                <div className="team-member-progress">
                  <div className="team-member-progress-fill" style={{ width: `${(member.completedTasks / member.tasks) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedView === 'timeline' && (
        <div className="dashboard-timeline">
          <div className="section-header">
            <h2>Project Timeline</h2>
            <button className="add-button">+ Add Event</button>
          </div>
          <div className="timeline-container">
            <div className="timeline-line"></div>
            {mockTimelineEvents.map(event => (
              <div key={event.id} className={`timeline-event event-${event.type}`}>
                <div className="timeline-event-date">{event.date}</div>
                <div className="timeline-event-content">
                  <div className="timeline-event-type">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
                  <div className="timeline-event-title">{event.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 