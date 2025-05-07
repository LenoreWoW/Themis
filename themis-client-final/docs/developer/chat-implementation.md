# Chat & Announcement Board Implementation Guide

This document outlines the implementation of the Chat & Announcement Board feature in Themis.

## Architecture Overview

The Chat & Announcement Board feature uses a combination of:

1. **REST API** for channel management and message history
2. **SignalR** for real-time messaging
3. **Redux** for state management
4. **React** components for the UI

## Backend Implementation

### Core Components

- `ChatService.cs`: Handles business logic for chat channels, messages, and permissions
- `ChatController.cs`: Provides REST API endpoints for chat operations
- `ChatHub.cs`: SignalR hub for real-time message delivery

### Database Schema

The feature uses the following database tables:

- `ChatChannels`: Stores information about chat channels
- `ChatMessages`: Stores all messages
- `ChatChannelMembers`: Maps users to channels with read status
- `ChatNotifications`: Stores notifications for offline users

## Frontend Implementation

### State Management

Chat state is managed using Redux with the following slices:

- `chatSlice.ts`: Manages chat channels, messages, and unread counts

### API Services

Chat operations are implemented in:

- `api.ts`: Contains methods for interacting with chat endpoints
- `ChatService.ts`: Provides a wrapper around the SignalR connection

### React Components

The UI is built with the following components:

- `ChatPanel.tsx`: Main container component
- `ChatSidebar.tsx`: Shows channels, unread count, and notifications
- `ChatMessage.tsx`: Renders individual messages with Markdown support
- `MessageInput.tsx`: Input for composing messages with emoji support

## Message Flow

1. User sends a message via the `MessageInput` component
2. Message is sent to the server via the SignalR connection
3. Server processes the message, stores it in the database
4. Server broadcasts the message to all channel members via SignalR
5. Client receives the message in real-time and updates the UI

## Role-Based Access Control

Access to channels is controlled by Themis' role-based permissions:

- `GENERAL_ANNOUNCEMENT_POST`: For posting in the general announcements channel
- `DEPARTMENT_ANNOUNCEMENT_POST`: For posting in department announcement channels
- `CHAT_VIEW`: For viewing chat channels
- `CHAT_POST`: For sending messages in channels
- `CHAT_MANAGE`: For creating/archiving channels and managing members

## Project Channels

Project channels are automatically:

1. Created when a new project is approved
2. Archived when a project is completed
3. Read-only after archiving

## Feature Configuration

To enable/disable the Chat feature:

1. Update the `CHAT_ENABLED` flag in `config.ts`
2. Ensure SignalR hub is configured in `Program.cs`

## Testing

Test the chat functionality with:

1. Multiple browser windows to simulate different users
2. Test across different user roles to verify access control
3. Verify real-time updates with minimal latency
4. Confirm message persistence across page reloads

## Deployment Considerations

When deploying:

1. Ensure the SignalR backplane is configured for multi-server deployments
2. Configure sticky sessions if using a load balancer
3. Set up the proper Azure SignalR Service or Redis backplane in production

## Future Enhancements

Potential improvements:

1. File attachments support
2. Message threading
3. Message reactions
4. Rich text formatting
5. Message search functionality
6. Mobile push notifications 