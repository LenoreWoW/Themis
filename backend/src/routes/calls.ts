import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../lib/db';

const router: express.Router = express.Router();

/**
 * @route POST /api/calls/create
 * @desc Create a new call room
 */
router.post('/create', async (req, res) => {
  try {
    const { hostUserId, title } = req.body;
    
    if (!hostUserId) {
      return res.status(400).json({ error: 'Host user ID is required' });
    }
    
    // Generate a unique room ID
    const roomId = uuidv4();
    
    // Insert call room into database
    await db.insert('call_rooms', {
      id: roomId,
      host_user_id: hostUserId,
      title: title || 'Video Call',
      created_at: new Date(),
      active: true
    });
    
    return res.status(201).json({
      roomId,
      hostUserId,
      title: title || 'Video Call',
      url: `/calls/${roomId}`
    });
  } catch (error) {
    console.error('Error creating call room:', error);
    return res.status(500).json({ error: 'Failed to create call room' });
  }
});

/**
 * @route GET /api/calls/:roomId/participants
 * @desc Get participants of a call room
 */
router.get('/:roomId/participants', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // This would normally come from an in-memory store of active calls
    // For now, we'll return a placeholder
    return res.json({
      roomId,
      participants: []
    });
  } catch (error) {
    console.error('Error fetching call participants:', error);
    return res.status(500).json({ error: 'Failed to fetch call participants' });
  }
});

/**
 * @route POST /api/calls/invite
 * @desc Send a call invitation to users
 */
router.post('/invite', async (req, res) => {
  try {
    const { roomId, inviterId, inviteeIds, message } = req.body;
    
    if (!roomId || !inviterId || !inviteeIds || !Array.isArray(inviteeIds)) {
      return res.status(400).json({ error: 'Room ID, inviter ID, and invitee IDs array are required' });
    }
    
    // Get room info
    const roomResult = await db.query(
      'SELECT title FROM call_rooms WHERE id = $1',
      [roomId]
    );
    
    if (roomResult.rowCount === 0) {
      return res.status(404).json({ error: 'Call room not found' });
    }
    
    const roomTitle = roomResult.rows[0].title;
    
    // Create notifications for each invitee
    const notifications = [];
    
    for (const inviteeId of inviteeIds) {
      const notification = await db.insert('notifications', {
        id: uuidv4(),
        user_id: inviteeId,
        title: 'Video Call Invitation',
        content: message || `You have been invited to join a video call: ${roomTitle}`,
        type: 'CALL_INVITATION',
        read: false,
        link: `/calls/${roomId}`,
        reference_id: roomId,
        created_at: new Date()
      });
      
      notifications.push(notification);
    }
    
    // Log invitation
    await db.insert('call_invitations', {
      id: uuidv4(),
      room_id: roomId,
      inviter_id: inviterId,
      invitee_ids: inviteeIds,
      message: message || `Join video call: ${roomTitle}`,
      created_at: new Date()
    });
    
    return res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error sending call invitations:', error);
    return res.status(500).json({ error: 'Failed to send call invitations' });
  }
});

/**
 * @route PATCH /api/calls/:roomId/end
 * @desc End an active call
 */
router.patch('/:roomId/end', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Update room status
    const result = await db.update(
      'call_rooms',
      { active: false, ended_at: new Date() },
      { id: roomId }
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Call room not found' });
    }
    
    return res.json({
      success: true,
      message: 'Call ended successfully'
    });
  } catch (error) {
    console.error('Error ending call:', error);
    return res.status(500).json({ error: 'Failed to end call' });
  }
});

export default router; 