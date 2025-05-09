import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../lib/db';
import { authenticateToken } from '../lib/auth';

const router: Router = Router();

/**
 * GET /api/booking/slots
 * Get available booking slots for a user
 */
router.get('/slots', async (req: Request, res: Response) => {
  try {
    const { userId, start, end } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Default to fetching slots for the next 30 days if no date range is provided
    const startDate = start ? new Date(start as string) : new Date();
    const endDate = end ? new Date(end as string) : new Date(startDate);
    
    if (!end) {
      endDate.setDate(startDate.getDate() + 30);
    }
    
    // Get available slots
    const result = await db.query(`
      SELECT 
        a.id,
        a.user_id,
        a.start_time,
        a.end_time,
        a.service_type,
        a.external_link,
        a.recurring,
        a.recurrence_rule,
        u.full_name as user_name
      FROM 
        availability_slots a
      JOIN 
        users u ON a.user_id = u.id
      WHERE 
        a.user_id = $1 
        AND a.start_time >= $2 
        AND a.end_time <= $3
      ORDER BY 
        a.start_time
    `, [userId, startDate, endDate]);
    
    // Check which slots are already booked
    const slots = await Promise.all(result.rows.map(async (slot: any) => {
      // Check if slot is already booked
      const bookingResult = await db.query(`
        SELECT id FROM bookings WHERE slot_id = $1 AND status = 'confirmed'
      `, [slot.id]);
      
      const isBooked = bookingResult.rows.length > 0;
      
      return {
        ...slot,
        isBooked
      };
    }));
    
    // Only return slots that are not already booked
    const availableSlots = slots.filter(slot => !slot.isBooked);
    
    return res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching booking slots:', error);
    return res.status(500).json({ error: 'Failed to fetch booking slots' });
  }
});

/**
 * POST /api/booking/slots
 * Create or update availability slots
 */
router.post('/slots', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots array is required' });
    }
    
    const results = [];
    
    for (const slot of slots) {
      const {
        start_time,
        end_time,
        service_type = 'built-in',
        external_link = null,
        recurring = false,
        recurrence_rule = null
      } = slot;
      
      if (!start_time || !end_time) {
        return res.status(400).json({ error: 'Start time and end time are required for each slot' });
      }
      
      // Check for conflicting slots
      const conflictCheck = await db.query(`
        SELECT id FROM availability_slots
        WHERE user_id = $1
        AND (
          (start_time <= $2 AND end_time > $2) OR
          (start_time < $3 AND end_time >= $3) OR
          (start_time >= $2 AND end_time <= $3)
        )
      `, [userId, new Date(start_time), new Date(end_time)]);
      
      if (conflictCheck.rows.length > 0 && !slot.overwrite) {
        return res.status(409).json({
          error: 'Conflicting availability slot exists',
          slotId: conflictCheck.rows[0].id
        });
      }
      
      // If overwrite is true, delete conflicting slots
      if (conflictCheck.rows.length > 0 && slot.overwrite) {
        for (const conflict of conflictCheck.rows) {
          await db.query('DELETE FROM availability_slots WHERE id = $1', [conflict.id]);
        }
      }
      
      // Insert new slot
      const result = await db.query(
        `INSERT INTO availability_slots (
          id, user_id, start_time, end_time, 
          service_type, external_link, recurring, recurrence_rule, 
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING *`,
        [
          uuidv4(),
          userId,
          new Date(start_time),
          new Date(end_time),
          service_type,
          external_link,
          recurring,
          recurrence_rule
        ]
      );
      
      results.push(result.rows[0]);
    }
    
    return res.status(201).json(results);
  } catch (error) {
    console.error('Error creating availability slots:', error);
    return res.status(500).json({ error: 'Failed to create availability slots' });
  }
});

/**
 * DELETE /api/booking/slots/:id
 * Delete an availability slot
 */
