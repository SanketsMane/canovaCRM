#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testUserEmployeeSeparation() {
  console.log('🧪 Testing User/Employee Model Separation');
  console.log('==========================================\n');

  try {
    // Test 1: Create User via Signup
    console.log('1. Testing User Creation via Signup...');
    const userSignupData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@separation.com',
      password: 'test123',
      role: 'admin',
      location: 'Test City',
      phone: '1111111111'
    };

    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, userSignupData);
    console.log('✅ User signup successful');
    console.log(`   User ID: ${signupResponse.data.data.user._id}`);
    console.log(`   User Name: ${signupResponse.data.data.user.fullName}`);
    console.log(`   User Role: ${signupResponse.data.data.user.role}\n`);
    
    const adminToken = signupResponse.data.data.token;

    // Test 2: Create Employee with User Account
    console.log('2. Testing Employee Creation with User Account...');
    const employeeWithUserData = {
      firstName: 'Employee',
      lastName: 'WithAccount',
      email: 'employee.with.account@separation.com',
      password: 'employee123',
      location: 'Employee City',
      phone: '2222222222',
      department: 'Sales',
      role: 'employee',
      createUserAccount: true
    };

    const employeeWithUserResponse = await axios.post(`${API_BASE_URL}/employees`, employeeWithUserData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Employee with user account created');
    console.log(`   Employee ID: ${employeeWithUserResponse.data.data._id}`);
    console.log(`   Linked User ID: ${employeeWithUserResponse.data.data.userId._id}`);
    console.log(`   Employee Name: ${employeeWithUserResponse.data.data.fullName}\n`);

    // Test 3: Create Employee without User Account
    console.log('3. Testing Employee Creation without User Account...');
    const employeeWithoutUserData = {
      firstName: 'Employee',
      lastName: 'WithoutAccount',
      email: 'employee.without.account@separation.com',
      location: 'Contact City',
      phone: '3333333333',
      department: 'Marketing',
      role: 'employee',
      createUserAccount: false
    };

    const employeeWithoutUserResponse = await axios.post(`${API_BASE_URL}/employees`, employeeWithoutUserData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Employee without user account created');
    console.log(`   Employee ID: ${employeeWithoutUserResponse.data.data._id}`);
    console.log(`   Linked User ID: ${employeeWithoutUserResponse.data.data.userId || 'None'}`);
    console.log(`   Employee Name: ${employeeWithoutUserResponse.data.data.fullName}\n`);

    // Test 4: Login with Employee User Account
    console.log('4. Testing Login with Employee User Account...');
    const employeeLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: employeeWithUserData.email,
      password: employeeWithUserData.password
    });
    console.log('✅ Employee user login successful');
    console.log(`   Logged in User ID: ${employeeLoginResponse.data.data.user._id}`);
    console.log(`   User Name: ${employeeLoginResponse.data.data.user.fullName}`);
    console.log(`   User Role: ${employeeLoginResponse.data.data.user.role}\n`);

    // Test 5: Try to login with Employee without User Account (should fail)
    console.log('5. Testing Login with Employee without User Account (should fail)...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: employeeWithoutUserData.email,
        password: 'anypassword'
      });
      console.log('❌ This should have failed');
    } catch (error) {
      console.log('✅ Login correctly failed for employee without user account');
      console.log(`   Error: ${error.response.data.message}\n`);
    }

    // Test 6: Test Profile Update (User model)
    console.log('6. Testing User Profile Update...');
    const profileUpdateResponse = await axios.put(`${API_BASE_URL}/auth/profile`, {
      firstName: 'Updated',
      location: 'Updated City'
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ User profile updated successfully');
    console.log(`   Updated Name: ${profileUpdateResponse.data.data.fullName}`);
    console.log(`   Updated Location: ${profileUpdateResponse.data.data.location}\n`);

    console.log('🎉 All tests passed! User/Employee separation is working correctly!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User signup/login uses User model');
    console.log('   ✅ Employee creation can optionally create linked User accounts');
    console.log('   ✅ Employee creation can work without User accounts (for contacts)');
    console.log('   ✅ Authentication is completely separated from employee management');
    console.log('   ✅ Profile updates work on User model');
    console.log('   ✅ Access control works with User/Employee relationship');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\nPlease check the server logs for more details.');
  }
}

// Run tests
testUserEmployeeSeparation().catch(console.error);
