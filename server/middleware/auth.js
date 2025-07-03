const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user is employee or admin
const requireEmployeeOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!['admin', 'employee'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Employee or admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Employee/Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to log activity
const logActivity = (action, entityType = 'system') => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Restore original send
      res.send = originalSend;
      
      // Log activity if request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const activityData = {
            user: req.user?._id,
            action: action,
            entityType: entityType,
            entityId: req.params.id || req.body.id,
            description: `${req.user?.fullName || 'System'} performed ${action}`,
            details: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip || req.connection.remoteAddress
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          };

          Activity.logActivity(activityData).catch(err => {
            console.error('Activity logging error:', err);
          });
        } catch (error) {
          console.error('Activity logging error:', error);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to rate limit requests
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (requests.has(key)) {
      requests.set(key, requests.get(key).filter(timestamp => timestamp > windowStart));
    }
    
    const currentRequests = requests.get(key) || [];
    
    if (currentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    currentRequests.push(now);
    requests.set(key, currentRequests);
    
    next();
  };
};

// Middleware to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Middleware to sanitize input
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEmployeeOrAdmin,
  logActivity,
  rateLimit,
  validateRequest,
  sanitizeInput
}; 