router.delete('/slots/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Check if slot exists and belongs to user
    const slotCheck = await db.query(
      'SELECT id FROM availability_slots WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (slotCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Availability slot not found or you do not have permission' });
    }
    
    // Check if slot has any bookings
    const bookingCheck = await db.query(
      'SELECT id FROM bookings WHERE slot_id = $1',
      [id]
    );
    
    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete slot with existing bookings',
        bookingCount: bookingCheck.rows.length
      });
    }
    
    // Delete the slot
    await db.query('DELETE FROM availability_slots WHERE id = $1', [id]);
    
    return res.status(200).json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return res.status(500).json({ error: 'Failed to delete availability slot' });
  }
});

/**
 * POST /api/booking/book
 * Book an available slot
 */
router.post('/book', async (req: Request, res: Response) => {
  try {
    const { slot_id, name, email, notes } = req.body;
    
    if (!slot_id || !name || !email) {
      return res.status(400).json({ error: 'Slot ID, name, and email are required' });
    }
    
    // Check if slot exists and is available
    const slotResult = await db.query(
      `SELECT 
        a.id, 
        a.user_id, 
        a.start_time, 
        a.end_time, 
        a.service_type, 
        a.external_link,
        u.full_name as host_name,
        u.email as host_email
      FROM 
        availability_slots a
      JOIN 
        users u ON a.user_id = u.id
      WHERE 
        a.id = $1`,
      [slot_id]
    );
    
    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }
    
    const slot = slotResult.rows[0];
    
    // Check if slot is already booked
    const bookingCheck = await db.query(
      'SELECT id FROM bookings WHERE slot_id = $1 AND status = $2',
      [slot_id, 'confirmed']
    );
    
    if (bookingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'This slot has already been booked' });
    }
    
    // Check for conflicts with existing meetings
    const conflictCheck = await db.query(
      `SELECT id FROM meetings 
       WHERE created_by = $1 
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [slot.user_id, slot.start_time, slot.end_time]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Host has a conflict with this time slot' });
    }
    
    let meeting_id = null;
    let meeting_link = slot.external_link;
    
    // If service_type is built-in, create a meeting
    if (slot.service_type === 'built-in') {
      const meetingId = uuidv4();
      const meetingTitle = `Meeting with ${name}`;
      
      // Create meeting record
      const meetingResult = await db.query(
        `INSERT INTO meetings (
          id, title, description, start_time, end_time, 
          created_by, meeting_link, attendees, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING id, meeting_link`,
        [
          meetingId,
          meetingTitle,
          notes || `Booking by ${name} (${email})`,
          slot.start_time,
          slot.end_time,
          slot.user_id,
          `/meetings/${meetingId}`,
          JSON.stringify([
            { name: slot.host_name, email: slot.host_email, role: 'host' },
            { name, email, role: 'attendee' }
          ])
        ]
      );
      
      meeting_id = meetingResult.rows[0].id;
      meeting_link = meetingResult.rows[0].meeting_link;
    }
    
    // Create booking record
    const bookingId = uuidv4();
    const bookingResult = await db.query(
      `INSERT INTO bookings (
        id, slot_id, meeting_id, name, email, 
        meeting_link, notes, status, booked_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      ) RETURNING *`,
      [
        bookingId,
        slot_id,
        meeting_id,
        name,
        email,
        meeting_link,
        notes,
        'confirmed'
      ]
    );
    
    // TODO: Send confirmation email to both parties
    
    return res.status(201).json({
      ...bookingResult.rows[0],
      host: {
        name: slot.host_name,
        email: slot.host_email
      },
      time: {
        start: slot.start_time,
        end: slot.end_time
      }
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    return res.status(500).json({ error: 'Failed to book slot' });
  }
});

/**
 * GET /api/booking/:id
 * Get booking details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT 
        b.*,
        a.start_time,
        a.end_time,
        a.service_type,
        u.full_name as host_name,
        u.email as host_email
      FROM 
        bookings b
      JOIN 
        availability_slots a ON b.slot_id = a.id
      JOIN 
        users u ON a.user_id = u.id
      WHERE 
        b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router; 