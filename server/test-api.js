const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'olivia.williams@canovacrm.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test creating employee via API
    console.log('👤 Creating employee via API...');
    
    const employeeData = {
      firstName: 'API',
      lastName: 'Test',
      email: 'api.test@canovacrm.com',
      password: 'password123',
      location: 'API City',
      preferredLanguage: 'English',
      phone: '+15550198',
      department: 'API Testing',
      role: 'employee'
    };

    const createResponse = await axios.post(
      'http://localhost:5001/api/employees',
      employeeData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Employee created via API!');
    console.log('Response:', createResponse.data);

    // Test getting employees
    console.log('📋 Getting all employees...');
    const getResponse = await axios.get('http://localhost:5001/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`✅ Found ${getResponse.data.data.length} employees`);
    console.log('Employees:', getResponse.data.data.map(emp => ({
      name: emp.fullName,
      email: emp.email,
      role: emp.role
    })));

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
};

testAPI();
