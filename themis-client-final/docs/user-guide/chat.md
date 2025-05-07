# Chat & Announcement Board User Guide

## Overview

The Chat & Announcement Board feature in Themis provides teams with a centralized communication platform. It offers real-time messaging capabilities, announcement broadcasts, and project-specific discussions to keep everyone aligned without relying on email.

## Accessing the Chat

1. Click the **Chat** button in the main navigation bar
2. The Chat interface will open with a sidebar showing your available channels and a main pane for messages

## Channel Types

The Chat & Announcement Board supports four types of channels:

### Announcements Channels

- **General Announcements** (`#general-announcements`): Company-wide announcements visible to all users
  - Only Main PMO and Executives can post messages
  - Everyone can read messages
- **Department Announcements** (`#dept-announcements-<department>`): Department-specific announcements
  - Only Department Directors and Sub-PMOs of that department can post messages
  - Only members of that department can read messages

### Project Channels

- Every project automatically gets a dedicated channel named `#project-<project-id>`
- Project Managers and team members can post and read messages
- When a project is completed, its channel is automatically:
  - Marked as read-only (archived)
  - Labeled with "(archived)" in the channel list
  - Moved to the "Completed" section in the sidebar

### Direct Messages

- Private conversations between two users
- Direct messages follow these rules:
  - Users in the same department can always message each other
  - Cross-department DMs are only permitted when the sender is a Main PMO or Executive
  - All direct message conversations are private and only visible to the participants

## Using the Chat

### Navigating Channels

The sidebar organizes channels into four collapsible sections:
- **Announcements**: General and department announcement channels
- **Projects**: Active project channels
- **Completed**: Archived project channels (read-only)
- **Direct Messages**: Your private conversations

### Sending Messages

1. Select a channel from the sidebar
2. Type your message in the input box at the bottom
3. Click the send button or press Enter to send

### Message Formatting

The message composer supports basic Markdown formatting:
- **Bold**: Surround text with double asterisks (`**bold**`)
- **Italic**: Surround text with single asterisks (`*italic*`)
- **Code**: Surround text with backticks (`` `code` ``)

You can also use the formatting buttons above the input box.

### File Attachments

1. Click the attachment icon in the message composer
2. Select a file to upload (maximum 10MB)
3. Add a message (optional)
4. Click send to upload the file and share it with the channel

### Emoji Reactions

1. Click the emoji icon in the message composer
2. Select an emoji from the picker to insert it into your message

### Editing and Deleting Messages

You can edit or delete your own messages within 5 minutes of sending:
1. Hover over your message
2. Click the three dots (more options) icon
3. Select "Edit" or "Delete"

## Channel Access Rules

Access to channels and posting permissions are governed by Themis' role-based access control:

| Channel Type | Who Can Read | Who Can Post |
|--------------|--------------|--------------|
| General Announcements | Everyone | Main PMO, Executives |
| Department Announcements | Department members | Department Director, Sub-PMOs of that department |
| Project Channels | Project Manager, Project Team | Project Manager, Project Team |
| Direct Messages | Message participants | Message participants |
| Archived Project Channels | Project Manager, Project Team | Nobody (read-only) |

## Notifications

- A badge counter appears next to channels with unread messages
- When mentioned with @username, you'll receive a priority notification
- Offline notifications are delivered via email after 12 hours

## Search

You can search for messages:
1. Click the search icon in the top right of the channel header
2. Enter your search terms
3. Filter results by channel (optional)

## Tips and Best Practices

1. Use **General Announcements** for important company-wide information
2. Keep project discussions in their dedicated project channels
3. Use direct messages for sensitive or private conversations
4. @mention specific users to ensure they see your message
5. Use formatting to make important information stand out
6. Remember that archived project channels are read-only but searchable 