import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import RecentActivity from '../../components/dashboard/RecentActivity';
import './EmployeeHome.css';

const EmployeeHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [checkOutTime, setCheckOutTime] = useState('--:--');
  const [onBreak, setOnBreak] = useState(false);
  const [activeBreakId, setActiveBreakId] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState('--:--');
  const [breakEndTime, setBreakEndTime] = useState('--:--');
  const [todaysBreaks, setTodaysBreaks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [greeting, setGreeting] = useState('');

  // Get appropriate greeting based on time of day (fallback if API fails)
  const getLocalGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Fetch greeting from API or use local fallback
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await api.dashboard.getGreeting();
        if (response.success) {
          setGreeting(response.greeting);
        } else {
          setGreeting(getLocalGreeting());
        }
      } catch (error) {
        console.warn('Error fetching greeting, using local calculation:', error);
        setGreeting(getLocalGreeting());
      }
    };

    fetchGreeting();
    
    // Update greeting every minute in case it changes (e.g., at noon)
    const interval = setInterval(() => {
      fetchGreeting();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check for active break
        const activeBreakResponse = await api.breaks.getActiveBreak();
        if (activeBreakResponse.success && activeBreakResponse.data) {
          setOnBreak(true);
          setActiveBreakId(activeBreakResponse.data.id);
          setBreakStartTime(activeBreakResponse.data.startTime);
        }

        // Load today's breaks
        const todaysBreaksResponse = await api.breaks.getTodaysBreaks();
        if (todaysBreaksResponse.success) {
          setTodaysBreaks(todaysBreaksResponse.data);
        }

        // Load recent activities
        try {
          const activitiesResponse = await api.dashboard.getRecentActivities();
          if (activitiesResponse.success) {
            setRecentActivities(activitiesResponse.data || []);
          }
        } catch (activityError) {
          console.warn('Could not load activities:', activityError.message);
          // Don't throw error, just use empty activities
          setRecentActivities([]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleToggle = () => {
    if (!checkedIn) {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckedIn(true);
      setCheckInTime(time);
      setCheckOutTime('--:--');
    } else {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckedIn(false);
      setCheckOutTime(time);
    }
  };

  const handleBreakToggle = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (!onBreak) {
        // Start break
        const response = await api.breaks.startBreak('Regular break');
        if (response.success) {
          setOnBreak(true);
          setActiveBreakId(response.data.breakId);
          setBreakStartTime(response.data.startTime);
          setBreakEndTime('--:--');
          toast.success('Break started successfully!');
        }
      } else {
        // End break
        const response = await api.breaks.endBreak();
        if (response.success) {
          setOnBreak(false);
          setActiveBreakId(null);
          setBreakEndTime(response.data.endTime);
          toast.success(`Break ended! Duration: ${response.data.duration}`);
          
          // Refresh today's breaks
          const todaysBreaksResponse = await api.breaks.getTodaysBreaks();
          if (todaysBreaksResponse.success) {
            setTodaysBreaks(todaysBreaksResponse.data);
          }

          // Refresh recent activities
          try {
            const activitiesResponse = await api.dashboard.getRecentActivities();
            if (activitiesResponse.success) {
              setRecentActivities(activitiesResponse.data || []);
            }
          } catch (activityError) {
            console.warn('Could not refresh activities:', activityError.message);
            // Don't throw error, just continue
          }
        }
      }
    } catch (error) {
      console.error('Error toggling break:', error);
      toast.error(error.message || 'Failed to toggle break');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-home-page">
      <nav className="employee-nav">
        <div className="nav-item active" onClick={() => navigate('/employee-home')}>
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
        <div className="nav-item" onClick={() => navigate('/employee-profile')}>
          <p>👤</p>
          <span>Profile</span>
        </div>
      </nav>
      <main className="employee-main-content">
        <div className="header-blue">
          <div className="logo"><span className="canova-text">Canova</span><span className="crm-text">CRM</span></div>
          <div className="header-user-section">
            <div className="greeting">{greeting}</div>
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <button 
              onClick={handleLogout}
              className="employee-logout-btn"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="content-grid">
          <div className="timings">
            <h2>Timings</h2>
            <div className="timing-card">
              <div className="check-in-out">
                <div>
                  <p>Check in</p>
                  <span>{checkInTime}</span>
                </div>
                <div>
                  <p>Check Out</p>
                  <span>{checkOutTime}</span>
                </div>
              </div>
              <div
                className={`timing-toggle ${checkedIn ? 'checked-in' : 'checked-out'}`}
                onClick={handleToggle}
                title={checkedIn ? 'Click to Check Out' : 'Click to Check In'}
              >
                <div className="toggle-indicator" />
              </div>
            </div>
          </div>

          <div className="break-section">
            <div className="break-card">
              <div className="break-header">
                <h3>Break</h3>
                <span>{onBreak ? breakStartTime : (breakEndTime !== '--:--' ? breakEndTime : '--:--')}</span>
                <div
                  className={`timing-toggle ${onBreak ? 'checked-in' : 'checked-out'}`}
                  onClick={handleBreakToggle}
                  title={onBreak ? 'End Break' : 'Start Break'}
                  style={{ 
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <div className="toggle-indicator" />
                </div>
              </div>
              <div className="break-list">
                {todaysBreaks.length > 0 ? (
                  todaysBreaks.slice(0, 4).map((breakItem, index) => (
                    <div key={breakItem.id || index} className="break-item">
                      <div className="break-item-col">
                        <p>Break</p>
                        <span>{breakItem.startTime}</span>
                      </div>
                      <div className="break-item-col">
                        <p>Ended</p>
                        <span>{breakItem.endTime || 'In Progress'}</span>
                      </div>
                      <div className="break-item-col">
                        <p>Date</p>
                        <span>{new Date(breakItem.date).toLocaleDateString('en-GB').replace(/\//g, '/')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="break-item">
                    <div className="break-item-col" style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>
                      <p>No breaks today</p>
                      <span>Start your first break!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="recent-activity-section">
            <h2>Recent Activity</h2>
            <div className="activity-card">
              {/* Import and use the RecentActivity component */}
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeHome;