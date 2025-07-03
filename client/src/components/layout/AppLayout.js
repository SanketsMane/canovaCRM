import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default AppLayout; 