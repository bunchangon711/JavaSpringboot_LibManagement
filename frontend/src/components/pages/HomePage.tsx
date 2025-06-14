import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import './HomePage.css';

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalBorrowings: number;
  overdueBooks: number;
}

const HomePage: React.FC = () => {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    totalBorrowings: 0,
    overdueBooks: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';
  const canManage = isAdmin || isLibrarian;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [booksResponse, availableBooksResponse] = await Promise.all([
        API.get('/books'),
        API.get('/books/available')
      ]);

      if (canManage) {
        const [borrowingsResponse, overdueResponse] = await Promise.all([
          API.get('/borrowings'),
          API.get('/borrowings/overdue')
        ]);
        
        setStats({
          totalBooks: booksResponse.data.length,
          availableBooks: availableBooksResponse.data.length,
          totalBorrowings: borrowingsResponse.data.length,
          overdueBooks: overdueResponse.data.length
        });
      } else {
        setStats({
          totalBooks: booksResponse.data.length,
          availableBooks: availableBooksResponse.data.length,
          totalBorrowings: 0,
          overdueBooks: 0
        });
      }

      // Get some recent books for display
      setRecentBooks(booksResponse.data.slice(0, 6));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);    }
  }, [canManage]);  useEffect(() => {
    // Only fetch data when authentication is complete and user is authenticated
    if (!authLoading && currentUser && isAuthenticated) {
      fetchDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      // If not authenticated and auth loading is complete, reset loading state
      setLoading(false);
    }
  }, [authLoading, currentUser, isAuthenticated, fetchDashboardData]);
  if (authLoading || loading) {
    return (
      <div className="homepage">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="hero-section">
        <h1>Welcome to the Library Management System</h1>
        <p>Hello, <strong>{currentUser?.name}</strong>! Manage your library resources efficiently.</p>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{stats.totalBooks}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.availableBooks}</div>
          <div className="stat-label">Available Books</div>
        </div>
        {canManage && (
          <>
            <div className="stat-card">
              <div className="stat-number">{stats.totalBorrowings}</div>
              <div className="stat-label">Active Borrowings</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-number">{stats.overdueBooks}</div>
              <div className="stat-label">Overdue Books</div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/books" className="action-card">
            <div className="action-icon">📖</div>
            <div className="action-title">Browse Books</div>
            <div className="action-description">Search and view available books</div>
          </Link>
          
          <Link to="/my-borrowings" className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-title">My Borrowings</div>
            <div className="action-description">View your borrowed books and due dates</div>
          </Link>

          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-title">My Profile</div>
            <div className="action-description">Update your profile information</div>
          </Link>

          {canManage && (
            <>
              <Link to="/users" className="action-card admin">
                <div className="action-icon">👥</div>
                <div className="action-title">Manage Users</div>
                <div className="action-description">Add, edit, or remove users</div>
              </Link>

              <Link to="/reports" className="action-card admin">
                <div className="action-icon">📊</div>
                <div className="action-title">Reports</div>
                <div className="action-description">View library statistics and reports</div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Books */}
      <div className="recent-books">
        <h2>Recent Books in Library</h2>
        <div className="books-grid">
          {recentBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-title">{book.title}</div>
              <div className="book-author">by {book.author}</div>
              <div className="book-category">{book.category}</div>
              <div className="book-availability">
                {book.availableCopies > 0 ? (
                  <span className="available">Available ({book.availableCopies})</span>
                ) : (
                  <span className="unavailable">Not Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {recentBooks.length === 0 && (
          <p className="no-books">No books available in the library.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
