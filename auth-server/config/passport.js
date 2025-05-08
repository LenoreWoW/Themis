const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

/**
 * Configure Passport authentication strategies
 * @param {Object} passport - Passport instance
 */
exports.configurePassport = (passport) => {
  // Local Strategy (username/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ 
            where: { email: email.toLowerCase() } 
          });
          
          // User not found
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          // Check if first login (password change required)
          if (user.forcePasswordChange) {
            return done(null, user, { message: 'Password change required' });
          }
          
          // Authentication successful
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-jwt-secret-key'
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await User.findByPk(payload.id, {
          attributes: { exclude: ['password'] }
        });
        
        if (!user) {
          return done(null, false);
        }
        
        // Check if token was issued before password change
        if (user.passwordChangedAt && 
            user.passwordChangedAt.getTime() > payload.iat * 1000) {
          return done(null, false, { message: 'Please log in again' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
}; 