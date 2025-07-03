const connectToDatabase = require('./db');

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

    if (req.method === 'GET') {
      // Get query parameters
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '',
        type = '',
        assignedTo = ''
      } = req.query;

      // For now, return empty leads array since we don't have leads collection yet
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    if (req.method === 'POST') {
      // Mock lead creation for now
      const leadData = req.body;
      
      // Generate a mock lead ID
      const mockLead = {
        ...leadData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'new'
      };

      return res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: mockLead
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });

  } catch (error) {
    console.error('Leads API error:', {
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
