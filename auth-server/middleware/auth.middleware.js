const passport = require('passport');

/**
 * Middleware to check if the user has the required roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} - Express middleware function
 */
exports.authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: info?.message || 'Authentication required'
        });
      }
      
      // Check if user is active
      if (!user.active) {
        return res.status(403).json({
          status: 'error',
          message: 'User account is inactive'
        });
      }
      
      // If no specific roles are required, just continue
      if (!allowedRoles.length) {
        req.user = user;
        return next();
      }
      
      // Check if user has any of the allowed roles
      const hasPermission = user.roles.some(role => allowedRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource'
        });
      }
      
      // User is authenticated and authorized
      req.user = user;
      next();
    })(req, res, next);
  };
}; 