import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import UserDropdown from '../common/UserDropdown';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  if (!isAuthenticated) {
    return null; // Don't show navbar on login/register pages
  }

  // Hide navbar on admin dashboard
  if (location.pathname === '/admin-dashboard') {
    return null;
  }
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 Library Management</Link>
      </div>        <div className="navbar-menu">
        <Link to="/" className="navbar-item">Home</Link>
        <Link to="/books" className="navbar-item">Books</Link>
        <Link to="/my-borrowings" className="navbar-item">My Borrowings</Link>
      </div>

      <div className="navbar-search">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>
      </div>      <div className="navbar-user">
        <UserDropdown 
          userInfo={{
            name: currentUser?.name || '',
            role: currentUser?.role || ''
          }}
          onLogout={handleLogout}
          isAdmin={isAdmin || isLibrarian}
        />
      </div>
    </nav>
  );
};

export default Navbar;
