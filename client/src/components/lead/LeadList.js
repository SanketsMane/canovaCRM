import React from 'react';
import './LeadList.css';

const LeadList = () => {
  const uploadedFiles = [
    {
      no: '01',
      name: 'CSV0225',
      date: '01/03/2025',
      numLeads: 250,
      assignedLeads: 213,
      unassignedLeads: 30,
    },
  ];

  return (
    <div className="leads-list-table-container">
      <table className="leads-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Date</th>
            <th>No. of Leads</th>
            <th>Assigned Leads</th>
            <th>Unassigned Leads</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {uploadedFiles.map((file) => (
            <tr key={file.no}>
              <td>{file.no}</td>
              <td>{file.name}</td>
              <td>{file.date}</td>
              <td>{file.numLeads}</td>
              <td>{file.assignedLeads}</td>
              <td>{file.unassignedLeads}</td>
              <td>
                <button className="action-btn">⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadList; 