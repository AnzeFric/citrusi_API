/*
 * authMiddleware.js
 */

const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = process.env.JWT_SECRET || 'work hard';

// Middleware function for authentication
const authMiddleware = (req, res, next) => {
  // Check if the request path is for authentication or registration
  if (req.path === '/users/login' || req.path === '/users/register'
    || req.path === '/users/loginMobile' || req.path === '/routes/list'
    || req.path.startsWith('/users/loginDesktop') || req.path === '/users/logout'
    || req.path === '/routes/list-paginated' || req.path === '/routes/in-proximity'
    || req.path.startsWith('/uploads/') || req.path.startsWith('/notifications/')
    || req.path.startsWith('/users/stats') || req.path.startsWith('/users/friends')
    || req.path.startsWith('/users/verified-login')
    || req.path.startsWith('/users/add-friend') || req.path.startsWith('/users/confirm2fa')
    || req.path === '/routes/get-route') {
    // Allow access to authentication and registration routes
    return next();
  }

  // Check if the user is already authenticated
  if (req.isAuthenticated) {
    // User is authenticated, allow access
    return next();
  }

  // Check if the session has a userId
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized', path: req.path });
  }

  // Verify the session
  try {
    const payload = jwt.verify(req.session.userId, secretKey);
    req.user = payload;
    req.isAuthenticated = true; // Set the authenticated flag
    return next();

  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
