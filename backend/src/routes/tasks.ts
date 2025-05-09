import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { authenticateToken } from '../lib/auth';

const router: Router = Router();

/**
 * Calculate urgency score based on severity and deadline
 * Formula: urgencyScore = severityWeight / (hoursRemaining + 1)
 * If item is overdue, urgencyScore = severityWeight
 */
function calculateUrgencyScore(severity: string, deadline: Date | null): number {
  // Map severity to weight
  const severityWeight = {
    'high': 3,
    'medium': 2,
    'low': 1
  }[severity] || 1;
  
  if (!deadline) return 0;
  
  // Calculate hours remaining
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursRemaining = Math.max((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60), 0);
  
  // Calculate urgency score
  return hoursRemaining === 0 ? severityWeight : severityWeight / (hoursRemaining + 1);
}

/**
 * Get tasks with optional auto-organize sorting
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sort, project_id } = req.query;
    const userId = req.user?.id;
    
    let query;
    let params: any[] = [];
    
    if (sort === 'auto') {
      // Auto-organize by urgency score
      query = `
        SELECT t.*, 
          CASE
            WHEN t.deadline IS NULL THEN 0
            WHEN t.deadline < NOW() THEN 
              CASE 
                WHEN t.severity = 'high' THEN 3
                WHEN t.severity = 'medium' THEN 2
                ELSE 1
              END
            ELSE
              CASE 
                WHEN t.severity = 'high' THEN 3
                WHEN t.severity = 'medium' THEN 2
                ELSE 1
              END / (EXTRACT(EPOCH FROM (t.deadline - NOW())) / 3600 + 1)
          END AS urgency_score
        FROM tasks t
        WHERE t.assigned_to = $1
      `;
      params = [userId];
      
      if (project_id) {
        query += ` AND t.project_id = $2`;
        params.push(project_id);
      }
      
      query += ` ORDER BY urgency_score DESC, t.created_at DESC`;
    } else {
      // Regular sorting
      query = `
        SELECT t.*
        FROM tasks t
        WHERE t.assigned_to = $1
      `;
      params = [userId];
      
      if (project_id) {
        query += ` AND t.project_id = $2`;
        params.push(project_id);
      }
      
      query += ` ORDER BY t.created_at DESC`;
    }
    
    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Other task-related endpoints...

export default router; 