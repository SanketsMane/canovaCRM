import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, iconBg }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-icon" style={{ background: iconBg }}>
        {Icon && <Icon className="stats-icon" />}
      </div>
      <div className="stats-card-info">
        <p className="stats-card-title">{title}</p>
        <h2 className="stats-card-value">{value}</h2>
      </div>
    </div>
  );
};

export default StatsCard; 