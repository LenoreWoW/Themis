import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../lib/db';

const router: express.Router = express.Router();

/**
 * @route GET /api/documents
 * @desc Get list of documents with optional filtering
 */
router.get('/', async (req, res) => {
  const userId = req.query.userId as string;
  const projectId = req.query.projectId as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  try {
    let queryText = `
      SELECT d.*, u.full_name as created_by_name
      FROM documents d
      JOIN users u ON d.created_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (userId) {
      queryText += ' AND d.created_by = $' + (params.length + 1);
      params.push(userId);
    }
    
    if (projectId) {
      queryText += ' AND d.project_id = $' + (params.length + 1);
      params.push(projectId);
    }
    
    queryText += ` ORDER BY d.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query<Document & { created_by_name: string }>(queryText, params);
    
    const countResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) FROM documents WHERE 1=1' + 
      (userId ? ' AND created_by = $1' : '') +
      (projectId ? (userId ? ' AND project_id = $2' : ' AND project_id = $1') : ''),
      params.slice(0, userId && projectId ? 2 : userId || projectId ? 1 : 0)
    );
    
    return res.json({
      documents: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * @route GET /api/documents/:id
 * @desc Get document by ID
 */
router.get('/:id', async (req, res) => {
  const documentId = req.params.id;
  
  try {
    const result = await db.query<Document>(
      `SELECT d.*, u.full_name as created_by_name
       FROM documents d
       JOIN users u ON d.created_by = u.id
       WHERE d.id = $1`,
      [documentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * @route POST /api/documents
 * @desc Create a new document
 */
router.post('/', async (req, res) => {
  const { title, content, projectId, createdBy } = req.body;
  
  if (!title || !createdBy) {
    return res.status(400).json({ error: 'Title and creator ID are required' });
  }
  
  try {
    const document: Partial<Document> = {
      id: uuidv4(),
      title,
      content: content || '',
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date(),
      version: 1
    };
    
    if (projectId) {
      Object.assign(document, { project_id: projectId });
    }
    
    const result = await db.insert<Document>('documents', document);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * @route PUT /api/documents/:id
 * @desc Update an existing document
 */
router.put('/:id', async (req, res) => {
  const documentId = req.params.id;
  const { title, content } = req.body;
  
  try {
    // Get current version
    const versionResult = await db.query<Document>(
      'SELECT version FROM documents WHERE id = $1',
      [documentId]
    );
    
    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const currentVersion = versionResult.rows[0].version;
    
    const updates: Partial<Document> = {
      updated_at: new Date(),
      version: currentVersion + 1
    };
    
    if (title !== undefined) {
      updates.title = title;
    }
    
    if (content !== undefined) {
      updates.content = content;
    }
    
    const result = await db.update<Document>(
      'documents',
      updates,
      { id: documentId }
    );
    
    return res.json(result[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Failed to update document' });
  }
});

/**
 * @route DELETE /api/documents/:id
 * @desc Delete a document
 */
router.delete('/:id', async (req, res) => {
  const documentId = req.params.id;
  
  try {
    const result = await db.remove<Document>(
      'documents',
      { id: documentId }
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router; 