const connectToDatabase = require('../db');
const User = require('../models/User');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Get employee ID from query parameter
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    if (req.method === 'GET') {
      // Get single employee by ID
      const employee = await User.findById(id).select('-password');
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: employee
      });
    }

    if (req.method === 'PUT') {
      // Update employee
      const { firstName, lastName, email, role, status } = req.body;

      // Find employee
      const employee = await User.findById(id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== employee.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Update fields
      if (firstName) employee.firstName = firstName;
      if (lastName) employee.lastName = lastName;
      if (email) employee.email = email;
      if (role) employee.role = role;
      if (status) employee.status = status;

      await employee.save();

      // Return updated employee without password
      const { password: _, ...employeeData } = employee.toObject();

      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employeeData
      });
    }

    if (req.method === 'DELETE') {
      // Delete employee
      const employee = await User.findById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      await User.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });

  } catch (error) {
    console.error('Employee API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
