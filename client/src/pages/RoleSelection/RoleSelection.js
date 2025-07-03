import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    // Navigate to login with the selected role
    navigate('/login', { state: { role } });
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="header-section">
          <h1>Welcome to <span className="canova-text">Canova</span><span className="crm-text">CRM</span></h1>
          <p>Choose your role to get started</p>
        </div>
        
        <div className="role-buttons">
          <div className="role-option" onClick={() => handleRoleSelection('admin')}>
            <div className="role-icon admin-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 7H7V9H21ZM21 11H7V13H21V11ZM21 15H7V17H21V15ZM7 19H21V21H7V19Z"/>
              </svg>
            </div>
            <h3>Administrator</h3>
            <p>Manage employees, view analytics, and oversee operations</p>
            <button className="role-btn admin">Continue as Admin</button>
          </div>
          
          <div className="role-option" onClick={() => handleRoleSelection('employee')}>
            <div className="role-icon employee-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4H16ZM12 14C10.9 14 10 13.1 10 12S10.9 10 12 10 14 10.9 14 12 13.1 14 12 14ZM18 8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8Z"/>
              </svg>
            </div>
            <h3>Employee</h3>
            <p>Access your dashboard, manage leads, and track performance</p>
            <button className="role-btn employee">Continue as Employee</button>
          </div>
        </div>
        
        <div className="footer-section">
          <p>New to <span className="canova-text">Canova</span><span className="crm-text">CRM</span>? No problem! You'll be able to create an account in the next step.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 