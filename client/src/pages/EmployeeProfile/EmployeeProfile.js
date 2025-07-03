import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();
  
  // Form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit-profile');

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.id]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.id]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-profile-page">
      <nav className="employee-nav">
        <div className="nav-item" onClick={() => navigate('/employee-home')}>
          <p>🏠</p>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/employee-leads')}>
          <p>👥</p>
          <span>Leads</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/employee-schedule')}>
          <p>📅</p>
          <span>Schedule</span>
        </div>
        <div className="nav-item active" onClick={() => navigate('/employee-profile')}>
          <p>👤</p>
          <span>Profile</span>
        </div>
      </nav>
      
      <main className="profile-main-content">
        <div className="header-blue">
          <div className="logo"><span style={{color: 'white'}} className="canova-text">Canova</span><span style={{color: 'white'}} className="crm-text">CRM</span></div>
          <div className="page-header">
            <h1>Profile</h1>
          </div>
        </div>

        <div className="profile-content-wrapper">
          <div className="profile-card">
            <div className="profile-tabs">
              <button 
                className={`tab-btn ${activeTab === 'edit-profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit-profile')}
              >
                Edit Profile
              </button>
              <button 
                className={`tab-btn ${activeTab === 'change-password' ? 'active' : ''}`}
                onClick={() => setActiveTab('change-password')}
              >
                Change Password
              </button>
            </div>
            
            {activeTab === 'edit-profile' && (
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First name</label>
                    <input 
                      type="text" 
                      id="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last name</label>
                    <input 
                      type="text" 
                      id="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    value={profileData.email}
                    disabled
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'change-password' && (
              <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input 
                    type="password" 
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">Password</label>
                    <input 
                      type="password" 
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="************"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="************"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default EmployeeProfile; 