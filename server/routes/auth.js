const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  loginEmployee,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  signupUser
} = require('../controllers/authController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployeeOrAdmin,
  sanitizeInput,
  rateLimit
} = require('../middleware/auth');

// Apply rate limiting to all auth routes
router.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Apply input sanitization to all routes
router.use(sanitizeInput);

// @route   POST /api/auth/login
// @desc    Login employee
// @access  Public
router.post('/login', loginEmployee);

// @route   POST /api/auth/signup
// @desc    Public signup for new users
// @access  Public
router.post('/signup', signupUser);

// @route   POST /api/auth/register
// @desc    Register new employee (Admin only)
// @access  Admin
router.post('/register', authenticateToken, requireAdmin, registerEmployee);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', authenticateToken, requireEmployeeOrAdmin, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', authenticateToken, requireEmployeeOrAdmin, changePassword);

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, requireEmployeeOrAdmin, logout);

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;