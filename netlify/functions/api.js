const express = require('express');
const serverless = require('serverless-http');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: ['https://themis.netlify.app', 'https://pmo.projects.mod.qa'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API routes
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Projects
app.get('/.netlify/functions/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/.netlify/functions/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/.netlify/functions/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description, status, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, status, req.user.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authentication
app.post('/.netlify/functions/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, you would hash and verify the password
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // In production, you would compare hashed passwords
    // if (!comparePasswords(password, user.password)) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Export the serverless function
module.exports.handler = serverless(app); 