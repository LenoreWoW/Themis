import React from 'react';

function Projects() {
  const projectsList = [
    { id: 1, name: 'Website Redesign', status: 'In Progress', deadline: '2023-12-15' },
    { id: 2, name: 'Mobile App Development', status: 'Planning', deadline: '2024-02-28' },
    { id: 3, name: 'Database Migration', status: 'Completed', deadline: '2023-10-30' },
  ];

  return (
    <div className="projects">
      <h2>Projects</h2>
      <div className="projects-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projectsList.map(project => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.status}</td>
                <td>{project.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Projects; 