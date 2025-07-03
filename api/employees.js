const connectToDatabase = require('./db');
const User = require('./models/User');

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
    console.log('Database connected for employees API');

    if (req.method === 'GET') {
      // Get query parameters
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Build search query
      let searchQuery = {};
      if (search) {
        searchQuery = {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }

      // Calculate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Get total count for pagination
      const totalItems = await User.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalItems / limitNum);

      // Fetch employees
      const employees = await User.find(searchQuery)
        .select('-password') // Exclude password field
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
    }

    if (req.method === 'POST') {
      const { firstName, lastName, email, password, role = 'employee' } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Create new employee
      const newEmployee = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        status: 'active'
      });

      await newEmployee.save();

      // Return employee without password
      const { password: _, ...employeeData } = newEmployee.toObject();

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employeeData
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });

  } catch (error) {
    console.error('Employees API error:', {
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
