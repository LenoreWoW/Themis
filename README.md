# Themis - Project Management System

Themis is a comprehensive project management system designed for enterprise portfolio management, with a focus on role-based access control, approval workflows, and financial oversight.

## Features

- **Role-Based Access Control**: Discord-style role system with Project Managers, Sub PMO, Main PMO, Department Directors, and Higher Management
- **Project & Task Management**: Track projects, tasks, dependencies, and milestones
- **Approval Workflows**: Weekly updates and change requests with multi-level approvals
- **Financial Oversight**: Budget tracking, actual costs, and variance analysis
- **Risk & Issue Management**: Comprehensive risk and issue tracking
- **Dashboards & Reporting**: Portfolio and project-level dashboards with KPI tracking
- **Progressive Web Application**: Works online and offline across devices

## Technology Stack

- **Backend**: .NET Core API with Entity Framework
- **Database**: PostgreSQL
- **Frontend**: React with Material UI
- **Authentication**: JWT with Active Directory integration
- **Deployment**: Azure Cloud Services

## Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js](https://nodejs.org/) (version 18.x recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/Themis.git
   cd Themis
   ```

2. Set up the database
   ```
   # Create a PostgreSQL database named 'themis'
   # Update connection string in appsettings.json if needed
   ```

3. Run the backend API
   ```
   cd Themis.API
   dotnet restore
   dotnet run
   ```

4. Install frontend dependencies
   ```
   cd ../themis-client
   npm install
   ```

5. Run the frontend
   ```
   npm start
   ```

6. Access the application
   ```
   Frontend: http://localhost:3000
   API: http://localhost:5065
   ```

## Project Structure

```
Themis/
├── Themis.API/             # Backend API project
├── Themis.Core/            # Domain models and business logic
├── Themis.Infrastructure/  # Data access and infrastructure services
├── themis-client/          # React frontend application
└── .github/workflows/      # CI/CD pipeline configuration
```

## Configuration

### Active Directory Integration

To enable Active Directory integration:

1. Create an application in Azure AD
2. Update the AD_CONFIG settings in `themis-client/src/config.ts`
3. Configure corresponding settings in `appsettings.json` for the backend

### Email Notifications

To configure email notifications:

1. Set up an SMTP server
2. Update EMAIL_CONFIG in `themis-client/src/config.ts`
3. Configure corresponding settings in `appsettings.json` for the backend

## Deployment

The project includes GitHub Actions workflows for CI/CD. To deploy:

1. Push to the main branch to trigger the workflow
2. The workflow will build and test both API and client
3. Artifacts will be deployed to the configured environment

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.

## TaskStatus Mapping

There is a mismatch between the TaskStatus values defined in the frontend and backend:

### Backend TaskStatus (Core/Enums/TaskStatus.cs)
```csharp
public enum TaskStatus
{
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    Delayed = 3,
    Blocked = 4,
    Cancelled = 5
}
```

### Frontend TaskStatus (src/types/index.ts)
```typescript
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}
```

To handle this mismatch, a mapping utility has been created in:
- `/themis-client/src/utils/taskStatusMapper.ts` - Provides mapping functions between client and server status values
- `/themis-client/src/services/TaskService.ts` - Wraps the API calls to automatically handle the status mapping

### How to use the TaskService

Use the TaskService instead of direct API calls to handle tasks:

```typescript
import { TaskService } from '../services/TaskService';

// Get all tasks for a project
const tasks = await TaskService.getAllTasks(projectId, token);

// Create a new task
const newTask = await TaskService.createTask(projectId, taskData, token);

// Update a task, including changing its status
const updatedTask = await TaskService.updateTask(projectId, taskId, taskData, token);
```

The TaskService handles the conversion between frontend and backend status values automatically. 