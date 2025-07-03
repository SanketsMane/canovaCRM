import React from 'react';
import './RecentActivity.css';

const RecentActivity = ({ activities = [] }) => {
  // Format the activities for display
  const formattedActivities = activities && activities.length > 0 
    ? activities.map(activity => ({
        id: activity._id,
        text: activity.description,
        time: activity.timeAgo || 'recently'
      }))
    : [
        // Fallback static data if no activities are provided
        { id: 1, text: 'You assigned a lead to Priya', time: '1 hour ago' },
        { id: 2, text: 'Jay closed a deal', time: '2 hours ago' }
      ];

  if (!formattedActivities || formattedActivities.length === 0) {
    return (
      <div className="recent-activity">
        <h4>Recent Activity Feed</h4>
        <p className="no-activities">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <h4>Recent Activity Feed</h4>
      <ul>
        {formattedActivities.map(activity => (
          <li key={activity.id}>
            {activity.text} — <span className="activity-time">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;