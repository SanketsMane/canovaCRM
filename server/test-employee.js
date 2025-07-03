const mongoose = require('mongoose');
require('dotenv').config();

const testEmployeeCreation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    const Employee = require('./models/Employee');

    // Test employee data
    const testEmployee = {
      firstName: 'Test',
      lastName: 'Employee',
      email: 'test.employee@canovacrm.com',
      password: 'password123',
      location: 'Test City',
      preferredLanguage: 'English',
      phone: '+15550199',
      department: 'Testing',
      role: 'employee'
    };

    console.log('📝 Creating test employee...');
    
    // Check if employee already exists
    const existing = await Employee.findOne({ email: testEmployee.email });
    if (existing) {
      console.log('🗑️ Removing existing test employee...');
      await Employee.deleteOne({ email: testEmployee.email });
    }

    // Create new employee
    const employee = new Employee(testEmployee);
    const savedEmployee = await employee.save();
    
    console.log('✅ Employee created successfully!');
    console.log('Employee data:', {
      id: savedEmployee._id,
      name: savedEmployee.fullName,
      email: savedEmployee.email,
      role: savedEmployee.role
    });

    // Verify it was saved
    const count = await Employee.countDocuments();
    console.log('📊 Total employees in database:', count);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    
    if (error.name === 'ValidationError') {
      console.log('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`- ${key}: ${error.errors[key].message}`);
      });
    }
    
    process.exit(1);
  }
};

testEmployeeCreation();
