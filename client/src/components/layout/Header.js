import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="search-container">
        <input type="text" placeholder="Search here..." />
      </div>
    </header>
  );
};

export default Header; 