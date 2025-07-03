const connectToDatabase = require('./db');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let dbStatus = 'Not tested';
  let dbError = null;

  try {
    // Test database connection
    await connectToDatabase();
    dbStatus = 'Connected successfully';
    console.log('Database connection test passed');
  } catch (error) {
    dbStatus = 'Connection failed';
    dbError = error.message;
    console.error('Database connection test failed:', error);
  }
    
  return res.status(200).json({
    success: true,
    message: 'CRM API is working',
    method: req.method,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError
    },
    environment: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
