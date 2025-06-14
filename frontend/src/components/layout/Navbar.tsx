import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar on login/register pages
  }

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';
  const canManageUsers = isAdmin || isLibrarian;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 Library Management</Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Home</Link>
        <Link to="/books" className="navbar-item">Books</Link>
        <Link to="/my-borrowings" className="navbar-item">My Borrowings</Link>
        
        {canManageUsers && (
          <>
            <Link to="/users" className="navbar-item">Manage Users</Link>
            <Link to="/all-borrowings" className="navbar-item">All Borrowings</Link>
            <Link to="/reports" className="navbar-item">Reports</Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">Welcome, {currentUser?.name}</span>
          <span className="user-role">({currentUser?.role})</span>
        </div>
        <div className="user-actions">
          <Link to="/profile" className="navbar-item">Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
