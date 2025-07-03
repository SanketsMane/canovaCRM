// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('MongoDB connected successfully');
// }).catch((err) => {
//   console.error(' MongoDB connection error:', err);
//   process.exit(1);
// });

// // Import routes
// const authRoutes = require('./routes/auth');
// const employeeRoutes = require('./routes/employees');
// const leadRoutes = require('./routes/leads');
// const dashboardRoutes = require('./routes/dashboard');

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/employees', employeeRoutes);
// app.use('/api/leads', leadRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// // Health check endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'CanovaCRM API is running',
//     version: '1.0.0',
//     status: 'healthy',
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`🚀 Server is running on port: ${port}`);
//   console.log(`📊 API Documentation: http://localhost:${port}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
// }); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Import routes FIRST before using them
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leadRoutes = require('./routes/leads');
const dashboardRoutes = require('./routes/dashboard');
const breakRoutes = require('./routes/breaks');

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:3001', '*'];

// In production, allow all origins to fix Vercel deployment issues
if (process.env.NODE_ENV === 'production') {
  console.log('🌍 Production environment detected - allowing all origins for CORS');
  app.use(cors());
} else {
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Now safe to register routes
console.log("Registering /api/auth routes...");
app.use('/api/auth', authRoutes);
console.log("Registering /api/employees routes...");
app.use('/api/employees', employeeRoutes);
console.log("Registering /api/leads routes...");
app.use('/api/leads', leadRoutes);
console.log("Registering /api/dashboard routes...");
app.use('/api/dashboard', dashboardRoutes);
console.log("Registering /api/breaks routes...");
app.use('/api/breaks', breakRoutes);

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully');
  console.log(`📊 Database: ${process.env.DB_NAME || 'canova-crm'}`);
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'CanovaCRM API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
  console.log(`📊 API Docs: http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
