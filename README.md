# Sales CRM - MERN Stack Application

## Project Structure & Documentation
This is the root README for the Sales CRM project. It provides a high-level overview, features, tech stack, and setup instructions for the entire application.

- For **frontend (React) details**, see [client/README.md](client/README.md)
- For **backend (Node.js/Express) details**, see [server/README.md](server/README.md)

A comprehensive Sales Customer Relationship Management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### Admin Dashboard
- **Real-time Analytics**: Sales performance charts and statistics
- **Lead Management**: Complete CRUD operations for leads
- **Employee Management**: Add, edit, delete, and manage employees
- **CSV Upload**: Bulk lead import with drag-and-drop functionality
- **Activity Tracking**: Recent activity feed with timestamps
- **Responsive Design**: Works on desktop, tablet, and mobile

### Lead Management
- **Lead Distribution**: Smart assignment based on location/language preferences
- **Status Tracking**: Open/Closed, Hot/Warm/Cold lead classification
- **Search & Filter**: Advanced search across all lead fields
- **CSV Processing**: Upload multiple leads with verification
- **Assignment Logic**: Priority-based distribution to employees

### Employee Management
- **Pagination**: Efficient data loading with pagination
- **Sorting**: Click column headers to sort data
- **Search**: Search across employee information
- **CRUD Operations**: Full create, read, update, delete functionality
- **Role-based Access**: Admin-only employee management

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern UI framework
- **CSS3**: Custom styling with responsive design
- **Recharts**: Interactive data visualization
- **React Router**: Client-side routing
- **React Dropzone**: File upload functionality

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **csv-parser**: CSV file processing

## 📁 Project Structure

```
crmSale/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── context/       # React context
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── controllers/       # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
 
   cd SalesCRM
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # In server directory, create .env file
   MONGO_URI=mongodb://localhost:27017/salecrm
   JWT_SECRET=your_super_secret_jwt_key_123
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Start backend (from server directory)
   npm start
   
   # Start frontend (from client directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Recent Updates (Last 4 Hours)

### ✅ Backend Enhancements
- **Complete API Structure**: Full CRUD operations for all entities
- **Authentication System**: JWT-based login/logout functionality
- **MongoDB Integration**: Proper database models and relationships
- **CSV Processing**: Advanced lead upload with distribution logic
- **Error Handling**: Comprehensive error management
- **Data Seeding**: Sample data for testing

### ✅ Frontend Improvements
- **Role Selection**: Choose between Admin and Employee views
- **Dynamic Dashboard**: Real-time data from backend APIs
- **Interactive Charts**: Sales analytics with hover effects
- **Responsive Design**: Mobile-friendly interface
- **File Upload**: Drag-and-drop CSV functionality
- **Loading States**: Better user experience with loading indicators

### ✅ New Features Added
- **Employee Dashboard**: Dedicated employee view with assigned leads
- **Activity Tracking**: Real-time activity feed
- **Lead Distribution**: Smart assignment algorithms
- **Search & Filter**: Advanced data filtering capabilities
- **Pagination**: Efficient data loading
- **Sorting**: Column-based data sorting

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Sales analytics
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/employees` - Employee data

### Leads
- `GET /api/leads` - Get all leads (with pagination/search)
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/upload-csv` - Upload CSV leads

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## 🎯 Key Features Implemented

### Dashboard Analytics
- Real-time sales statistics
- Interactive charts with hover effects
- Conversion rate calculations
- Employee performance metrics

### Lead Management
- Bulk CSV upload with verification
- Smart lead distribution algorithms
- Status and type classification
- Assignment tracking

### Employee Management
- Complete CRUD operations
- Search and pagination
- Role-based access control
- Performance tracking

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interface
- Adaptive layouts

## 🚀 Deployment Ready

The application is ready for deployment on:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Render, or any Node.js hosting
- **Database**: MongoDB Atlas (cloud) or local MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.


---

**Built with ❤️ using the MERN stack**
