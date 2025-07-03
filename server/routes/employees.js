const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getEmployeeLeads
} = require('../controllers/employeeController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployeeOrAdmin,
  logActivity,
  sanitizeInput
} = require('../middleware/auth');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// @route   GET /api/employees
// @desc    Get all employees with pagination and search
// @access  Admin
router.get('/', authenticateToken, requireAdmin, getAllEmployees);

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Admin or Employee (own profile)
router.get('/:id', authenticateToken, requireEmployeeOrAdmin, getEmployeeById);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Admin
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  logActivity('employee_created', 'employee'),
  createEmployee
);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Admin or Employee (own profile)
router.put('/:id', 
  authenticateToken, 
  requireEmployeeOrAdmin,
  logActivity('employee_updated', 'employee'),
  updateEmployee
);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Admin
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  logActivity('employee_deleted', 'employee'),
  deleteEmployee
);

// @route   GET /api/employees/:id/stats
// @desc    Get employee statistics
// @access  Admin or Employee (own stats)
router.get('/:id/stats', authenticateToken, requireEmployeeOrAdmin, getEmployeeStats);

// @route   GET /api/employees/:id/leads
// @desc    Get employee leads
// @access  Admin or Employee (own leads)
router.get('/:id/leads', authenticateToken, requireEmployeeOrAdmin, getEmployeeLeads);

module.exports = router; 