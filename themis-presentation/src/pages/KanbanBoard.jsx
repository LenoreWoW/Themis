import React, { useState } from 'react';
import './KanbanBoard.css';

// Mock data for tasks
const initialTasks = [
  { 
    id: 1, 
    title: 'Research API integration', 
    description: 'Research and document available API options for the payment gateway',
    status: 'todo',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2023-12-15',
    tags: ['research', 'backend']
  },
  { 
    id: 2, 
    title: 'Design user dashboard', 
    description: 'Create wireframes for the new user dashboard',
    status: 'todo',
    priority: 'medium',
    assignee: 'Sarah Kim',
    dueDate: '2023-12-18',
    tags: ['design', 'ui']
  },
  { 
    id: 3, 
    title: 'Implement authentication', 
    description: 'Implement JWT authentication for API endpoints',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2023-12-10',
    tags: ['backend', 'security']
  },
  { 
    id: 4, 
    title: 'Fix navigation bug', 
    description: 'Fix the bug in the main navigation menu on mobile devices',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2023-12-08',
    tags: ['bug', 'frontend']
  },
  { 
    id: 5, 
    title: 'Update user documentation', 
    description: 'Update the user documentation with new features',
    status: 'review',
    priority: 'low',
    assignee: 'Mike Johnson',
    dueDate: '2023-12-20',
    tags: ['documentation']
  },
  { 
    id: 6, 
    title: 'Optimize database queries', 
    description: 'Improve performance of the main dashboard queries',
    status: 'done',
    priority: 'high',
    assignee: 'Jane Smith',
    dueDate: '2023-12-05',
    tags: ['performance', 'database']
  },
  { 
    id: 7, 
    title: 'Implement dark mode', 
    description: 'Add dark mode support to the application',
    status: 'done',
    priority: 'medium',
    assignee: 'Sarah Kim',
    dueDate: '2023-12-03',
    tags: ['ui', 'frontend']
  }
];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    tags: []
  });
  
  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (columnId) => {
    if (draggedTask) {
      const updatedTasks = tasks.map(task => {
        if (task.id === draggedTask.id) {
          return { ...task, status: columnId };
        }
        return task;
      });
      setTasks(updatedTasks);
      setDraggedTask(null);
    }
  };

  const handleAddTaskClick = () => {
    setIsAddingTask(true);
  };

  const handleAddTaskCancel = () => {
    setIsAddingTask(false);
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      tags: []
    });
  };

  const handleAddTaskSave = () => {
    if (newTask.title.trim() === '') return;
    
    const task = {
      id: tasks.length + 1,
      ...newTask,
      tags: newTask.tags.length > 0 ? newTask.tags : []
    };
    
    setTasks([...tasks, task]);
    handleAddTaskCancel();
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewTaskTagsChange = (e) => {
    const tagsString = e.target.value;
    setNewTask(prev => ({
      ...prev,
      tags: tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="kanban-board-page">
      <div className="page-header">
        <h1>Kanban Board</h1>
        <button className="add-task-button" onClick={handleAddTaskClick}>
          Add Task
        </button>
      </div>

      <div className="board-container">
        <div className="kanban-board">
          {columns.map(column => (
            <div 
              key={column.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="column-header">
                <h2>{column.title}</h2>
                <span className="task-count">
                  {tasks.filter(task => task.status === column.id).length}
                </span>
              </div>
              
              <div className="column-content">
                {tasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <div 
                      key={task.id} 
                      className="task-card"
                      draggable
                      onDragStart={() => handleDragStart(task)}
                    >
                      <div className={`task-priority ${getPriorityClass(task.priority)}`}></div>
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <div className="task-assignee">
                          <span className="avatar">{task.assignee.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="task-due-date">{task.dueDate}</div>
                      </div>
                      <div className="task-tags">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="task-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddingTask && (
        <div className="add-task-modal">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <form>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  placeholder="Task title" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  placeholder="Task description" 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={newTask.status}
                    onChange={handleNewTaskChange}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select 
                    id="priority" 
                    name="priority" 
                    value={newTask.priority}
                    onChange={handleNewTaskChange}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignee">Assignee</label>
                  <input 
                    type="text" 
                    id="assignee" 
                    name="assignee" 
                    value={newTask.assignee}
                    onChange={handleNewTaskChange}
                    placeholder="Assignee name" 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input 
                    type="date" 
                    id="dueDate" 
                    name="dueDate" 
                    value={newTask.dueDate}
                    onChange={handleNewTaskChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  value={newTask.tags.join(', ')}
                  onChange={handleNewTaskTagsChange}
                  placeholder="frontend, bug, documentation" 
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleAddTaskCancel}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="save-button"
                  onClick={handleAddTaskSave}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 