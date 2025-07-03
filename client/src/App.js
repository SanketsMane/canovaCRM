import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import EmployeeHome from './pages/EmployeeHome/EmployeeHome';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import EmployeeLeads from './pages/EmployeeLeads/EmployeeLeads';
import EmployeeSchedule from './pages/EmployeeSchedule/EmployeeSchedule';
import EmployeeProfile from './pages/EmployeeProfile/EmployeeProfile';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Dashboard Components
import Dashboard from './pages/Dashboard/Dashboard';
import Leads from './pages/Leads/Leads';
import Employees from './pages/Employees/Employees';
import Settings from './pages/Settings/Settings';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Employee Routes */}
          <Route 
            path="/employee-home" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee-leads" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeLeads />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee-schedule" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee-profile" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Leads />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Employees />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
