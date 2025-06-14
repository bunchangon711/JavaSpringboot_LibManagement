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

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  imageUrl?: string;
}

const HomePage: React.FC = () => {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    totalBorrowings: 0,
    overdueBooks: 0
  });  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
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
      }      // Get some recent books for display
      setRecentBooks(booksResponse.data.slice(0, 6));
      
      // Get popular books (for now, just books with high availability as a proxy)
      const sortedBooks = [...booksResponse.data]
        .filter(book => book.availableCopies > 0)
        .sort((a, b) => b.availableCopies - a.availableCopies)
        .slice(0, 3);
      setPopularBooks(sortedBooks);
      
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
      </div>      {/* Popular Books Banner */}
      <div className="popular-books-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2>📚 Popular Books This Month</h2>
            <p>Discover the most borrowed books in our library</p>
            <Link to="/books" className="banner-cta">
              Browse All Books →
            </Link>
          </div>
          <div className="banner-books">
            {popularBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="banner-book">
                <div className="book-cover">
                  {book.imageUrl ? (
                    <img 
                      src={book.imageUrl} 
                      alt={book.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                  ) : null}
                  <div className="book-placeholder" style={{display: book.imageUrl ? 'none' : 'flex'}}>
                    📖
                  </div>
                </div>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="navigation-section">
        <div className="nav-cards">
          <Link to="/books" className="nav-card primary">
            <div className="card-icon">📖</div>
            <h3>Browse Books</h3>
            <p>Search through our entire collection</p>
          </Link>
          
          <Link to="/my-borrowings" className="nav-card secondary">
            <div className="card-icon">�</div>
            <h3>My Borrowings</h3>
            <p>Track your borrowed books</p>
          </Link>

          {canManage && (
            <Link to="/admin-dashboard" className="nav-card admin">
              <div className="card-icon">⚙️</div>
              <h3>Admin Dashboard</h3>
              <p>Manage library operations</p>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Books Section */}
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
