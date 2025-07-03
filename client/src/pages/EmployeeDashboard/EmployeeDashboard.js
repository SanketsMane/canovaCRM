import React, { useState } from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  // Mock data for employee dashboard
  const [employeeData] = useState({
    name: 'John Smith',
    email: 'john.smith@canovacrm.com',
    assignedLeads: 8,
    closedLeads: 3,
    conversionRate: '37.5%',
    thisWeekCalls: 12,
    thisMonthCalls: 45
  });

  const [assignedLeads] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      company: 'TechCorp',
      status: 'Open',
      type: 'Hot',
      lastContact: '2 hours ago',
      nextCall: 'Tomorrow 10:00 AM'
    },
    {
      id: 2,
      name: 'Bob Wilson',
      company: 'StartupXYZ',
      status: 'Open',
      type: 'Warm',
      lastContact: '1 day ago',
      nextCall: 'Today 3:00 PM'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      company: 'Business Inc',
      status: 'Closed',
      type: 'Hot',
      lastContact: '3 days ago',
      nextCall: 'Completed'
    }
  ]);

  const [recentActivities] = useState([
    { id: 1, text: 'Called Alice Johnson - discussed pricing options', time: '2 hours ago' },
    { id: 2, text: 'Scheduled follow-up call with Bob Wilson', time: '1 day ago' },
    { id: 3, text: 'Closed deal with Carlos Rodriguez', time: '3 days ago' },
    { id: 4, text: 'Updated lead status for TechCorp', time: '4 days ago' }
  ]);

  return (
    <div className="employee-dashboard">
      <div className="employee-breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/employee-dashboard">Employee Dashboard</a>
      </div>
      
      <div className="employee-header">
        <h1>Welcome back, {employeeData.name}!</h1>
        <p>Here's your performance overview</p>
      </div>

      <div className="employee-stats">
        <div className="stat-card">
          <h3>Assigned Leads</h3>
          <div className="stat-value">{employeeData.assignedLeads}</div>
        </div>
        <div className="stat-card">
          <h3>Closed Leads</h3>
          <div className="stat-value">{employeeData.closedLeads}</div>
        </div>
        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <div className="stat-value">{employeeData.conversionRate}</div>
        </div>
        <div className="stat-card">
          <h3>This Week Calls</h3>
          <div className="stat-value">{employeeData.thisWeekCalls}</div>
        </div>
      </div>

      <div className="employee-main">
        <div className="assigned-leads-section">
          <h2>My Assigned Leads</h2>
          <div className="leads-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Last Contact</th>
                  <th>Next Call</th>
                </tr>
              </thead>
              <tbody>
                {assignedLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.company}</td>
                    <td>
                      <span className={`status ${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span className={`type ${lead.type.toLowerCase()}`}>
                        {lead.type}
                      </span>
                    </td>
                    <td>{lead.lastContact}</td>
                    <td>{lead.nextCall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="recent-activities-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-text">{activity.text}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 