const connectToDatabase = require('../db');

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

    // Get days parameter
    const { days = 7 } = req.query;

    // Mock analytics data for now
    const analyticsData = {
      leadsOverTime: [],
      conversionRates: [],
      revenueData: [],
      topPerformers: []
    };

    // Generate mock data for the last N days
    const daysCount = parseInt(days);
    const today = new Date();
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      analyticsData.leadsOverTime.push({
        date: date.toISOString().split('T')[0],
        leads: Math.floor(Math.random() * 20) + 5,
        converted: Math.floor(Math.random() * 5) + 1
      });
      
      analyticsData.conversionRates.push({
        date: date.toISOString().split('T')[0],
        rate: Math.random() * 30 + 10 // 10-40% conversion rate
      });
      
      analyticsData.revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 10000 + 2000
      });
    }

    return res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Dashboard analytics API error:', {
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
