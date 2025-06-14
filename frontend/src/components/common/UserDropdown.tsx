import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UserDropdown.css';

interface UserDropdownProps {
  userInfo: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  isAdmin?: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userInfo, onLogout, isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button className="user-dropdown-trigger" onClick={toggleDropdown}>
        <div className="user-avatar">
          {userInfo.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{userInfo.name}</span>
          <span className="user-role">({userInfo.role})</span>
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </button>      {isOpen && (
        <div className="dropdown-menu">
          <Link 
            to="/profile" 
            className="dropdown-item"
            onClick={handleItemClick}
          >
            <span className="dropdown-icon">👤</span>
            Profile
          </Link>
          {isAdmin && (
            <Link 
              to="/admin-dashboard" 
              className="dropdown-item"
              onClick={handleItemClick}
            >
              <span className="dropdown-icon">⚙️</span>
              Admin Dashboard
            </Link>
          )}
          <button 
            className="dropdown-item logout-item"
            onClick={() => {
              handleItemClick();
              onLogout();
            }}
          >
            <span className="dropdown-icon">🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
