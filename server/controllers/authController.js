const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @desc    Register new employee (Admin only)
// @route   POST /api/auth/register
// @access  Admin
const registerEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      location,
      preferredLanguage,
      phone,
      department,
      role = 'employee'
    } = req.body;

    // Check if user already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Create new employee
    const employee = new Employee({
      firstName,
      lastName,
      email,
      password,
      location,
      preferredLanguage,
      phone,
      department,
      role
    });

    await employee.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      action: 'employee_created',
      entityType: 'employee',
      entityId: employee._id,
      description: `${req.user.fullName} created new employee ${employee.fullName}`,
      details: { role, department }
    });

    // Return employee data without password
    const employeeData = employee.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: employeeData
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Log activity
    await Activity.logActivity({
      user: user._id,
      action: 'login',
      entityType: 'auth',
      description: `${user.fullName} logged in`,
      details: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Return user data and token
    const userData = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Since req.user is already set by authenticateToken middleware and contains the user data
    // we can directly return it, but let's fetch fresh data to ensure we have the latest
    const user = await User.findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if there's an associated employee record
    const employee = await Employee.findOne({ userId: user._id })
      .select('-password')
      .populate('assignedLeads', 'name email company status type');

    // Return user data with employee info if available
    const profileData = {
      ...user.toObject(),
      employeeProfile: employee || null
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      location,
      preferredLanguage,
      phone,
      department
    } = req.body;

    // Find and update user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (location) user.location = location;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (phone) user.phone = phone;
    if (department) user.department = department;

    await user.save();

    // Log activity
    await Activity.logActivity({
      user: user._id,
      action: 'user_updated',
      entityType: 'user',
      entityId: user._id,
      description: `${user.fullName} updated their profile`
    });

    const userData = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find employee
    const employee = await Employee.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await employee.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    employee.password = newPassword;
    await employee.save();

    // Log activity
    await Activity.logActivity({
      user: employee._id,
      action: 'password_changed',
      entityType: 'auth',
      description: `${employee.fullName} changed their password`
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// @desc    Logout (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      action: 'logout',
      entityType: 'auth',
      description: `${req.user.fullName} logged out`,
      details: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Verify token validity
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

// @desc    Public signup for new users
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      location,
      phone,
      department,
      role
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Ensure only valid roles
    const userRole = (role === 'admin' || role === 'manager' || role === 'employee') ? role : 'employee';

    // Create new user with default values
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      location: location || 'Not specified',
      preferredLanguage: 'English',
      phone: phone || '',
      department: department || 'General',
      role: userRole,
      status: 'active'
    });

    await user.save();

    // Log activity for signup
    await Activity.logActivity({
      user: user._id,
      action: 'user_created',
      entityType: 'auth',
      description: `${user.fullName} signed up as ${userRole}`,
      details: { role: userRole, department: user.department }
    });

    // Generate token for immediate login
    const token = generateToken(user._id);

    // Return user data without password
    const userData = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
};

module.exports = {
  registerEmployee,
  loginEmployee,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  signupUser
};