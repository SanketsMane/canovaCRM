const connectToDatabase = require('./db');
const User = require('./models/User');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed - Use POST to create test user'
    });
  }

  try {
    await connectToDatabase();
    console.log('Database connected for setup');

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log('Existing user count:', userCount);

    if (userCount > 0) {
      const users = await User.find({}, 'firstName lastName email role status').limit(5);
      return res.status(200).json({
        success: true,
        message: `Found ${userCount} existing users`,
        users: users.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.status
        }))
      });
    }

    // Create a test admin user if no users exist
    const testUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@canova.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    await testUser.save();
    console.log('Test user created successfully');

    return res.status(201).json({
      success: true,
      message: 'Test admin user created successfully',
      user: {
        email: 'admin@canova.com',
        password: 'admin123',
        role: 'admin',
        note: 'You can now login with these credentials'
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during setup',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
