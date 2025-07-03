# Deployment Configuration
# Use this as a checklist before deploying

## Pre-Deployment Checklist

### ✅ Environment Configuration
- [ ] Update MONGO_URI with your production MongoDB Atlas connection
- [ ] Change JWT_SECRET to a secure production key
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS with your production domains
- [ ] Set up rate limiting values

### ✅ Security
- [ ] Enable MongoDB Atlas IP whitelist (add 0.0.0.0/0 or specific IPs)
- [ ] Update MongoDB Atlas user permissions
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production

### ✅ Database
- [ ] Run database seeding: `npm run seed`
- [ ] Verify MongoDB Atlas connection
- [ ] Set up database backups

### ✅ Testing
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test CORS configuration
- [ ] Check error handling

## Deployment Platforms

### Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `heroku config:set MONGO_URI="your-atlas-connection"`
4. `heroku config:set JWT_SECRET="your-production-secret"`
5. `git push heroku main`

### Railway
1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Render
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and run commands
3. Add environment variables
4. Deploy

## Production Environment Variables Template
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority&appName=AppName
JWT_SECRET=your-super-secure-production-jwt-secret-key-2025
PORT=5000
NODE_ENV=production
DB_NAME=your-database-name
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
