const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  uploadLeads,
  getLeadStats
} = require('../controllers/leadController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployeeOrAdmin,
  logActivity,
  sanitizeInput
} = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leads-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply input sanitization to all routes
router.use(sanitizeInput);

// @route   GET /api/leads
// @desc    Get all leads with pagination and filters
// @access  Admin or Employee (assigned leads)
router.get('/', authenticateToken, requireEmployeeOrAdmin, getAllLeads);

// @route   GET /api/leads/stats
// @desc    Get lead statistics
// @access  Admin
router.get('/stats', authenticateToken, requireAdmin, getLeadStats);

// @route   GET /api/leads/:id
// @desc    Get lead by ID
// @access  Admin or Employee (assigned lead)
router.get('/:id', authenticateToken, requireEmployeeOrAdmin, getLeadById);

// @route   POST /api/leads
// @desc    Create new lead
// @access  Admin
router.post('/', 
  authenticateToken, 
  requireAdmin,
  logActivity('lead_created', 'lead'),
  createLead
);

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Admin or Employee (assigned lead)
router.put('/:id', 
  authenticateToken, 
  requireEmployeeOrAdmin,
  logActivity('lead_updated', 'lead'),
  updateLead
);

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Admin
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  logActivity('lead_deleted', 'lead'),
  deleteLead
);

// @route   POST /api/leads/upload
// @desc    Upload leads from CSV
// @access  Admin
router.post('/upload', 
  authenticateToken, 
  requireAdmin,
  upload.single('csvFile'),
  logActivity('csv_uploaded', 'system'),
  uploadLeads
);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  
  if (error.message === 'Only CSV files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only CSV files are allowed'
    });
  }
  
  next(error);
});

module.exports = router; 