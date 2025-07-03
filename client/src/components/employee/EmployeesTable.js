import React from 'react';
import './EmployeesTable.css';

const EmployeesTable = ({ employees = [], showStatus }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="employees-table-container">
        <h3>Recent Employees</h3>
        <p className="no-employees">No employees found</p>
      </div>
    );
  }

  return (
    <div className="employees-table-container">
      <h3>Employee Performance</h3>
      <div className="employees-table">
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Assigned Leads</th>
              <th>Closed Leads</th>
              {showStatus && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee._id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  <div className="employee-name">
                    <div className="employee-avatar">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="employee-details">
                      <div className="employee-fullname">{employee.name}</div>
                      <div className="employee-email">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td>#{Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}</td>
                <td>{employee.assignedLeads}</td>
                <td>{employee.closedLeads}</td>
                {showStatus && (
                  <td>
                    <span className={`employee-status-indicator ${employee.status.toLowerCase()}`}>
                      • {employee.status}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesTable; 