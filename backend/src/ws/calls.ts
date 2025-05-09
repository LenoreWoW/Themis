import { WebSocket, RawData } from 'ws';
import http from 'http';
import { parse } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { query, insert, remove } from '../lib/db';

// Map of room ID to connected peers
const rooms = new Map<string, Map<string, WebSocket>>();

// Map of WebSocket connection to { roomId, peerId }
const connections = new Map<WebSocket, { roomId: string, peerId: string }>();

/**
 * Handle WebSocket connection for WebRTC signaling
 */
export function setupCallsWebSocket(ws: WebSocket, req: http.IncomingMessage): void {
  const url = parse(req.url || '', true);
  const roomId = url.pathname?.split('/').pop() || '';
  const userId = url.query.userId as string;
  
  if (!roomId || !userId) {
    console.error('Missing required parameters for call signaling');
    ws.close(1008, 'Missing required parameters');
    return;
  }
  
  // Generate unique peer ID
  const peerId = `${userId}-${uuidv4().substring(0, 8)}`;
  
  // Initialize room if doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
    console.log(`Created new call room: ${roomId}`);
  }
  
  // Add peer to room
  const room = rooms.get(roomId)!;
  room.set(peerId, ws);
  
  // Store connection data
  connections.set(ws, { roomId, peerId });
  
  console.log(`Peer ${peerId} joined call room ${roomId}, total peers: ${room.size}`);
  
  // Send room info to the new peer
  const peers = Array.from(room.keys()).filter(id => id !== peerId);
  ws.send(JSON.stringify({
    type: 'room_info',
    roomId,
    peerId,
    peers
  }));
  
  // Notify other peers about the new peer
  broadcastToRoom(roomId, {
    type: 'peer_joined',
    peerId,
    timestamp: new Date().toISOString()
  }, peerId);
  
  // Log active call
  logActiveCall(roomId, userId);
  
  // Set up message handling
  ws.on('message', (data: RawData) => {
    try {
      const message = JSON.parse(data.toString());
      handleCallMessage(ws, message);
    } catch (error) {
      console.error('Error processing call message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    handleDisconnect(ws);
  });
}

/**
 * Handle call-related messages
 */
function handleCallMessage(ws: WebSocket, message: any): void {
  const connection = connections.get(ws);
  if (!connection) return;
  
  const { roomId, peerId } = connection;
  const room = rooms.get(roomId);
  if (!room) return;
  
  switch (message.type) {
    case 'offer':
    case 'answer':
    case 'ice_candidate':
      relayMessage(roomId, peerId, message);
      break;
      
    case 'mute_status':
      broadcastToRoom(roomId, {
        type: 'mute_status',
        peerId,
        audio: message.audio,
        video: message.video
      });
      break;
      
    case 'request_screen_share':
      broadcastToRoom(roomId, {
        type: 'request_screen_share',
        peerId,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'screen_share_started':
    case 'screen_share_stopped':
      broadcastToRoom(roomId, {
        ...message,
        peerId
      });
      break;
      
    default:
      console.warn(`Unknown call message type: ${message.type}`);
  }
}

/**
 * Relay signaling message to specific peer
 */
function relayMessage(roomId: string, fromPeerId: string, message: any): void {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const { targetPeerId } = message;
  if (!targetPeerId) {
    console.warn('No target peer specified for relay message');
    return;
  }
  
  const targetPeer = room.get(targetPeerId);
  if (!targetPeer || targetPeer.readyState !== WebSocket.OPEN) {
    console.warn(`Target peer ${targetPeerId} not found or not connected`);
    return;
  }
  
  // Add sender peer ID to the message
  message.fromPeerId = fromPeerId;
  
  targetPeer.send(JSON.stringify(message));
}

/**
 * Broadcast message to all peers in a room
 */
function broadcastToRoom(roomId: string, message: any, excludePeerId?: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  
  room.forEach((ws, peerId) => {
    if (peerId !== excludePeerId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Handle peer disconnection
 */
function handleDisconnect(ws: WebSocket): void {
  const connection = connections.get(ws);
  if (!connection) return;
  
  const { roomId, peerId } = connection;
  
  // Remove from room
  const room = rooms.get(roomId);
  if (room) {
    room.delete(peerId);
    
    // Notify other peers
    broadcastToRoom(roomId, {
      type: 'peer_left',
      peerId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Peer ${peerId} left call room ${roomId}, remaining peers: ${room.size}`);
    
    // If room empty, clean up
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Call room ${roomId} closed as last peer left`);
    }
  }
  
  // Remove connection
  connections.delete(ws);
}

/**
 * Log active call in database
 */
async function logActiveCall(roomId: string, userId: string): Promise<void> {
  try {
    await insert('call_logs', {
      room_id: roomId,
      user_id: userId,
      action: 'join',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log call join:', error);
  }
}

/**
 * Create a new call room
 */
export async function createCallRoom(hostUserId: string): Promise<string> {
  // Generate room ID
  const roomId = uuidv4();
  
  // Log call creation
  try {
    await insert('call_rooms', {
      id: roomId,
      host_user_id: hostUserId,
      created_at: new Date(),
      active: true
    });
  } catch (error) {
    console.error('Failed to log call room creation:', error);
  }
  
  return roomId;
}

/**
 * Get active call room participants
 */
export function getCallParticipants(roomId: string): string[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  
  return Array.from(room.keys());
} 