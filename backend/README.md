# Themis Backend

This is the backend API implementation for Themis project management system, built with Node.js, Express, TypeScript, and PostgreSQL.

## Overview

The Themis backend provides:

1. **PostgreSQL Database Integration**: Direct connection to Postgres without Supabase.
2. **REST API**: Express-based routes for all features.
3. **Real-time Communication**: WebSocket support for chat, document editing, and video calls.
4. **Scheduled Jobs**: Background processing for report generation.

## Features

### Enhanced Analytics
- Analytics configurations by role
- Project completion forecasting based on historical data

### Collaboration Enhancements
- Real-time chat messaging
- Collaborative document editing
- WebRTC video calls
- User availability calendar

### Advanced Reporting
- Custom report creation and template management
- Scheduled report generation and distribution
- PDF and Excel exports

### User-Experience Improvements
- Unified search across projects, tasks, documents, and reports
- Activity feed and notifications
- Onboarding tutorials tracking

## Installation

### Prerequisites
- Node.js 16+
- PostgreSQL 14+

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://localhost:5432/themis_dev
   PORT=3000
   WS_URL=ws://localhost:3000
   
   # Email configuration (for report distribution)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_user
   SMTP_PASS=your_password
   EMAIL_FROM=themis@example.com
   ```

4. Run database migrations:
   ```bash
   npm run migrate:up
   ```

## Development

Start the server in development mode:
```bash
npm run dev
```

## Database Structure

The system uses the following main tables:

- `analytics_configs` - Role-based analytics settings
- `analytics_forecasts` - Project completion predictions
- `chat_messages` - Persistent chat messages
- `documents` - Collaborative documents
- `user_availability` - User calendar slots
- `reports` - Custom reports
- `report_templates` - Report templates
- `report_schedules` - Scheduled report generation
- `notifications` - User notifications
- `user_tutorials` - Tutorial completion tracking

## API Routes

### Analytics
- `GET /api/analytics/configs?role=` - Get analytics configuration by role
- `POST /api/analytics/configs` - Create or update analytics configuration
- `GET /api/analytics/forecast/:projectId` - Generate project completion forecast

### Chat
- `GET /api/chat/channels` - Get user's chat channels
- `GET /api/chat/channels/:id` - Get channel details
- `GET /api/chat/channels/:id/messages` - Get channel messages
- `POST /api/chat/channels/:id/messages` - Send a message
- WebSocket endpoint: `/ws/chat?userId=`

### Document Editing
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- WebSocket endpoint: `/ws/docs?docId=&userId=`

### Video Calls
- `POST /api/calls/create` - Create a new call room
- `GET /api/calls/:roomId/participants` - Get call participants
- `POST /api/calls/invite` - Send call invitation
- WebSocket endpoint: `/ws/calls/:roomId?userId=`

### Availability Calendar
- `GET /api/availability/:userId` - Get user availability slots
- `POST /api/availability` - Create or update availability slots
- `DELETE /api/availability/:userId` - Delete availability slot
- `GET /api/availability/team/:departmentId` - Get team availability

### Reports
- `GET /api/reports` - Get reports with filters
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/schedule` - Schedule report generation

### Search
- `GET /api/search?q=` - Unified search across all content

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all/:userId` - Mark all notifications as read

### User Tutorials
- `GET /api/tutorials/:userId` - Get completed tutorials
- `POST /api/tutorials/complete` - Mark tutorial as completed
- `GET /api/tutorials/available/list` - Get available tutorials

## WebSocket Connections

The system supports three types of WebSocket connections:

1. Chat: `/ws/chat?userId=`
2. Document editing: `/ws/docs?docId=&userId=`
3. Video calls: `/ws/calls/:roomId?userId=`

## Background Jobs

- Scheduled report generation (hourly cron job)

## Deployment

For production deployment:

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set the production `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@your-managed-postgres-host:5432/themis_prod
   ```

3. Run migrations:
   ```bash
   NODE_ENV=production npm run migrate:up
   ```

4. Start the server:
   ```bash
   NODE_ENV=production npm start
   ```

## License

This project is proprietary and confidential. 