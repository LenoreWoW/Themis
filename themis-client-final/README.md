# Themis Project - Official Version

This is the official, security-hardened version of the Themis project management system. All vulnerabilities have been fixed and the codebase has been optimized for performance and reliability.

## Features

- **Zero Vulnerabilities**: All dependencies have been updated to secure versions
- **Enhanced Excel Export**: Using ExcelJS instead of the vulnerable xlsx package
- **Fixed TypeScript Errors**: Resolved null/undefined handling issues
- **Proper Module Loading**: Fixed React-Refresh module resolution problems
- **Identical Functionality**: All original features work the same, just more securely

### Canvas/Ideation Feature

The Ideation Canvas is a powerful visual tool for brainstorming, planning, and organizing ideas. It provides an infinite canvas where users can create cards, connect them with lines, and organize them into groups.

Key features:
- Create, move, resize, and delete cards
- Connect cards with lines
- Group related cards together
- Pan and zoom navigation
- Search functionality to find content
- Minimap for easy navigation
- Snap to grid for precise positioning
- Undo/redo functionality
- Right-click context menu for actions

To access the Canvas feature, navigate to the Ideation section in the sidebar.

### Guided Tour

The application includes a guided tour feature that helps users navigate and understand the system based on their role. The guided tour:

- Shows users key navigation elements when they first log in
- Highlights important features based on their specific user role
- Can be restarted from the Settings page if needed
- Uses React Joyride for smooth, interactive tooltips

The tour is implemented through two main components:
- `TourContext` - Manages the tour state and tour steps based on user roles
- `TourManager` - Handles the display of tooltips and user interactions with the tour

Each user role (Admin, Project Manager, etc.) has specific tour steps tailored to their responsibilities and permissions.

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Documentation

Check the `update-instructions` directory for detailed documentation on:
- Security updates applied
- Excel implementation changes
- In-place fix instructions for the original project

## Security Improvements

This version addresses all 165 vulnerabilities found in the original project by:

1. Updating outdated dependencies to secure versions
2. Replacing vulnerable packages like xlsx with secure alternatives (exceljs)
3. Fixing TypeScript errors that could lead to runtime exceptions
4. Ensuring proper module loading and path resolution

## Usage Notes

This is now the single, official version of the Themis project. Other versions (themis-client, themis-client-clean, etc.) should be considered deprecated.

All future development should be based on this version to ensure security and stability are maintained.

## Original Project Credits

This is a secured version of the Themis project management system. 

## Usage

### Ideation Canvas

#### Navigation
- **Pan**: Hold Space + drag, or use middle mouse button
- **Zoom**: Ctrl/Cmd + scroll wheel, or use zoom buttons in toolbar
- **Select**: Click on a card, connection, or group
- **Multi-select**: Shift + click, or drag a selection box

#### Creating Content
- **Add Card**: Double-click on empty space, or use context menu
- **Connect Cards**: Select a card, then use the context menu to create a connection, and click on another card
- **Group Cards**: Select multiple cards, then use the context menu to create a group

#### Editing Content
- **Move**: Drag cards or groups
- **Resize**: Drag the handles on selected cards or groups
- **Edit Text**: Double-click on card text
- **Delete**: Select items and press Delete, or use context menu 