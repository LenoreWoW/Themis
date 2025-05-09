import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { authenticateToken, checkRole } from '../lib/auth';

const router: Router = Router();

/**
 * GET /api/projects/gantt-data
 * Get projects data formatted for Gantt chart display
 * Filters projects based on user role:
 * - PMs: only their owned projects
 * - Sub-PMOs/Directors: only their department projects
 * - Executives/Admins: all projects
 */
router.get('/gantt-data', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.start_date, 
        p.end_date, 
        p.department_id, 
        p.owner_id,
        p.status,
        d.name as department_name,
        u.full_name as owner_name
      FROM 
        projects p
      LEFT JOIN 
        departments d ON p.department_id = d.id
      LEFT JOIN 
        users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    // Apply role-based filtering
    if (user.role === 'pm') {
      // PMs can only see their own projects
      query += ` AND p.owner_id = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    } else if (user.role === 'sub_pmo' || user.role === 'director') {
      // Sub-PMOs and Directors can see projects in their department
      if (user.department) {
        query += ` AND p.department_id = $${paramIndex}`;
        params.push(user.department);
        paramIndex++;
      }
    }
    // Executives and Admins can see all projects, no additional filter needed
    
    // Add order by clause
    query += ` ORDER BY p.start_date, p.name`;
    
    const result = await db.query(query, params);
    
    // Transform for Gantt chart
    const ganttData = result.rows.map((project: any) => {
      return {
        id: project.id,
        name: project.name,
        start: project.start_date,
        end: project.end_date || null,
        departmentId: project.department_id,
        departmentName: project.department_name,
        ownerId: project.owner_id,
        ownerName: project.owner_name,
        status: project.status,
        progress: project.progress || 0,
        color: getColorByDepartment(project.department_id)
      };
    });
    
    return res.json(ganttData);
  } catch (error) {
    console.error('Error fetching Gantt data:', error);
    return res.status(500).json({ error: 'Failed to fetch Gantt data' });
  }
});

/**
 * GET /api/projects/gantt-data/:id/meetings
 * Get meetings associated with a specific project for Gantt chart overlay
 */
router.get('/gantt-data/:id/meetings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        id, 
        title, 
        start_time, 
        end_time, 
        meeting_link,
        created_by
      FROM 
        meetings
      WHERE 
        project_id = $1
      ORDER BY 
        start_time
    `, [id]);
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project meetings:', error);
    return res.status(500).json({ error: 'Failed to fetch project meetings' });
  }
});

/**
 * Helper function to assign colors based on department ID
 * This provides consistent coloring in the Gantt chart
 */
function getColorByDepartment(departmentId: string): string {
  // Map of department IDs to colors
  // In a real implementation, this could be stored in the database or config
  const colorMap: Record<string, string> = {
    // Example color mapping - should be replaced with real departmentIds
    'dept-1': '#4caf50', // Green
    'dept-2': '#2196f3', // Blue
    'dept-3': '#ff9800', // Orange
    'dept-4': '#9c27b0', // Purple
    'dept-5': '#e91e63', // Pink
  };
  
  return colorMap[departmentId] || '#607d8b'; // Default to grey if department not found
}

// Other project-related endpoints...

export default router; 