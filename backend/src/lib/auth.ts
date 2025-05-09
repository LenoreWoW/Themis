import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as db from './db';

// Define the user interface
interface User {
  id: string;
  email: string;
  role: string;
  department_id?: string;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to verify JWT authentication token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Verify the token
    jwt.verify(token, secret, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Get the user from the database
      const result = await db.query<User>(
        'SELECT id, email, role, department_id FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = result.rows[0];
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Check if the user has one of the required roles
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
}; 