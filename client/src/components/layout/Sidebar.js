import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>CanovaCRM</h2>
      </div>
      <ul className="sidebar-menu">
        <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Dashboard</Link>
        </li>
        <li className={location.pathname === '/leads' ? 'active' : ''}>
            <Link to="/leads">Leads</Link>
        </li>
        <li><a href="#">Employees</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
      <div className="sidebar-footer">
        <button className="logout-btn">Logout</button>
        <div className="profile">
            <div className="profile-avatar"></div>
            <div className="profile-info">
                <p className="profile-name">Sanket Mane</p>
                <p className="profile-role">Admin</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 