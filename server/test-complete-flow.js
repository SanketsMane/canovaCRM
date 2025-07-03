const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testSignupFlow() {
  try {
    console.log('🚀 Testing complete signup and login flow...');
    
    // Step 1: Test Admin Signup
    console.log('\n1. Testing admin signup...');
    const adminSignupData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin.user@test.com',
      password: 'admin123',
      location: 'New York',
      phone: '1234567892',
      department: 'Administration',
      role: 'admin'
    };
    
    const adminSignupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, adminSignupData);
    console.log('✅ Admin signup successful!');
    console.log('Admin:', adminSignupResponse.data.data.employee.fullName);
    console.log('Role:', adminSignupResponse.data.data.employee.role);
    console.log('Token received:', adminSignupResponse.data.data.token.substring(0, 20) + '...');
    
    // Step 2: Test Employee Signup
    console.log('\n2. Testing employee signup...');
    const employeeSignupData = {
      firstName: 'Regular',
      lastName: 'Employee',
      email: 'regular.employee@test.com',
      password: 'employee123',
      location: 'Los Angeles',
      phone: '1234567893',
      department: 'Sales',
      role: 'employee'
    };
    
    const employeeSignupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, employeeSignupData);
    console.log('✅ Employee signup successful!');
    console.log('Employee:', employeeSignupResponse.data.data.employee.fullName);
    console.log('Role:', employeeSignupResponse.data.data.employee.role);
    
    // Step 3: Test Login with new admin account
    console.log('\n3. Testing login with new admin account...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: adminSignupData.email,
      password: adminSignupData.password
    });
    
    console.log('✅ Login successful!');
    console.log('Logged in as:', loginResponse.data.data.employee.fullName);
    
    // Step 4: Verify admin can create employees
    console.log('\n4. Testing admin creating employee via API...');
    const newEmployee = {
      firstName: 'API',
      lastName: 'Created',
      email: 'api.created@test.com',
      password: 'password123',
      location: 'Chicago',
      preferredLanguage: 'English',
      phone: '1234567894',
      department: 'Support',
      role: 'employee'
    };
    
    const createEmployeeResponse = await axios.post(`${API_BASE_URL}/employees`, newEmployee, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.token}`
      }
    });
    
    console.log('✅ Admin successfully created employee via API!');
    console.log('New employee:', createEmployeeResponse.data.data.fullName);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Admin signup working');
    console.log('- ✅ Employee signup working');
    console.log('- ✅ Login working'); 
    console.log('- ✅ Admin employee creation working');
    console.log('- ✅ Token authentication working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testSignupFlow();
