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

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Generate mock recent activities
    const recentActivities = [
      {
        id: 1,
        type: 'lead_created',
        title: 'New lead created',
        description: 'John Doe submitted a contact form',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        user: 'System',
        priority: 'medium'
      },
      {
        id: 2,
        type: 'lead_assigned',
        title: 'Lead assigned',
        description: 'Lead #123 assigned to Sarah Johnson',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        user: 'Admin',
        priority: 'high'
      },
      {
        id: 3,
        type: 'lead_updated',
        title: 'Lead status updated',
        description: 'Lead #122 moved to "In Progress"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: 'Mike Wilson',
        priority: 'low'
      },
      {
        id: 4,
        type: 'lead_converted',
        title: 'Lead converted',
        description: 'Lead #121 successfully converted to customer',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        user: 'Sarah Johnson',
        priority: 'high'
      },
      {
        id: 5,
        type: 'employee_added',
        title: 'New employee added',
        description: 'Emily Davis joined the team',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        user: 'HR Admin',
        priority: 'medium'
      }
    ];

    return res.status(200).json({
      success: true,
      data: recentActivities
    });

  } catch (error) {
    console.error('Dashboard activities API error:', {
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
