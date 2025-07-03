import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeLeads.css';
import { FaInfoCircle } from 'react-icons/fa';

const initialLeadsData = [
  { name: 'Sanket Mane', email: 'contactsanket1@gmail.com', date: 'April 04, 2025', time: '02:30 PM', status: 'Ongoing', statusColor: 'orange', type: 'Hot' },
  { name: 'Vaishnavi Patil', email: 'vaishnavipatil1006@gmail.com', date: 'April 04, 2025', time: '02:30 PM', status: 'Ongoing', statusColor: 'yellow', type: 'Warm' },
  { name: 'Rohan Desai ', email: 'Rohandesai10@gmail.com', date: 'April 04, 2025', time: '02:30 PM', status: 'Closed', statusColor: 'gray', type: 'Cold' },
];

const typeColors = { Hot: '#ff9800', Warm: '#ffd600', Cold: '#00e5ff' };

const EmployeeLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(initialLeadsData);
  const [typeDropdown, setTypeDropdown] = useState(null); // index of open dropdown
  const [editModal, setEditModal] = useState(null); // index of open modal
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [tooltip, setTooltip] = useState(null);
  const [statusModal, setStatusModal] = useState(null);

  const handleTypeClick = (idx) => setTypeDropdown(typeDropdown === idx ? null : idx);
  const handleTypeSelect = (idx, type) => {
    setLeads(leads => leads.map((l, i) => i === idx ? { ...l, type } : l));
    setTypeDropdown(null);
  };
  const handleEditClick = (idx) => {
    setEditModal(idx);
    setEditDate(leads[idx].date.split(', ')[1]?.split('/')?.reverse().join('-') || '');
    setEditTime(leads[idx].time || '');
  };
  const handleSave = (idx) => {
    const dateStr = editDate ? new Date(editDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : leads[idx].date;
    setLeads(leads => leads.map((l, i) => i === idx ? { ...l, date: dateStr, time: editTime } : l));
    setEditModal(null);
  };
  const handleStatusClick = (idx) => setStatusModal(idx);
  const closeStatusModal = () => setStatusModal(null);
  const handleStatusHover = (idx) => setTooltip(idx);
  const handleStatusLeave = () => setTooltip(null);

  return (
    <div className="employee-leads-page">
      <nav className="employee-nav">
        <div className="nav-item" onClick={() => navigate('/employee-home')}>
          <p>🏠</p>
          <span>Home</span>
        </div>
        <div className="nav-item active" onClick={() => navigate('/employee-leads')}>
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

      <main className="employee-leads-content">
        <div className="header-blue">
          <div className="logo"><span className="canova-text">Canova</span><span className="crm-text">CRM</span></div>
          <div className="page-title">
            <button className="back-btn" onClick={() => navigate(-1)}>{'<'}</button>
            <h1>Leads</h1>
          </div>
        </div>
        <div className="leads-list-container">
          <div className="search-container">
            <input type="text" placeholder="Search" />
            <button className="filter-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="leads-list">
            {leads.map((lead, index) => (
              <div key={index} className="lead-card">
                <div className="lead-card-indicator" style={{backgroundColor: lead.statusColor === 'gray' ? '#ccc' : lead.statusColor}}></div>
                <div className="lead-info">
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-email">{lead.email}</div>
                  <div className="lead-date-container">
                    <span className="date-label">date</span>
                    <div className="lead-date">
                      <span>�</span> {lead.date}
                    </div>
                  </div>
                </div>
                <div className="lead-status-and-actions">
                  {/* Type Dropdown */}
                  <div className="type-dropdown-wrapper">
                    <button className="type-btn" style={{background: typeColors[lead.type]}} onClick={() => handleTypeClick(index)}>{lead.type}</button>
                    {typeDropdown === index && (
                      <div className="type-dropdown">
                        <div className="type-label">Type</div>
                        {['Hot', 'Warm', 'Cold'].map(t => (
                          <button key={t} className="type-pill" style={{background: typeColors[t]}} onClick={() => handleTypeSelect(index, t)}>{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Status Ring with Modal */}
                  <div className={`status-ring status-${lead.statusColor}`}
                    onClick={() => lead.status === 'Ongoing' && handleStatusClick(index)}
                    style={{cursor: lead.status === 'Ongoing' ? 'pointer' : 'default'}}
                  >
                    <span>{lead.status}</span>
                  </div>
                  {/* Action Icons */}
                  <div className="action-icons">
                    <button className="icon-btn" onClick={() => handleEditClick(index)}>📝</button>
                    <button className="icon-btn">🕓</button>
                    <button className="icon-btn">✔️</button>
                  </div>
                </div>
                {/* Date/Time Modal */}
                {editModal === index && (
                  <div className="edit-modal">
                    <label>Date<br/>
                      <input type="text" placeholder="dd/mm/yy" value={editDate} onChange={e => setEditDate(e.target.value)} />
                    </label>
                    <label>Time<br/>
                      <input type="text" placeholder="02:30PM" value={editTime} onChange={e => setEditTime(e.target.value)} style={{fontWeight: 'bold', letterSpacing: '2px'}} />
                    </label>
                    <button className="save-btn" onClick={() => handleSave(index)}>Save</button>
                  </div>
                )}
                {/* Lead Status Modal */}
                {statusModal === index && (
                  <div className="status-modal">
                    <label className="status-label">Lead Status <FaInfoCircle className="info-icon" onMouseEnter={() => handleStatusHover(index)} onMouseLeave={handleStatusLeave} /></label>
                    <input type="text" value="Ongoing" disabled className="status-input" />
                    {tooltip === index && (
                      <div className="status-tooltip">Lead can not be closed</div>
                    )}
                    <button className="save-btn" onClick={closeStatusModal}>Save</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeLeads; 