import express from 'express';
import { query, insert, update } from '../lib/db';

const router: express.Router = express.Router();

/**
 * GET /api/tutorials/:userId
 * Get completed tutorials for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await query(
      `SELECT tutorial_key, completed, completed_at
       FROM user_tutorials
       WHERE user_id = $1
       ORDER BY tutorial_key`,
      [userId]
    );
    
    return res.json({
      userId,
      tutorials: result.rows
    });
  } catch (error) {
    console.error('Error fetching user tutorials:', error);
    return res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});

/**
 * POST /api/tutorials/complete
 * Mark a tutorial as completed for a user
 */
router.post('/complete', async (req, res) => {
  try {
    const { userId, tutorialKey } = req.body;
    
    if (!userId || !tutorialKey) {
      return res.status(400).json({ error: 'User ID and tutorial key are required' });
    }
    
    const now = new Date();
    
    // For the upsert function, we need to modify our approach since the parameters
    // don't match what the DB implementation expects
    const existingResult = await query(
      `SELECT * FROM user_tutorials 
       WHERE user_id = $1 AND tutorial_key = $2`,
      [userId, tutorialKey]
    );
    
    let result;
    
    if (existingResult.rowCount > 0) {
      // Update existing record
      result = await update('user_tutorials', 
        {
          completed: true,
          completed_at: now,
          updated_at: now
        },
        {
          user_id: userId,
          tutorial_key: tutorialKey
        }
      );
    } else {
      // Insert new record
      result = await insert<UserTutorial>('user_tutorials', {
        user_id: userId,
        tutorial_key: tutorialKey,
        completed: true,
        completed_at: now,
        created_at: now,
        updated_at: now
      });
    }
    
    return res.json(Array.isArray(result) ? result[0] : result);
  } catch (error) {
    console.error('Error marking tutorial as completed:', error);
    return res.status(500).json({ error: 'Failed to mark tutorial as completed' });
  }
});

/**
 * POST /api/tutorials/reset
 * Reset tutorials for a user
 */
router.post('/reset', async (req, res) => {
  try {
    const { userId, tutorialKeys } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    let sql = 'UPDATE user_tutorials SET completed = false, completed_at = NULL, updated_at = $1 WHERE user_id = $2';
    const params: any[] = [new Date(), userId];
    
    // If specific tutorial keys are provided, only reset those
    if (tutorialKeys && Array.isArray(tutorialKeys) && tutorialKeys.length > 0) {
      sql += ` AND tutorial_key = ANY($3)`;
      params.push(tutorialKeys);
    }
    
    await query(sql, params);
    
    return res.json({
      success: true,
      message: 'Tutorials reset successfully'
    });
  } catch (error) {
    console.error('Error resetting tutorials:', error);
    return res.status(500).json({ error: 'Failed to reset tutorials' });
  }
});

/**
 * GET /api/tutorials/available
 * Get list of all available tutorials
 */
router.get('/available/list', async (req, res) => {
  try {
    // This would typically come from a database table, but for simplicity,
    // we'll return a hard-coded list of tutorials available in the app
    const tutorials = [
      {
        key: 'app_introduction',
        title: 'Introduction to Themis',
        description: 'Learn the basics of navigating and using Themis',
        steps: 5,
        role: 'all'
      },
      {
        key: 'project_management',
        title: 'Project Management',
        description: 'How to create and manage projects in Themis',
        steps: 4,
        role: 'project_manager'
      },
      {
        key: 'task_management',
        title: 'Task Management',
        description: 'How to create, assign, and track tasks',
        steps: 6,
        role: 'all'
      },
      {
        key: 'analytics_dashboard',
        title: 'Analytics Dashboard',
        description: 'How to use the analytics features and interpret the data',
        steps: 3,
        role: 'pmo'
      },
      {
        key: 'reporting',
        title: 'Advanced Reporting',
        description: 'How to create, customize, and schedule reports',
        steps: 7,
        role: 'pmo'
      },
      {
        key: 'collaboration',
        title: 'Collaboration Tools',
        description: 'How to use chat, document editing, and video calls',
        steps: 5,
        role: 'all'
      }
    ];
    
    return res.json({ tutorials });
  } catch (error) {
    console.error('Error fetching available tutorials:', error);
    return res.status(500).json({ error: 'Failed to fetch available tutorials' });
  }
});

export default router; 