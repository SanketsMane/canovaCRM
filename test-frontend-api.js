// Test script to verify API connection from frontend
const API_BASE_URL = 'http://localhost:5001/api';

async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'olivia.williams@canovacrm.com',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful!');
      console.log('User:', data.data.employee.fullName);
      return true;
    } else {
      console.log('❌ API response not ok');
      const text = await response.text();
      console.log('Response text:', text);
      return false;
    }
    
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Run test
testAPIConnection();
