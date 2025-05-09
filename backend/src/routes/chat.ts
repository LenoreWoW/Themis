import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../lib/db';

const router: express.Router = express.Router();

/**
 * @route GET /api/chat/channels
 * @desc Get user's chat channels
 */
router.get('/channels', async (req, res) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const result = await db.query<ChatChannel>(
      `SELECT * FROM chat_channels 
       WHERE $1 = ANY(participants)
       ORDER BY updated_at DESC`,
      [userId]
    );
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat channels:', error);
    return res.status(500).json({ error: 'Failed to fetch chat channels' });
  }
});

/**
 * @route GET /api/chat/channels/:id
 * @desc Get channel details
 */
router.get('/channels/:id', async (req, res) => {
  const channelId = req.params.id;
  
  try {
    const result = await db.query<ChatChannel>(
      'SELECT * FROM chat_channels WHERE id = $1',
      [channelId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching channel details:', error);
    return res.status(500).json({ error: 'Failed to fetch channel details' });
  }
});

/**
 * @route GET /api/chat/channels/:id/messages
 * @desc Get channel messages
 */
router.get('/channels/:id/messages', async (req, res) => {
  const channelId = req.params.id;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  try {
    const result = await db.query<ChatMessage>(
      `SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
       FROM chat_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.channel_id = $1
       ORDER BY m.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [channelId, limit, offset]
    );
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    return res.status(500).json({ error: 'Failed to fetch channel messages' });
  }
});

/**
 * @route POST /api/chat/channels/:id/messages
 * @desc Send a message
 */
router.post('/channels/:id/messages', async (req, res) => {
  const channelId = req.params.id;
  const { senderId, content } = req.body;
  
  if (!senderId || !content) {
    return res.status(400).json({ error: 'Sender ID and content are required' });
  }
  
  try {
    // Insert the message
    const message: Partial<ChatMessage> = {
      id: uuidv4(),
      channel_id: channelId,
      sender_id: senderId,
      content,
      sent_at: new Date(),
      read_by: [senderId]
    };
    
    const result = await db.insert<ChatMessage>('chat_messages', message);
    
    // Update channel's last activity timestamp
    await db.update('chat_channels', 
      { updated_at: new Date() },
      { id: channelId }
    );
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * @route POST /api/chat/channels
 * @desc Create a new chat channel
 */
router.post('/channels', async (req, res) => {
  const { name, type, participants, projectId } = req.body;
  
  if (!type || !participants || participants.length === 0) {
    return res.status(400).json({ 
      error: 'Channel type and at least one participant are required' 
    });
  }
  
  try {
    const channel: Partial<ChatChannel> = {
      id: uuidv4(),
      name: name || 'New Channel',
      type: type as 'direct' | 'group' | 'project',
      participants,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    if (type === 'project' && projectId) {
      Object.assign(channel, { project_id: projectId });
    }
    
    const result = await db.insert<ChatChannel>('chat_channels', channel);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating chat channel:', error);
    return res.status(500).json({ error: 'Failed to create chat channel' });
  }
});

/**
 * @route PATCH /api/chat/messages/:id/read
 * @desc Mark message as read
 */
router.patch('/messages/:id/read', async (req, res) => {
  const messageId = req.params.id;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // First get current read_by array
    const messageResult = await db.query<ChatMessage>(
      'SELECT read_by FROM chat_messages WHERE id = $1',
      [messageId]
    );
    
    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    const currentReadBy = messageResult.rows[0].read_by || [];
    
    // Only add the user if they haven't already read it
    if (!currentReadBy.includes(userId)) {
      const newReadBy = [...currentReadBy, userId];
      
      const result = await db.update<ChatMessage>(
        'chat_messages',
        { read_by: newReadBy },
        { id: messageId }
      );
      
      return res.json(result[0]);
    }
    
    return res.json(messageResult.rows[0]);
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router; 