import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import UserManagement from '../common/UserManagement';
import BookManagement from '../common/BookManagement';
import './AdminDashboard.css';

interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalBorrowings: number;
  availableBooks: number;
}

interface RecentActivity {
  id: number;
  type: 'BORROW' | 'RETURN' | 'USER_REGISTERED' | 'BOOK_ADDED';
  description: string;
  timestamp: string;
  user?: string;
}

type ActiveSection = 'reports' | 'users' | 'books' | 'borrowings';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('reports');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBooks: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
    totalBorrowings: 0,
    availableBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';
  const hasAccess = isAdmin || isLibrarian;

  useEffect(() => {
    if (hasAccess) {
      fetchAdminStats();
      fetchRecentActivity();
    }
  }, [hasAccess]);

  const fetchAdminStats = async () => {
    try {
      const [usersRes, booksRes, borrowingsRes] = await Promise.all([
        API.get('/users'),
        API.get('/books'),
        API.get('/borrowings')
      ]);

      const users = usersRes.data;
      const books = booksRes.data;
      const borrowings = borrowingsRes.data;

      const activeBorrowings = borrowings.filter((b: any) => !b.returnDate).length;
      const overdueBorrowings = borrowings.filter((b: any) => 
        !b.returnDate && new Date(b.dueDate) < new Date()
      ).length;

      setStats({
        totalUsers: users.length,
        totalBooks: books.length,
        activeBorrowings,
        overdueBorrowings,
        totalBorrowings: borrowings.length,
        availableBooks: books.reduce((sum: number, book: any) => sum + book.availableCopies, 0)
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Simulate recent activity for now
      const mockActivity: RecentActivity[] = [
        {
          id: 1,
          type: 'BORROW',
          description: 'Book "The Great Gatsby" borrowed',
          timestamp: new Date().toISOString(),
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'USER_REGISTERED',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Jane Smith'
        },
        {
          id: 3,
          type: 'RETURN',
          description: 'Book "To Kill a Mockingbird" returned',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'Bob Johnson'
        },
        {
          id: 4,
          type: 'BOOK_ADDED',
          description: 'New book "1984" added to inventory',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: 'Admin'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExitDashboard = () => {
    navigate('/');
  };

  const handleNavigation = (section: ActiveSection) => {
    setActiveSection(section);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'BORROW': return '📖';
      case 'RETURN': return '✅';
      case 'USER_REGISTERED': return '👤';
      case 'BOOK_ADDED': return '📚';
      default: return '📝';
    }
  };
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!hasAccess) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={handleExitDashboard} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'reports':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>📊 Reports & Analytics</h2>
              <p>Comprehensive library statistics and reports</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalBooks}</div>
                  <div className="stat-label">Total Books</div>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.activeBorrowings}</div>
                  <div className="stat-label">Active Borrowings</div>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overdueBorrowings}</div>
                  <div className="stat-label">Overdue Books</div>
                </div>
              </div>
            </div>            {/* Charts Placeholder */}
            <div className="charts-grid">
              <div className="chart-container">
                <h3>📊 Borrowing Trends</h3>
                <div className="chart-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📈</div>
                    <p>Chart visualization coming soon</p>
                    <div className="mock-data">
                      <div className="data-row">
                        <span>Jan: 65 borrowed, 45 returned</span>
                      </div>
                      <div className="data-row">
                        <span>Feb: 59 borrowed, 49 returned</span>
                      </div>
                      <div className="data-row">
                        <span>Mar: 80 borrowed, 70 returned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>📚 Book Categories</h3>
                <div className="chart-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🥧</div>
                    <p>Distribution chart coming soon</p>
                    <div className="mock-data">
                      <div className="data-row">Fiction: 35%</div>
                      <div className="data-row">Non-Fiction: 25%</div>
                      <div className="data-row">Science: 20%</div>
                      <div className="data-row">History: 15%</div>
                      <div className="data-row">Biography: 5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                    <div className="activity-content">
                      <div className="activity-description">{activity.description}</div>
                      {activity.user && <div className="activity-user">by {activity.user}</div>}
                      <div className="activity-timestamp">{formatTimestamp(activity.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );      case 'users':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>👥 User Management</h2>
              <p>Manage library users and their accounts</p>
            </div>
            <UserManagement />
          </div>
        );

      case 'books':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>📚 Book Management</h2>
              <p>Manage library books and inventory</p>
            </div>
            <BookManagement />          </div>
        );

      case 'borrowings':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>📋 Borrowing Management</h2>
              <p>Manage all library borrowings and returns</p>
            </div>
            <div className="coming-soon">
              <h3>Borrowing Management Interface Coming Soon</h3>
              <p>This section will contain borrowing management functionality.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h2>📚 Admin</h2>
          </div>
          <div className="admin-info">
            <div className="admin-avatar">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-details">
              <div className="admin-name">{currentUser?.name}</div>
              <div className="admin-role">{currentUser?.role}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavigation('reports')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Reports & Activity</span>
          </button>

          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => handleNavigation('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Manage Users</span>
          </button>

          <button
            className={`nav-item ${activeSection === 'books' ? 'active' : ''}`}
            onClick={() => handleNavigation('books')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Manage Books</span>
          </button>

          <button
            className={`nav-item ${activeSection === 'borrowings' ? 'active' : ''}`}
            onClick={() => handleNavigation('borrowings')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">All Borrowings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleExitDashboard}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Exit Dashboard</span>
          </button>
          
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
