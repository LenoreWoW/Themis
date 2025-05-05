# Themis Project Management System - Presentation Mode

This is a special version of the Themis Project Management System configured for presentations and demos. It contains realistic mock data for hundreds of users, projects, tasks, and more.

## Features

- **Automatic Mock Data Generation**: Large dataset of realistic mock data
- **Realistic User Experience**: Simulates a real enterprise environment with hundreds of users
- **Demo-Ready**: Perfect for presentations and demonstrations
- **Multi-language Support**: Full Arabic + English support with RTL/LTR switching
- **Persistence**: Mock data is stored in localStorage and persists between sessions
- **Presentation Banner**: Clear indicator that you're in presentation mode

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the presentation mode:
   ```
   npm run presentation
   ```

3. Open your browser at [http://localhost:3000](http://localhost:3000) if it doesn't open automatically.

The app will automatically generate mock data and log in with an admin user.

## Mock Data Overview

The presentation mode generates the following mock data:

- **Users (150)**: Names, departments, roles, etc.
- **Projects (75)**: Various project types with different statuses
- **Tasks (350)**: Assigned to various team members with different statuses
- **Departments (15+)**: Organizational structure
- **Risks & Issues (120)**: Project risks and issues
- **Meetings (200)**: Past and upcoming meetings
- **Audit Logs (800)**: System activity records

## Customization

You can modify the mock data generation in:
- `src/mockDataGenerator.ts`: Main data generation logic
- `src/utils/mockDataLoader.ts`: Data loading utilities

## Reset Data

To reset the mock data and start fresh:
1. Add `?reset=true` to your URL (e.g., `http://localhost:3000/?reset=true`)
2. Refresh the page

## Language Support

The app supports both English and Arabic languages with full RTL support. Click the language switcher icon in the top bar to switch between languages.

## Notes for Presentation

- The app will automatically log in with an admin user
- All functionality works with the mock data
- The presentation banner at the top clearly indicates you're in demo mode

## Screenshots

- Dashboard view with mock data
- Project list with various statuses
- Task board with assignments
- User management interface
- Reports with real-time data

## Technical Details

This presentation version is built using:
- React 18
- TypeScript
- Material UI
- i18next for localization
- localStorage for data persistence

## Original Project Credits

This is a secured version of the Themis project management system. 