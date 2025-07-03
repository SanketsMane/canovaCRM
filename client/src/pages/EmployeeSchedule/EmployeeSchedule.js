import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeSchedule.css';

const scheduleData = [
  {
    type: 'Referral',
    phone: '949-365-6533',
    date: '10/04/25',
    callType: 'Call',
    person: 'Brooklyn Williamson',
    highlighted: true,
  },
  {
    type: 'Referral',
    phone: '365-865-8854',
    date: '10/04/25',
    callType: 'Call',
    person: 'Julie Watson',
    highlighted: false,
  },
  {
    type: 'Cold call',
    phone: '654-692-8895',
    date: '10/04/25',
    callType: 'Call',
    person: 'Jenny Alexander',
    highlighted: false,
  },
];

const EmployeeSchedule = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('Today');
  const filterRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const handleFilterSave = () => setFilterOpen(false);

  return (
    <div className="employee-schedule-page">
      <nav className="employee-nav">
        <div className="nav-item" onClick={() => navigate('/employee-home')}>
          <p>🏠</p>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/employee-leads')}>
          <p>👥</p>
          <span>Leads</span>
        </div>
        <div className="nav-item active" onClick={() => navigate('/employee-schedule')}>
          <p>📅</p>
          <span>Schedule</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/employee-profile')}>
          <p>👤</p>
          <span>Profile</span>
        </div>
      </nav>
      <main className="schedule-main-content">
        <div className="header-blue">
          <div className="logo">CanovaCRM</div>
          <div className="page-title">
            <button className="back-btn" onClick={() => navigate(-1)}>{'<'}</button>
            <h1>Schedule</h1>
          </div>
        </div>
        <div className="schedule-list-container">
          <div className="search-container">
            <input type="text" placeholder="Search" />
            <button className="filter-btn" onClick={() => setFilterOpen(v => !v)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {filterOpen && (
              <div className="filter-modal" ref={filterRef}>
                <div className="filter-label">Filter</div>
                <div className="filter-select-wrapper">
                  <select className="filter-select" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="All">All</option>
                  </select>
                </div>
                <button className="filter-save-btn" onClick={handleFilterSave}>Save</button>
              </div>
            )}
          </div>
          <div className="schedule-list">
            {scheduleData.map((item, index) => (
              <div key={index} className={`schedule-card ${item.highlighted ? 'highlighted' : ''}`}>
                <div className="card-header">
                  <span className="type">{item.type}</span>
                  <span className="date-label">Date</span>
                </div>
                <div className="card-body">
                  <span className="phone">{item.phone}</span>
                  <span className="date-value">{item.date}</span>
                </div>
                <div className="card-footer">
                  <div className="call-info">
                    <span>📍</span> {item.callType}
                  </div>
                  <div className="person-info">
                    <span>👩‍💼</span> {item.person}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeSchedule; 