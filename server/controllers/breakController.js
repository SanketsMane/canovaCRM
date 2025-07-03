const Break = require('../models/Break');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Start a break
// @route   POST /api/breaks/start
// @access  Employee
const startBreak = async (req, res) => {
  try {
    const { reason = 'Regular break' } = req.body;
    const userId = req.user._id;
    
    // Get or create employee data for the user
    let employee = await Employee.findOne({ userId: userId });
    if (!employee) {
      // Check if an employee with this email already exists
      const user = await User.findById(userId);
      const existingEmployee = await Employee.findOne({ email: user.email });
      
      if (existingEmployee) {
        // Link the existing employee to this user
        existingEmployee.userId = user._id;
        employee = await existingEmployee.save();
      } else {
        // Create a new employee record
        try {
          employee = new Employee({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userId: user._id,
            role: user.role,
            status: 'active'
          });
          await employee.save();
        } catch (createError) {
          // If there's still a duplicate key error, try to find and link existing employee
          if (createError.code === 11000) {
            const existingEmp = await Employee.findOne({ email: user.email });
            if (existingEmp) {
              existingEmp.userId = user._id;
              employee = await existingEmp.save();
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }
    }
    
    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Start the break
    const breakRecord = await Break.startBreak(
      userId, 
      employee._id, 
      reason, 
      ipAddress, 
      userAgent
    );
    
    // Log activity
    await Activity.logActivity({
      user: userId,
      action: 'break_started',
      entityType: 'break',
      entityId: breakRecord._id,
      description: `Break started at ${breakRecord.formattedStartTime}`,
      details: {
        reason: reason,
        startTime: breakRecord.breakStartTime,
        date: breakRecord.date
      },
      ipAddress,
      userAgent,
      severity: 'low'
    });
    
    res.status(201).json({
      success: true,
      message: 'Break started successfully',
      data: {
        breakId: breakRecord._id,
        startTime: breakRecord.formattedStartTime,
        date: breakRecord.date,
        status: breakRecord.status
      }
    });
    
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start break'
    });
  }
};

// @desc    End a break
// @route   POST /api/breaks/end
// @access  Employee
const endBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // End the break
    const breakRecord = await Break.endBreak(userId);
    
    // Log activity
    await Activity.logActivity({
      user: userId,
      action: 'break_ended',
      entityType: 'break',
      entityId: breakRecord._id,
      description: `Break ended at ${breakRecord.formattedEndTime} (Duration: ${breakRecord.formattedDuration})`,
      details: {
        startTime: breakRecord.breakStartTime,
        endTime: breakRecord.breakEndTime,
        duration: breakRecord.duration,
        date: breakRecord.date
      },
      ipAddress,
      userAgent,
      severity: 'low'
    });
    
    res.status(200).json({
      success: true,
      message: 'Break ended successfully',
      data: {
        breakId: breakRecord._id,
        startTime: breakRecord.formattedStartTime,
        endTime: breakRecord.formattedEndTime,
        duration: breakRecord.formattedDuration,
        date: breakRecord.date,
        status: breakRecord.status
      }
    });
    
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to end break'
    });
  }
};

// @desc    Get user's breaks
// @route   GET /api/breaks
// @access  Employee
const getUserBreaks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, dateFrom, dateTo } = req.query;
    
    const breaks = await Break.getBreaksByUser(
      userId, 
      parseInt(limit), 
      dateFrom, 
      dateTo
    );
    
    res.status(200).json({
      success: true,
      count: breaks.length,
      data: breaks.map(breakRecord => ({
        id: breakRecord._id,
        date: breakRecord.date,
        startTime: breakRecord.formattedStartTime,
        endTime: breakRecord.formattedEndTime,
        duration: breakRecord.formattedDuration,
        status: breakRecord.status,
        reason: breakRecord.reason,
        createdAt: breakRecord.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching breaks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breaks'
    });
  }
};

// @desc    Get today's breaks for user
// @route   GET /api/breaks/today
// @access  Employee
const getTodaysBreaks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const breaks = await Break.getTodaysBreaks(userId);
    
    res.status(200).json({
      success: true,
      count: breaks.length,
      data: breaks.map(breakRecord => ({
        id: breakRecord._id,
        date: breakRecord.date,
        startTime: breakRecord.formattedStartTime,
        endTime: breakRecord.formattedEndTime,
        duration: breakRecord.formattedDuration,
        status: breakRecord.status,
        reason: breakRecord.reason,
        createdAt: breakRecord.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching today\'s breaks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s breaks'
    });
  }
};

// @desc    Get break statistics
// @route   GET /api/breaks/stats
// @access  Employee
const getBreakStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;
    
    const stats = await Break.getBreakStats(userId, parseInt(days));
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching break stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch break statistics'
    });
  }
};

// @desc    Get current active break
// @route   GET /api/breaks/active
// @access  Employee
const getActiveBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activeBreak = await Break.findOne({
      user: userId,
      status: 'active'
    }).populate('employee', 'firstName lastName employeeId');
    
    if (!activeBreak) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active break found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: activeBreak._id,
        date: activeBreak.date,
        startTime: activeBreak.formattedStartTime,
        status: activeBreak.status,
        reason: activeBreak.reason,
        createdAt: activeBreak.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching active break:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active break'
    });
  }
};

module.exports = {
  startBreak,
  endBreak,
  getUserBreaks,
  getTodaysBreaks,
  getBreakStats,
  getActiveBreak
};
