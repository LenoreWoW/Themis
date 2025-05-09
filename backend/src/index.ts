import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import compression from 'compression';

// Import middleware and utilities
import './lib/db'; // Initialize DB connection

// Import route handlers
import {
  analyticsRoutes,
  callsRoutes,
  chatRoutes,
  documentsRoutes,
  availabilityRoutes,
  reportsRoutes,
  searchRoutes,
  notificationsRoutes,
  tutorialsRoutes
} from './routes';

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Configure middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());

// Ensure necessary directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const reportsDir = path.join(__dirname, '../reports');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Define API routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tutorials', tutorialsRoutes);

// Serve static files
app.use('/reports', express.static(reportsDir));
app.use('/uploads', express.static(uploadsDir));

// Define root route
app.get('/', (req, res) => {
  res.json({
    message: 'Themis API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`WebSocket connected to ${pathname}`);
  
  if (pathname.startsWith('/ws/chat')) {
    // Handle chat websocket connections
    const userId = url.searchParams.get('userId');
    if (!userId) {
      ws.close(1008, 'UserId is required');
      return;
    }
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast message to all clients in the same channel
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });
  } else if (pathname.startsWith('/ws/docs')) {
    // Handle document editing websocket connections
    const docId = url.searchParams.get('docId');
    const userId = url.searchParams.get('userId');
    
    if (!docId || !userId) {
      ws.close(1008, 'DocId and UserId are required');
      return;
    }
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast changes to all clients editing the same document
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const clientUrl = new URL(req.url || '', `http://${req.headers.host}`);
            const clientDocId = clientUrl.searchParams.get('docId');
            
            if (clientDocId === docId) {
              client.send(JSON.stringify(data));
            }
          }
        });
      } catch (err) {
        console.error('Error processing document change:', err);
      }
    });
  } else if (pathname.startsWith('/ws/calls/')) {
    // Handle video call signaling
    const roomId = pathname.split('/').pop();
    const userId = url.searchParams.get('userId');
    
    if (!roomId || !userId) {
      ws.close(1008, 'RoomId and UserId are required');
      return;
    }
    
    ws.on('message', (message) => {
      try {
        const signal = JSON.parse(message.toString());
        
        // Relay signaling data to other participants in the same room
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const clientUrl = new URL(req.url || '', `http://${req.headers.host}`);
            const clientRoomId = clientUrl.pathname.split('/').pop();
            
            if (clientRoomId === roomId) {
              client.send(JSON.stringify(signal));
            }
          }
        });
      } catch (err) {
        console.error('Error processing call signal:', err);
      }
    });
  }
  
  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize cron jobs for scheduled reports
  try {
    require('./jobs/reportCron');
    console.log('Report generation scheduler initialized');
  } catch (err) {
    console.error('Failed to initialize report scheduler:', err);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server; 