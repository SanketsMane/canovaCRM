import React, { useState } from 'react';
import './LeadCard.css';

const LeadCard = ({ lead, onUpdate }) => {
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState(lead.status);

  const handleTypeChange = (newType) => {
    onUpdate({ ...lead, type: newType });
    setTypeOpen(false);
  };

  const handleStatusChange = () => {
    onUpdate({ ...lead, status: status });
    setStatusOpen(false);
  };

  const handleDateSave = () => {
    // For now, just closes the popup.
    // A date-picker library would be better here.
    setDateOpen(false);
  }

  const getBorderColor = () => {
    switch (lead.type) {
        case 'Hot': return '#ff4d4d';
        case 'Warm': return '#ffcc00';
        case 'Cold': return '#33ccff';
        default: return '#ff7f00';
    }
  }

  return (
    <div className="lead-card" style={{ borderLeftColor: getBorderColor() }}>
      <div className="lead-card-header">
        <div className="lead-info">
          <h4>{lead.name}</h4>
          <p>{lead.email}</p>
        </div>
        <div className="lead-status-container">
            <div className={`lead-status ${lead.status.toLowerCase()}`}>
                {lead.status}
            </div>
        </div>
      </div>
      <div className="lead-card-body">
        <div className="lead-date">
          <span className="calendar-icon"></span>
          <span>{lead.date}</span>
        </div>
        <div className="lead-actions">
          <button className="icon-btn copy-icon"></button>
          <div className="dropdown-container">
            <button className="icon-btn pen-icon" onClick={() => setTypeOpen(!typeOpen)}></button>
            {typeOpen && (
              <div className="dropdown-menu type-menu">
                <p>Type</p>
                <button className="type-option hot" onClick={() => handleTypeChange('Hot')}>Hot</button>
                <button className="type-option warm" onClick={() => handleTypeChange('Warm')}>Warm</button>
                <button className="type-option cold" onClick={() => handleTypeChange('Cold')}>Cold</button>
              </div>
            )}
          </div>
          <div className="dropdown-container">
            <button className="icon-btn clock-icon" onClick={() => setDateOpen(!dateOpen)}></button>
            {dateOpen && (
              <div className="dropdown-menu date-menu">
                <label>Date</label>
                <input type="text" placeholder="dd/mm/yy" />
                <label>Time</label>
                <input type="text" placeholder="02:30 PM" />
                <button className="save-btn" onClick={handleDateSave}>Save</button>
              </div>
            )}
          </div>
          <div className="dropdown-container">
            <button className="icon-btn arrow-down-icon" onClick={() => setStatusOpen(!statusOpen)}></button>
            {statusOpen && (
              <div className="dropdown-menu status-menu">
                <label>Lead Status</label>
                <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
                <div className="status-info">
                  <span>i</span>
                  <p>Lead can not be close</p>
                </div>
                <button className="save-btn" onClick={handleStatusChange}>Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard; 