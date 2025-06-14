import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
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

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
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
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Welcome, <strong>{currentUser?.name}</strong>! Manage your library system from here.</p>
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

        <div className="stat-card secondary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalBorrowings}</div>
            <div className="stat-label">Total Borrowings</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.availableBooks}</div>
            <div className="stat-label">Available Copies</div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="admin-actions">
        <h2>Management Tools</h2>
        <div className="actions-grid">
          <Link to="/users" className="action-card admin">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <div className="action-title">Manage Users</div>
              <div className="action-description">Add, edit, or remove users from the system</div>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/all-borrowings" className="action-card admin">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <div className="action-title">All Borrowings</div>
              <div className="action-description">View and manage all book borrowings</div>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/reports" className="action-card admin">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <div className="action-title">Reports</div>
              <div className="action-description">Generate detailed library reports</div>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/books" className="action-card admin">
            <div className="action-icon">📚</div>
            <div className="action-content">
              <div className="action-title">Manage Books</div>
              <div className="action-description">Add, edit, or remove books from inventory</div>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="no-activity">No recent activity</div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                <div className="activity-content">
                  <div className="activity-description">{activity.description}</div>
                  {activity.user && <div className="activity-user">by {activity.user}</div>}
                  <div className="activity-timestamp">{formatTimestamp(activity.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
