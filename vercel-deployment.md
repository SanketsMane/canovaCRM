# Vercel Deployment Instructions for Canova CRM

## Option 1: Deploy as Separate Projects

For the best reliability and performance, deploy the frontend and backend as separate Vercel projects.

### Backend Deployment

1. Create a new project in Vercel
2. Link your GitHub repository
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Output Directory: (leave empty)
4. Set Environment Variables:
   - `MONGO_URI` = mongodb+srv://contactsanket1:Rgpx47OTqQhnkvly@cluster0.gdtibmv.mongodb.net/canova-crm?retryWrites=true&w=majority&appName=Cluster0
   - `JWT_SECRET` = canova-crm-super-secret-jwt-key-production-2025
   - `NODE_ENV` = production
   - `ALLOWED_ORIGINS` = * (to allow all origins)
5. Deploy

### Frontend Deployment

1. Create a new project in Vercel
2. Link your GitHub repository
3. Configure:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Output Directory: `build`
4. Set Environment Variables:
   - `REACT_APP_API_URL` = https://your-backend-url.vercel.app/api
5. Deploy

## Option 2: Deploy as a Single Project (Monorepo)

For simplicity, you can deploy the entire repository as a single project, though this approach may have limitations.

1. Create a new project in Vercel
2. Link your GitHub repository
3. Configure:
   - Root Directory: (leave empty to use the root)
   - Build Command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Output Directory: `client/build`
4. Set Environment Variables:
   - `MONGO_URI` = mongodb+srv://contactsanket1:Rgpx47OTqQhnkvly@cluster0.gdtibmv.mongodb.net/canova-crm?retryWrites=true&w=majority&appName=Cluster0
   - `JWT_SECRET` = canova-crm-super-secret-jwt-key-production-2025
   - `NODE_ENV` = production
   - `ALLOWED_ORIGINS` = * (to allow all origins)
5. Deploy

## Troubleshooting

If you encounter "API request failed" errors:

1. Check network tab in browser dev tools to see the actual error response
2. Ensure CORS is properly configured
3. Verify that the backend API is accessible
4. Check that environment variables are correctly set
5. Ensure MongoDB Atlas allows connections from Vercel's IP addresses

## MongoDB Atlas Settings

1. Go to Network Access in MongoDB Atlas
2. Add IP Address: 0.0.0.0/0 (to allow access from anywhere)
3. Confirm this change

## Additional Resources

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
