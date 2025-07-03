import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ProfileEditModal from '../profile/ProfileEditModal';
import './Sidebar.css';

const Sidebar = ({ user }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user) return 'U';
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
    };

    const handleProfileClick = () => {
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
    };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><span className="canova-text">Canova</span><span className="crm-text">CRM</span></h2>
      </div>
      <ul className="sidebar-menu">
        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
        <li><NavLink to="/leads" className={({ isActive }) => isActive ? 'active' : ''}>Leads</NavLink></li>
        <li><NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink></li>
        <li><NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink></li>
      </ul>
      <div className="sidebar-bottom">
        <button 
          onClick={handleLogout}
          className="sidebar-logout-btn"
          title="Logout"
        >
          <span className="logout-icon">←</span>
          Logout
        </button>
        <p className="profile-label">Profile</p>
        <div className="profile-section" onClick={handleProfileClick}>
            <div className="profile-avatar">{getUserInitials()}</div>
            <div className="profile-info">
                <p className="profile-name">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
                <p className="profile-email">{user?.email || 'user@example.com'}</p>
                <p className="profile-role">{user?.role || 'Employee'}</p>
            </div>
        </div>
      </div>
      
      <ProfileEditModal 
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        user={user}
      />
    </div>
  );
};

export default Sidebar; 