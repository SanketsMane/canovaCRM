# Fixing 405 Method Not Allowed Error on Login

If you're seeing a `405 Method Not Allowed` error when trying to log in to your deployed CRM application on Vercel, follow these steps to fix the issue:

## Root Cause

The 405 error occurs because Vercel's serverless environment handles API routes differently than a traditional Express server. By default, it doesn't correctly route POST requests to your `/auth/login` endpoint.

## Solution

We've implemented a fix by:

1. Creating a dedicated serverless handler for the login endpoint in `server/api/auth/login.js`
2. Updating the Vercel routing configuration to properly direct login requests
3. Enhancing the API client to better handle serverless environments

## Deployment Steps

1. **Push all changes** to your GitHub repository:

   ```bash
   git add .
   git commit -m "Fix login 405 error with serverless functions"
   git push origin main
   ```

2. **Deploy your application** following these instructions:

   a. Create a Vercel project pointing to your GitHub repository
   b. Configure the project with these settings:
      - Build Command: `cd client && npm install && npm run build`
      - Output Directory: `client/build`
      - Environment Variables:
        - MONGODB_URI: your MongoDB Atlas connection string
        - JWT_SECRET: your JWT secret key
        - NODE_ENV: production

3. **After deployment**:
   - Test the login functionality
   - Check browser console logs for any errors
   - If issues persist, check Vercel Function Logs for detailed error messages

## Additional Tips

- Make sure MongoDB Atlas allows connections from anywhere (IP: 0.0.0.0/0)
- Verify that the JWT_SECRET environment variable is set correctly in Vercel
- If login still fails, try deploying the frontend and backend as separate projects

## Troubleshooting

If you still experience login issues:

1. In browser developer tools, go to Network tab
2. Try to login and check the request/response details for the login request
3. Check Vercel Function Logs for server-side errors
4. Verify that all environment variables are properly set

For persistent issues, you may need to restructure your project for better compatibility with Vercel's serverless architecture.
