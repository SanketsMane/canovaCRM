import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the selected role from navigation state
  const selectedRole = location.state?.role || 'employee';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      
      // Show success toast
      toast.success(`Welcome back, ${userData.firstName}! Login successful.`);
      
      // Navigate based on user's actual role from the API response
      console.log('User role from API:', userData.role); // Debug log
      
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/employee-home');
      }
    } catch (error) {
      // Show error toast
      toast.error(error.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup', { state: { role: selectedRole } });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in as {selectedRole === 'admin' ? 'Administrator' : 'Employee'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>Don't have an account?</span>
        </div>

        <button 
          onClick={handleSignupRedirect}
          className="signup-redirect-btn"
        >
          Create {selectedRole === 'admin' ? 'Administrator' : 'Employee'} Account
        </button>

        <div className="login-footer">
          <Link to="/">← Back to Role Selection</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 