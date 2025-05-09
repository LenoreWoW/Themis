import express from 'express';
import { query } from '../lib/db';

const router: express.Router = express.Router();

/**
 * GET /api/search
 * Unified search across projects, tasks, documents, and reports
 */
router.get('/', async (req, res) => {
  try {
    const { q: searchQuery, limit = 20 } = req.query;
    
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    // Normalize search query
    const normalizedQuery = searchQuery.trim();
    
    // Create ts_query expression for full-text search
    const tsQuery = normalizedQuery
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => `${term}:*`)
      .join(' & ');
    
    // Fetch search results from multiple tables
    const [
      projectResults,
      taskResults,
      documentResults,
      reportResults
    ] = await Promise.all([
      searchProjects(tsQuery, Number(limit)),
      searchTasks(tsQuery, Number(limit)),
      searchDocuments(tsQuery, Number(limit)),
      searchReports(tsQuery, Number(limit))
    ]);
    
    // Combine results with their types and sort by rank
    const combinedResults = [
      ...projectResults.map(item => ({ type: 'project', ...item })),
      ...taskResults.map(item => ({ type: 'task', ...item })),
      ...documentResults.map(item => ({ type: 'document', ...item })),
      ...reportResults.map(item => ({ type: 'report', ...item }))
    ].sort((a, b) => (b.rank as number) - (a.rank as number))
     .slice(0, Number(limit));
    
    return res.json({
      query: normalizedQuery,
      results: combinedResults,
      counts: {
        projects: projectResults.length,
        tasks: taskResults.length,
        documents: documentResults.length,
        reports: reportResults.length,
        total: combinedResults.length
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return res.status(500).json({ error: 'Failed to perform search' });
  }
});

/**
 * Search projects table
 */
async function searchProjects(tsQuery: string, limit: number): Promise<any[]> {
  const result = await query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.status,
      p.start_date,
      p.end_date,
      p.department,
      u.full_name as project_manager,
      ts_rank(
        setweight(to_tsvector('english', p.name), 'A') ||
        setweight(to_tsvector('english', COALESCE(p.description, '')), 'B'),
        to_tsquery('english', $1)
      ) as rank
    FROM 
      projects p
    LEFT JOIN 
      users u ON p.project_manager_id = u.id
    WHERE
      to_tsvector('english', p.name) @@ to_tsquery('english', $1) OR
      to_tsvector('english', COALESCE(p.description, '')) @@ to_tsquery('english', $1)
    ORDER BY 
      rank DESC
    LIMIT $2`,
    [tsQuery, limit]
  );
  
  return result.rows;
}

/**
 * Search tasks table
 */
async function searchTasks(tsQuery: string, limit: number): Promise<any[]> {
  const result = await query(
    `SELECT 
      t.id,
      t.name,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      p.id as project_id,
      p.name as project_name,
      u.full_name as assigned_to,
      ts_rank(
        setweight(to_tsvector('english', t.name), 'A') ||
        setweight(to_tsvector('english', COALESCE(t.description, '')), 'B'),
        to_tsquery('english', $1)
      ) as rank
    FROM 
      tasks t
    LEFT JOIN 
      projects p ON t.project_id = p.id
    LEFT JOIN 
      users u ON t.assigned_to = u.id
    WHERE
      to_tsvector('english', t.name) @@ to_tsquery('english', $1) OR
      to_tsvector('english', COALESCE(t.description, '')) @@ to_tsquery('english', $1)
    ORDER BY 
      rank DESC
    LIMIT $2`,
    [tsQuery, limit]
  );
  
  return result.rows;
}

/**
 * Search documents table
 */
async function searchDocuments(tsQuery: string, limit: number): Promise<any[]> {
  const result = await query(
    `SELECT 
      d.id,
      d.title,
      d.project_id,
      p.name as project_name,
      u.full_name as owner_name,
      d.updated_at,
      ts_rank(
        setweight(to_tsvector('english', d.title), 'A') ||
        setweight(to_tsvector('english', COALESCE(d.content, '')), 'B'),
        to_tsquery('english', $1)
      ) as rank
    FROM 
      documents d
    LEFT JOIN 
      projects p ON d.project_id = p.id
    LEFT JOIN 
      users u ON d.owner_id = u.id
    WHERE
      to_tsvector('english', d.title) @@ to_tsquery('english', $1) OR
      to_tsvector('english', COALESCE(d.content, '')) @@ to_tsquery('english', $1)
    ORDER BY 
      rank DESC
    LIMIT $2`,
    [tsQuery, limit]
  );
  
  return result.rows;
}

/**
 * Search reports table
 */
async function searchReports(tsQuery: string, limit: number): Promise<any[]> {
  const result = await query(
    `SELECT 
      r.id,
      r.name,
      r.description,
      r.is_template,
      u.full_name as owner_name,
      r.updated_at,
      ts_rank(
        setweight(to_tsvector('english', r.name), 'A') ||
        setweight(to_tsvector('english', COALESCE(r.description, '')), 'B'),
        to_tsquery('english', $1)
      ) as rank
    FROM 
      reports r
    LEFT JOIN 
      users u ON r.owner_id = u.id
    WHERE
      to_tsvector('english', r.name) @@ to_tsquery('english', $1) OR
      to_tsvector('english', COALESCE(r.description, '')) @@ to_tsquery('english', $1)
    ORDER BY 
      rank DESC
    LIMIT $2`,
    [tsQuery, limit]
  );
  
  return result.rows;
}

export default router; 