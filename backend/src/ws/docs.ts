import { WebSocket, RawData } from 'ws';
import http from 'http';
import { parse } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { query, update } from '../lib/db';

// Document sessions - map of document ID to connected clients
const documents = new Map<string, {
  clients: Map<string, WebSocket>,  // clientId -> socket
  content: string,
  version: number,
  lastModified: Date
}>();

// Map of WebSocket connection -> { documentId, clientId }
const connections = new Map<WebSocket, { documentId: string, clientId: string }>();

/**
 * Handle WebSocket connection for document editing
 */
export function setupDocumentWebSocket(ws: WebSocket, req: http.IncomingMessage): void {
  const url = parse(req.url || '', true);
  const documentId = url.query.docId as string;
  const userId = url.query.userId as string;
  
  if (!documentId || !userId) {
    console.error('Missing required parameters for document editing');
    ws.close(1008, 'Missing required parameters');
    return;
  }
  
  const clientId = `${userId}-${uuidv4().substring(0, 8)}`;
  
  // Load document if not already in memory
  initializeDocument(documentId, clientId, ws);
  
  // Set up message handling
  ws.on('message', (data: RawData) => {
    try {
      const message = JSON.parse(data.toString());
      handleDocumentMessage(ws, message);
    } catch (error) {
      console.error('Error processing document message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    handleDisconnect(ws);
  });
}

/**
 * Initialize a document session
 */
async function initializeDocument(documentId: string, clientId: string, ws: WebSocket): Promise<void> {
  // Store connection info
  connections.set(ws, { documentId, clientId });
  
  // Check if document is already loaded
  let doc = documents.get(documentId);
  
  if (!doc) {
    // Load document from database
    try {
      const result = await query(
        'SELECT id, title, content, version, updated_at FROM documents WHERE id = $1',
        [documentId]
      );
      
      if (result.rows.length === 0) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Document not found'
        }));
        ws.close();
        return;
      }
      
      const dbDoc = result.rows[0];
      
      // Initialize document session
      doc = {
        clients: new Map(),
        content: dbDoc.content || '',
        version: dbDoc.version || 1,
        lastModified: dbDoc.updated_at
      };
      
      documents.set(documentId, doc);
      console.log(`Document ${documentId} loaded into memory`);
    } catch (error) {
      console.error(`Error loading document ${documentId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to load document'
      }));
      ws.close();
      return;
    }
  }
  
  // Add client to document
  doc.clients.set(clientId, ws);
  
  // Send initial document state
  ws.send(JSON.stringify({
    type: 'init',
    documentId,
    content: doc.content,
    version: doc.version,
    clients: Array.from(doc.clients.keys()).filter(id => id !== clientId)
  }));
  
  // Notify other clients
  broadcastToDocument(documentId, {
    type: 'client_joined',
    clientId
  }, clientId);
  
  console.log(`Client ${clientId} joined document ${documentId}`);
}

/**
 * Handle document-related messages
 */
function handleDocumentMessage(ws: WebSocket, message: any): void {
  const connection = connections.get(ws);
  if (!connection) return;
  
  const { documentId, clientId } = connection;
  const doc = documents.get(documentId);
  if (!doc) return;
  
  switch (message.type) {
    case 'change':
      handleDocumentChange(doc, documentId, clientId, message);
      break;
      
    case 'cursor':
      handleCursorUpdate(documentId, clientId, message);
      break;
      
    case 'save':
      handleDocumentSave(doc, documentId, clientId);
      break;
      
    default:
      console.warn(`Unknown document message type: ${message.type}`);
  }
}

/**
 * Handle document content changes
 */
function handleDocumentChange(
  doc: { content: string, version: number, lastModified: Date },
  documentId: string,
  clientId: string,
  message: any
): void {
  // Apply changes to document content
  if (message.operations && Array.isArray(message.operations)) {
    // Implement a simple transform function here
    // For a real-world app, you would use a more robust OT library
    applyChanges(doc, message.operations);
    
    // Increment version
    doc.version++;
    doc.lastModified = new Date();
    
    // Broadcast change to other clients
    broadcastToDocument(documentId, {
      type: 'change',
      clientId,
      operations: message.operations,
      version: doc.version
    }, clientId);
    
    // Schedule auto-save
    scheduleAutoSave(documentId);
  }
}

/**
 * Handle cursor position updates
 */
function handleCursorUpdate(documentId: string, clientId: string, message: any): void {
  const { position } = message;
  
  // Broadcast cursor position to other clients
  broadcastToDocument(documentId, {
    type: 'cursor',
    clientId,
    position
  }, clientId);
}

/**
 * Handle explicit document save request
 */
async function handleDocumentSave(
  doc: { content: string, version: number, lastModified: Date },
  documentId: string,
  clientId: string
): Promise<void> {
  try {
    await saveDocumentToDatabase(documentId, doc.content, doc.version);
    
    // Notify all clients document was saved
    broadcastToDocument(documentId, {
      type: 'saved',
      clientId,
      version: doc.version,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Document ${documentId} saved by client ${clientId}`);
  } catch (error) {
    console.error(`Error saving document ${documentId}:`, error);
    
    // Notify client of save error
    const doc = documents.get(documentId);
    const client = doc?.clients.get(clientId);
    if (client) {
      client.send(JSON.stringify({
        type: 'error',
        message: 'Failed to save document'
      }));
    }
  }
}

