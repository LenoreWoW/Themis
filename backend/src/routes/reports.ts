import express from 'express';
import { query, insert, update, remove } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const router: express.Router = express.Router();

/**
 * GET /api/reports
 * Get reports with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { userId, isTemplate, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT r.*, u.full_name as owner_name
      FROM reports r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND r.owner_id = $${paramIndex++}`;
      params.push(userId);
    }
    
    if (isTemplate !== undefined) {
      sql += ` AND r.is_template = $${paramIndex++}`;
      params.push(isTemplate === 'true');
    }
    
    sql += ` ORDER BY r.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    return res.json({
      reports: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/reports/:id
 * Get a specific report by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT r.*, u.full_name as owner_name
       FROM reports r
       LEFT JOIN users u ON r.owner_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Get schedules if any
    const schedulesResult = await query(
      `SELECT * FROM report_schedules WHERE report_id = $1`,
      [id]
    );
    
    const report = result.rows[0];
    report.schedules = schedulesResult.rows;
    
    return res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * POST /api/reports
 * Create a new report
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, ownerId, schema, isTemplate = false } = req.body;
    
    if (!name || !ownerId || !schema) {
      return res.status(400).json({ error: 'Name, owner ID, and schema are required' });
    }
    
    const reportId = uuidv4();
    const now = new Date();
    
    const result = await insert<Report>('reports', {
      id: reportId,
      name,
      description: description || null,
      owner_id: ownerId,
      schema,
      is_template: isTemplate,
      created_at: now,
      updated_at: now
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

/**
 * PUT /api/reports/:id
 * Update an existing report
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, schema, isTemplate } = req.body;
    
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (schema !== undefined) updateData.schema = schema;
    if (isTemplate !== undefined) updateData.is_template = isTemplate;
    
    const result = await update<Report>('reports', { id }, updateData);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    return res.json(result[0]);
  } catch (error) {
    console.error('Error updating report:', error);
    return res.status(500).json({ error: 'Failed to update report' });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete schedules first (due to foreign key)
    await remove('report_schedules', { report_id: id });
    
    // Delete the report
    const result = await remove<Report[]>('reports', { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    return res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return res.status(500).json({ error: 'Failed to delete report' });
  }
});

/**
 * GET /api/reports/templates
 * Get report templates
 */
router.get('/templates/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM report_templates ORDER BY name ASC`
    );
    
    return res.json({
      templates: result.rows
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return res.status(500).json({ error: 'Failed to fetch report templates' });
  }
});

/**
 * POST /api/reports/templates
 * Create a new report template
 */
router.post('/templates', async (req, res) => {
  try {
    const { name, description, schema } = req.body;
    
    if (!name || !schema) {
      return res.status(400).json({ error: 'Name and schema are required' });
    }
    
    const templateId = uuidv4();
    const now = new Date();
    
    const result = await insert<Report>('report_templates', {
      id: templateId,
      name,
      description: description || null,
      schema,
      created_at: now,
      updated_at: now
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating report template:', error);
    return res.status(500).json({ error: 'Failed to create report template' });
  }
});

/**
 * POST /api/reports/:id/schedule
 * Create or update a report schedule
 */
router.post('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { rrule, recipients, format, subject, message } = req.body;
    
    if (!rrule || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recurrence rule and recipients are required' });
    }
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Format must be either "pdf" or "excel"' });
    }
    
    // Check if report exists
    const reportResult = await query('SELECT id FROM reports WHERE id = $1', [id]);
    
    if (reportResult.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if schedule already exists
    const scheduleResult = await query(
      'SELECT id FROM report_schedules WHERE report_id = $1',
      [id]
    );
    
    const now = new Date();
    
    if (scheduleResult.rowCount > 0) {
      // Update existing schedule
      const scheduleId = scheduleResult.rows[0].id;
      
      const result = await update<any>(
        'report_schedules',
        { id: scheduleId },
        {
          rrule,
          recipients: recipients,
          format,
          subject: subject || null,
          message: message || null,
          updated_at: now
        }
      );
      
      return res.json(result[0]);
    } else {
      // Create new schedule
      const scheduleId = uuidv4();
      
      const result = await insert<any>('report_schedules', {
        id: scheduleId,
        report_id: id,
        rrule,
        recipients: recipients,
        format,
        subject: subject || null,
        message: message || null,
        created_at: now,
        updated_at: now
      });
      
      return res.status(201).json(result);
    }
  } catch (error) {
    console.error('Error scheduling report:', error);
    return res.status(500).json({ error: 'Failed to schedule report' });
  }
});

/**
 * DELETE /api/reports/:id/schedule
 * Delete a report schedule
 */
router.delete('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await remove<any[]>('report_schedules', { report_id: id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }
    
    return res.json({
      success: true,
      message: 'Report schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report schedule:', error);
    return res.status(500).json({ error: 'Failed to delete report schedule' });
  }
});

export default router; 