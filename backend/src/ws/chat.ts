import { WebSocket, RawData, IncomingMessage } from 'ws';
import { parse } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { query, insert } from '../lib/db';

// Map of room IDs to connected clients
const rooms = new Map<string, Set<WebSocket>>();

// Map of client connections to their authenticated user IDs
const clients = new Map<WebSocket, { userId: string, rooms: Set<string> }>();

interface ChatMessage {
  id: string;
  type: string;
  roomId: string;
  userId: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  timestamp: string;
}

/**
 * Handle WebSocket connection for chat
 */
export function setupChatWebSocket(ws: WebSocket, req: IncomingMessage): void {
  const url = parse(req.url || '', true);
  const userId = url.query.userId as string;

  if (!userId) {
    console.error('Unauthorized chat connection attempt');
    ws.close(1008, 'Authentication required');
    return;
  }

  // Initialize client data
  clients.set(ws, { userId, rooms: new Set() });

  console.log(`Chat client connected: User ${userId}`);

  // Listen for messages
  ws.on('message', async (data: RawData) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'join':
          handleJoinRoom(ws, message.roomId);
          break;
        
        case 'leave':
          handleLeaveRoom(ws, message.roomId);
          break;
        
        case 'message':
          await handleChatMessage(ws, message);
          break;
        
        case 'typing':
          handleTypingIndicator(ws, message.roomId, message.isTyping);
          break;
          
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing chat message:', error);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    handleDisconnect(ws);
  });
}

/**
 * Handle client joining a chat room
 */
function handleJoinRoom(ws: WebSocket, roomId: string): void {
  const clientData = clients.get(ws);
  if (!clientData) return;

  // Add client to room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  rooms.get(roomId)?.add(ws);
  clientData.rooms.add(roomId);

  // Notify others in room
  broadcastToRoom(roomId, {
    type: 'user_joined',
    roomId,
    userId: clientData.userId,
    timestamp: new Date().toISOString()
  }, ws);

  console.log(`User ${clientData.userId} joined room ${roomId}`);
}

/**
 * Handle client leaving a chat room
 */
function handleLeaveRoom(ws: WebSocket, roomId: string): void {
  const clientData = clients.get(ws);
  if (!clientData) return;

  removeFromRoom(ws, roomId);
  console.log(`User ${clientData.userId} left room ${roomId}`);
}

/**
 * Handle chat message
 */
async function handleChatMessage(ws: WebSocket, message: any): Promise<void> {
  const clientData = clients.get(ws);
  if (!clientData || !clientData.rooms.has(message.roomId)) return;

  const { roomId, content, fileUrl, fileType, fileSize } = message;
  const messageId = uuidv4();
  const timestamp = new Date().toISOString();
  
  // Create message object
  const chatMessage: ChatMessage = {
    id: messageId,
    type: 'message',
    roomId,
    userId: clientData.userId,
    content,
    fileUrl,
    fileType,
    fileSize,
    timestamp
  };

  // Persist to database
  try {
    await insert('chat_messages', {
      id: messageId,
      room_id: roomId,
      user_id: clientData.userId,
      content,
      metadata: { fileUrl, fileType, fileSize },
      created_at: new Date(timestamp)
    });
    
    // Broadcast to all clients in the room
    broadcastToRoom(roomId, chatMessage);
  } catch (error) {
    console.error('Error persisting chat message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to send message',
      originalMessage: message
    }));
  }
}

/**
 * Handle typing indicator
 */
function handleTypingIndicator(ws: WebSocket, roomId: string, isTyping: boolean): void {
  const clientData = clients.get(ws);
  if (!clientData || !clientData.rooms.has(roomId)) return;

  // Broadcast typing status to room (except sender)
  broadcastToRoom(roomId, {
    type: 'typing',
    roomId,
    userId: clientData.userId,
    isTyping,
    timestamp: new Date().toISOString()
  }, ws);
}

/**
 * Handle client disconnection
 */
function handleDisconnect(ws: WebSocket): void {
  const clientData = clients.get(ws);
  if (!clientData) return;

  // Remove from all rooms
  clientData.rooms.forEach(roomId => {
    removeFromRoom(ws, roomId);
  });

  // Remove from clients map
  clients.delete(ws);
  console.log(`User ${clientData.userId} disconnected`);
}

/**
 * Remove client from room and broadcast departure
 */
function removeFromRoom(ws: WebSocket, roomId: string): void {
  const clientData = clients.get(ws);
  if (!clientData) return;

  // Remove from room
  const room = rooms.get(roomId);
  if (room) {
    room.delete(ws);
    
    // If room is empty, remove it
    if (room.size === 0) {
      rooms.delete(roomId);
    } else {
      // Notify others
      broadcastToRoom(roomId, {
        type: 'user_left',
        roomId,
        userId: clientData.userId,
        timestamp: new Date().toISOString()
      }, ws);
    }
  }

  // Remove room from client's joined rooms
  clientData.rooms.delete(roomId);
}

/**
 * Broadcast message to all clients in a room
 */
function broadcastToRoom(roomId: string, message: any, exclude?: WebSocket): void {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  
  room.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

/**
 * Get chat room history
 */
export async function getChatHistory(roomId: string, limit = 50): Promise<ChatMessage[]> {
  const result = await query(
    `SELECT m.id, m.room_id, m.user_id, m.content, m.metadata, m.created_at,
            u.full_name as user_name
     FROM chat_messages m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.room_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2`,
    [roomId, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    type: 'message',
    roomId: row.room_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    fileUrl: row.metadata?.fileUrl,
    fileType: row.metadata?.fileType,
    fileSize: row.metadata?.fileSize,
    timestamp: row.created_at.toISOString()
  }));
} 