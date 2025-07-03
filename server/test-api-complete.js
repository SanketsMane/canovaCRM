const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testCompleteFlow() {
  try {
    console.log('🚀 Starting complete API test flow...');
    
    // Step 1: Login to get token
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'olivia.williams@canovacrm.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.employee.fullName);
    console.log('Role:', loginResponse.data.data.employee.role);
    
    const token = loginResponse.data.data.token;
    console.log('Token obtained:', token.substring(0, 20) + '...');
    
    // Step 2: Create employee using the token
    console.log('\n2. Testing employee creation with valid token...');
    const employeeData = {
      firstName: 'Test',
      lastName: 'Employee',
      email: 'test.employee@crm.com',
      password: 'testpass123',
      location: 'New York',
      preferredLanguage: 'English',
      phone: '15550123',
      department: 'Sales',
      role: 'employee'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/employees`, employeeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Employee created successfully!');
    console.log('New employee:', createResponse.data.data.fullName);
    console.log('Employee ID:', createResponse.data.data._id);
    
    // Step 3: Verify employee exists by fetching all employees
    console.log('\n3. Verifying employee exists...');
    const listResponse = await axios.get(`${API_BASE_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const employees = listResponse.data.data;
    const createdEmployee = employees.find(emp => emp.email === employeeData.email);
    
    if (createdEmployee) {
      console.log('✅ Employee verified in database!');
      console.log('Total employees:', employees.length);
    } else {
      console.log('❌ Employee not found in list');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testCompleteFlow();
