import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Settings.css';

const Settings = () => {
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
            // Update profile first
            await updateProfile(profileData);
            
            // If password fields are filled, update password too
            if (passwordData.newPassword && passwordData.confirmPassword) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    toast.error('New password and confirmation do not match');
                    setIsSubmitting(false);
                    return;
                }
                
                // For changing password without current password (as shown in UI)
                await changePassword('', passwordData.newPassword);
                
                // Clear password fields after successful change
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
            
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
        <div className="settings-page">
            <div className="page-header">
                <div className="breadcrumb">
                    <Link to="/dashboard">Home</Link> &gt; Settings
                </div>
            </div>
            
            <div className="settings-container">
                <div className="settings-card">
                    <div className="settings-tabs">
                        <button className="tab-btn active">
                            Edit Profile
                        </button>
                    </div>
                    
                    <form className="profile-form" onSubmit={handleProfileSubmit}>
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
                        
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                required
                                disabled
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="newPassword">Password</label>
                            <input 
                                type="password" 
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="************"
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
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings; 