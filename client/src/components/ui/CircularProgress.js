import React from 'react';
import './CircularProgress.css';

const CircularProgress = ({ progress }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-container">
      <svg
        height={radius * 2}
        width={radius * 2}
      >
        <circle
          className="progress-background"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-bar"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="progress-text">{progress}%</span>
    </div>
  );
};

export default CircularProgress; 