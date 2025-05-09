import express from 'express';
import { query, insert, update, remove } from '../lib/db';

const router: express.Router = express.Router();

/**
 * GET /api/availability/:userId
 * Get availability slots for a user in a given date range
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end date parameters are required' });
    }
    
    // Query availability slots
    const result = await query(
      `SELECT 
        user_id, 
        start_time, 
        end_time, 
        notes 
      FROM 
        user_availability 
      WHERE 
        user_id = $1 
        AND start_time >= $2 
        AND end_time <= $3 
      ORDER BY 
        start_time`,
      [userId, start, end]
    );
    
    // Format for FullCalendar consumption
    const events = result.rows.map((slot: any) => ({
      id: `${slot.user_id}-${new Date(slot.start_time).getTime()}`,
      title: slot.notes || 'Available',
      start: slot.start_time,
      end: slot.end_time,
      userId: slot.user_id,
      notes: slot.notes,
      allDay: isAllDayEvent(slot.start_time, slot.end_time)
    }));
    
    return res.json(events);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

/**
 * POST /api/availability
 * Create or update availability slots
 */
router.post('/', async (req, res) => {
  try {
    const { userId, slots } = req.body;
    
    if (!userId || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: 'User ID and availability slots are required' });
    }
    
    const results = [];
    
    // Process each slot
    for (const slot of slots) {
      const { start, end, notes } = slot;
      
      if (!start || !end) {
        return res.status(400).json({ error: 'Each slot must have start and end times' });
      }
      
      // Check if conflicting slots exist
      const conflictResult = await query(
        `SELECT * FROM user_availability 
         WHERE user_id = $1 
         AND (
           (start_time <= $2 AND end_time > $2) OR 
           (start_time < $3 AND end_time >= $3) OR
           (start_time >= $2 AND end_time <= $3)
         )`,
        [userId, new Date(start), new Date(end)]
      );
      
      if (conflictResult.rows.length > 0 && !slot.overwrite) {
        return res.status(409).json({ 
          error: 'Conflict with existing availability slots', 
          conflicts: conflictResult.rows 
        });
      }
      
      // If overwrite enabled, delete conflicting slots
      if (slot.overwrite && conflictResult.rows.length > 0) {
        await Promise.all(conflictResult.rows.map(async (conflictSlot: any) => {
          await remove('user_availability', {
            user_id: userId,
            start_time: conflictSlot.start_time
          });
        }));
      }
      
      // Insert the new slot
      const result = await insert<any>('user_availability', {
        user_id: userId,
        start_time: new Date(start),
        end_time: new Date(end),
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      results.push(result);
    }
    
    return res.status(201).json({
      success: true,
      count: results.length,
      slots: results
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

/**
 * DELETE /api/availability/:userId
 * Delete availability slots for a user
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start } = req.query;
    
    if (!start) {
      return res.status(400).json({ error: 'Start time parameter is required' });
    }
    
    const result = await remove<any[]>('user_availability', {
      user_id: userId,
      start_time: new Date(start as string)
    });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }
    
    return res.json({
      success: true,
      message: 'Availability slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return res.status(500).json({ error: 'Failed to delete availability' });
  }
});

/**
 * GET /api/availability/team/:departmentId
 * Get availability for all users in a department
 */
router.get('/team/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end date parameters are required' });
    }
    
    // Query availability for all users in department
    const result = await query(
      `SELECT 
        a.user_id, 
        u.full_name as user_name,
        a.start_time, 
        a.end_time, 
        a.notes 
      FROM 
        user_availability a
      JOIN 
        users u ON a.user_id = u.id
      WHERE 
        u.department = $1 
        AND a.start_time >= $2 
        AND a.end_time <= $3 
      ORDER BY 
        u.full_name, a.start_time`,
      [departmentId, start, end]
    );
    
    // Group by user
    const userMap = new Map();
    
    result.rows.forEach((slot: any) => {
      if (!userMap.has(slot.user_id)) {
        userMap.set(slot.user_id, {
          userId: slot.user_id,
          userName: slot.user_name,
          events: []
        });
      }
      
      userMap.get(slot.user_id).events.push({
        id: `${slot.user_id}-${new Date(slot.start_time).getTime()}`,
        title: slot.notes || 'Available',
        start: slot.start_time,
        end: slot.end_time,
        allDay: isAllDayEvent(slot.start_time, slot.end_time)
      });
    });
    
    return res.json(Array.from(userMap.values()));
  } catch (error) {
    console.error('Error fetching team availability:', error);
    return res.status(500).json({ error: 'Failed to fetch team availability' });
  }
});

/**
 * Helper: Check if event spans a full day
 */
function isAllDayEvent(start: Date, end: Date): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Check if the event spans a full day (or multiple days)
  return (
    startDate.getHours() === 0 && 
    startDate.getMinutes() === 0 && 
    endDate.getHours() === 23 && 
    endDate.getMinutes() === 59
  );
}

export default router; 