const express = require('express');
const router = express.Router();
const {
  startBreak,
  endBreak,
  getUserBreaks,
  getTodaysBreaks,
  getBreakStats,
  getActiveBreak
} = require('../controllers/breakController');
const {
  authenticateToken,
  sanitizeInput
} = require('../middleware/auth');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// @route   POST /api/breaks/start
// @desc    Start a break
// @access  Employee
router.post('/start', authenticateToken, startBreak);

// @route   POST /api/breaks/end
// @desc    End current active break
// @access  Employee
router.post('/end', authenticateToken, endBreak);

// @route   GET /api/breaks/active
// @desc    Get current active break
// @access  Employee
router.get('/active', authenticateToken, getActiveBreak);

// @route   GET /api/breaks/today
// @desc    Get today's breaks for user
// @access  Employee
router.get('/today', authenticateToken, getTodaysBreaks);

// @route   GET /api/breaks/stats
// @desc    Get break statistics
// @access  Employee
router.get('/stats', authenticateToken, getBreakStats);

// @route   GET /api/breaks
// @desc    Get user's breaks with optional date range
// @access  Employee
router.get('/', authenticateToken, getUserBreaks);

module.exports = router;