/**
 * Schedule an automatic save after changes
 */
const autoSaveTimers = new Map<string, NodeJS.Timeout>();

function scheduleAutoSave(documentId: string): void {
  // Clear existing timer
  const existingTimer = autoSaveTimers.get(documentId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  // Set new timer - auto-save after 2 seconds of inactivity
  const timer = setTimeout(async () => {
    const doc = documents.get(documentId);
    if (doc) {
      try {
        await saveDocumentToDatabase(documentId, doc.content, doc.version);
        console.log(`Auto-saved document ${documentId}`);
        
        // Notify all clients
        broadcastToDocument(documentId, {
          type: 'auto_saved',
          version: doc.version,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error auto-saving document ${documentId}:`, error);
      }
    }
    autoSaveTimers.delete(documentId);
  }, 2000);
  
  autoSaveTimers.set(documentId, timer);
}

/**
 * Save document to database
 */
async function saveDocumentToDatabase(documentId: string, content: string, version: number): Promise<void> {
  await update(
    'documents',
    { id: documentId },
    {
      content,
      version,
      updated_at: new Date()
    }
  );
}

/**
 * Handle client disconnection
 */
function handleDisconnect(ws: WebSocket): void {
  const connection = connections.get(ws);
  if (!connection) return;
  
  const { documentId, clientId } = connection;
  
  // Remove from document clients
  const doc = documents.get(documentId);
  if (doc) {
    doc.clients.delete(clientId);
    
    // Notify other clients
    broadcastToDocument(documentId, {
      type: 'client_left',
      clientId
    });
    
    console.log(`Client ${clientId} left document ${documentId}`);
    
    // If no clients left, save document and cleanup
    if (doc.clients.size === 0) {
      saveAndCleanupDocument(documentId, doc);
    }
  }
  
  // Remove connection
  connections.delete(ws);
}

/**
 * Save document and cleanup memory when all clients are gone
 */
async function saveAndCleanupDocument(
  documentId: string,
  doc: { content: string, version: number }
): Promise<void> {
  try {
    // Final save
    await saveDocumentToDatabase(documentId, doc.content, doc.version);
    
    // Clear auto-save timer
    const timer = autoSaveTimers.get(documentId);
    if (timer) {
      clearTimeout(timer);
      autoSaveTimers.delete(documentId);
    }
    
    // Remove from memory
    documents.delete(documentId);
    console.log(`Document ${documentId} saved and unloaded from memory`);
  } catch (error) {
    console.error(`Error saving document ${documentId} during cleanup:`, error);
  }
}

/**
 * Broadcast message to all clients in a document
 */
function broadcastToDocument(documentId: string, message: any, excludeClientId?: string): void {
  const doc = documents.get(documentId);
  if (!doc) return;
  
  const messageStr = JSON.stringify(message);
  
  doc.clients.forEach((ws, clientId) => {
    if (clientId !== excludeClientId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Apply operations to document content
 * This is a very simple implementation; a real OT implementation would be more robust
 */
function applyChanges(doc: { content: string }, operations: any[]): void {
  for (const op of operations) {
    if (op.type === 'insert') {
      doc.content = 
        doc.content.substring(0, op.position) + 
        op.text + 
        doc.content.substring(op.position);
    } else if (op.type === 'delete') {
      doc.content = 
        doc.content.substring(0, op.position) + 
        doc.content.substring(op.position + op.length);
    } else if (op.type === 'replace') {
      doc.content = 
        doc.content.substring(0, op.position) + 
        op.text + 
        doc.content.substring(op.position + op.length);
    }
  }
} 