import express from 'express';
import { query, insert, update, remove } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const router: express.Router = express.Router();

/**
 * GET /api/notifications/:userId
 * Get notifications for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeRead = req.query.includeRead === 'true';
    
    let sql = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    
    // Only include unread notifications if specified
    if (!includeRead) {
      sql += ` AND read = false`;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    // Count total unread notifications
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
    
    return res.json({
      notifications: result.rows,
      unreadCount: parseInt(countResult.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification
 */
router.post('/', async (req, res) => {
  try {
    const { userId, title, content, type, link, referenceId } = req.body;
    
    if (!userId || !title || !content) {
      return res.status(400).json({ error: 'User ID, title, and content are required' });
    }
    
    const notificationId = uuidv4();
    
    const result = await insert<Notification>('notifications', {
      id: notificationId,
      user_id: userId,
      title,
      content,
      type: type || 'GENERAL',
      read: false,
      link: link || null,
      reference_id: referenceId || null,
      created_at: new Date()
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * POST /api/notifications/batch
 * Create notifications for multiple users
 */
router.post('/batch', async (req, res) => {
  try {
    const { userIds, title, content, type, link, referenceId } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !content) {
      return res.status(400).json({ error: 'User IDs array, title, and content are required' });
    }
    
    const now = new Date();
    const notifications = [];
    
    // Insert notifications for each user
    for (const userId of userIds) {
      const notificationId = uuidv4();
      
      const result = await insert<Notification>('notifications', {
        id: notificationId,
        user_id: userId,
        title,
        content,
        type: type || 'GENERAL',
        read: false,
        link: link || null,
        reference_id: referenceId || null,
        created_at: now
      });
      
      notifications.push(result);
    }
    
    return res.status(201).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error creating batch notifications:', error);
    return res.status(500).json({ error: 'Failed to create batch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await update<Notification>(
      'notifications',
      { id },
      { read: true }
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.json(result[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for a user
 */
router.patch('/read-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await query(
      `UPDATE notifications
       SET read = true
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
    
    return res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await remove<Notification[]>(
      'notifications',
      { id }
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router; 