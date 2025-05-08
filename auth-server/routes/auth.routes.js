const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user.model');
const { authMiddleware } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET || 'your-jwt-secret-key',
    { expiresIn: process.env.TOKEN_EXPIRY || '1d' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

/**
 * @route POST /auth/login
 * @desc Authenticate user and get tokens
 * @access Public
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: info?.message || 'Authentication failed' 
      });
    }
    
    // Check if password change is required
    if (user.forcePasswordChange) {
      return res.status(200).json({
        status: 'success',
        message: 'Password change required',
        forcePasswordChange: true,
        token: generateToken(user),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
          department: user.department
        }
      });
    }
    
    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        department: user.department
      }
    });
  })(req, res, next);
});

/**
 * @route POST /auth/register
 * @desc Register a new user (Admin only)
 * @access Private/Admin
 */
router.post('/register', authMiddleware(['ADMIN', 'MAIN_PMO']), async (req, res) => {
  try {
    const { email, password, firstName, lastName, roles, department } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        email: email.toLowerCase() 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      roles,
      department,
      forcePasswordChange: true // Force password change on first login
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        roles: newUser.roles,
        department: newUser.department
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret'
    );
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new access token
    const newToken = generateToken(user);
    
    return res.status(200).json({
      status: 'success',
      token: newToken
    });
  } catch (error) {
    // Token verification failed
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
});

/**
 * @route GET /auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({
    status: 'success',
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      roles: req.user.roles,
      department: req.user.department
    }
  });
});

/**
 * @route PUT /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    // Validate current password (not needed for first login with forcePasswordChange=true)
    if (!user.forcePasswordChange) {
      const isMatch = await user.checkPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }
    }
    
    // Update password
    user.password = newPassword;
    user.forcePasswordChange = false;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 