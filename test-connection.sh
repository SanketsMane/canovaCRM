#!/bin/bash

echo "🔍 Testing CRM Server Connection..."
echo "=================================="

# Test if server is running on port 5001
echo "1. Checking if server is running on port 5001..."
if curl -s http://localhost:5001 > /dev/null; then
    echo "✅ Server is responding on port 5001"
else
    echo "❌ Server is not responding on port 5001"
    exit 1
fi

# Test login API endpoint
echo ""
echo "2. Testing login API endpoint..."
response=$(curl -s -w "%{http_code}" -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "olivia.williams@canovacrm.com", "password": "admin123"}')

http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Login API is working (HTTP $http_code)"
else
    echo "❌ Login API failed (HTTP $http_code)"
fi

# Test signup API endpoint
echo ""
echo "3. Testing signup API endpoint..."
test_email="connection.test.$(date +%s)@example.com"
response=$(curl -s -w "%{http_code}" -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Connection\",
    \"lastName\": \"Test\",
    \"email\": \"$test_email\",
    \"password\": \"test123\",
    \"location\": \"Test City\",
    \"phone\": \"1234567890\",
    \"department\": \"Testing\",
    \"role\": \"employee\"
  }")

http_code="${response: -3}"
if [ "$http_code" = "201" ]; then
    echo "✅ Signup API is working (HTTP $http_code)"
else
    echo "❌ Signup API failed (HTTP $http_code)"
fi

# Test CORS headers
echo ""
echo "4. Testing CORS configuration..."
cors_header=$(curl -s -I -X OPTIONS http://localhost:5001/api/auth/login | grep -i "access-control-allow-origin")
if [ ! -z "$cors_header" ]; then
    echo "✅ CORS headers present: $cors_header"
else
    echo "❌ CORS headers missing"
fi

echo ""
echo "🎉 Connection test completed!"
echo ""
echo "If all tests passed, the server is working correctly."
echo "Frontend should be accessible at: http://localhost:3001"
echo "Backend should be accessible at: http://localhost:5001"
