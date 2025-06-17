import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import './BorrowingManagement.css';

interface Borrowing {
  id: number;
  userId: number;
  bookId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  fineAmount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  book: {
    id: number;
    title: string;
    author: string;
    isbn: string;
  };
}

interface BorrowingStats {
  total: number;
  active: number;
  overdue: number;
  returned: number;
  totalFines: number;
}

const BorrowingManagement: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('borrowDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<BorrowingStats>({
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0,
    totalFines: 0
  });
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/borrowings');
      const borrowingsData = response.data;
      
      // Calculate stats
      const stats: BorrowingStats = {
        total: borrowingsData.length,
        active: borrowingsData.filter((b: Borrowing) => !b.returnDate).length,
        overdue: borrowingsData.filter((b: Borrowing) => 
          !b.returnDate && new Date(b.dueDate) < new Date()
        ).length,
        returned: borrowingsData.filter((b: Borrowing) => b.returnDate).length,
        totalFines: borrowingsData.reduce((sum: number, b: Borrowing) => sum + (b.fineAmount || 0), 0)
      };
      
      setStats(stats);
      setBorrowings(borrowingsData);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };
  const filterAndSortBorrowings = useCallback(() => {
    let filtered = [...borrowings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(borrowing =>
        borrowing.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.book.isbn.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE') {
        filtered = filtered.filter(borrowing => !borrowing.returnDate);
      } else if (statusFilter === 'OVERDUE') {
        filtered = filtered.filter(borrowing => 
          !borrowing.returnDate && new Date(borrowing.dueDate) < new Date()
        );
      } else if (statusFilter === 'RETURNED') {
        filtered = filtered.filter(borrowing => borrowing.returnDate);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'borrowDate':
          aValue = new Date(a.borrowDate);
          bValue = new Date(b.borrowDate);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'userName':
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case 'bookTitle':
          aValue = a.book.title.toLowerCase();
          bValue = b.book.title.toLowerCase();
          break;
        case 'fineAmount':
          aValue = a.fineAmount || 0;
          bValue = b.fineAmount || 0;
          break;
        default:
          aValue = a.borrowDate;
          bValue = b.borrowDate;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });    setFilteredBorrowings(filtered);
  }, [borrowings, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortBorrowings();
  }, [filterAndSortBorrowings]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateFine = (dueDate: string): number => {
    const daysOverdue = calculateDaysOverdue(dueDate);
    return daysOverdue * 0.50; // $0.50 per day late fee
  };

  const getStatusBadge = (borrowing: Borrowing) => {
    if (borrowing.returnDate) {
      return <span className="status-badge returned">Returned</span>;
    } else if (new Date(borrowing.dueDate) < new Date()) {
      return <span className="status-badge overdue">Overdue</span>;
    } else {
      return <span className="status-badge active">Active</span>;
    }
  };

  const handleReturnBook = async () => {
    if (!selectedBorrowing) return;

    try {
      await API.put(`/borrowings/${selectedBorrowing.id}/return`, {
        returnDate: new Date().toISOString(),
        notes: returnNotes
      });
      
      setShowReturnModal(false);
      setSelectedBorrowing(null);
      setReturnNotes('');
      fetchBorrowings(); // Refresh the list
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Error processing return. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading borrowings...</div>;
  }

  return (
    <div className="borrowing-management">
      <div className="content-header">
        <h2>📋 All Borrowings Management</h2>
        <p>Manage all library borrowings, returns, and track overdue items</p>
      </div>

      {/* Statistics Cards */}
      <div className="borrowing-stats">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Borrowings</div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Currently Borrowed</div>
          </div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Overdue Items</div>
          </div>
        </div>

        <div className="stat-card returned">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.returned}</div>
            <div className="stat-label">Returned</div>
          </div>
        </div>

        <div className="stat-card fines">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalFines)}</div>
            <div className="stat-label">Total Fines</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="borrowing-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by user name, email, book title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Currently Borrowed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="borrowDate">Borrow Date</option>
            <option value="dueDate">Due Date</option>
            <option value="userName">User Name</option>
            <option value="bookTitle">Book Title</option>
            <option value="fineAmount">Fine Amount</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Borrowings Table */}
      <div className="borrowings-table-container">
        <table className="borrowings-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('userName')} className="sortable">
                User {sortBy === 'userName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('bookTitle')} className="sortable">
                Book {sortBy === 'bookTitle' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('borrowDate')} className="sortable">
                Borrow Date {sortBy === 'borrowDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('dueDate')} className="sortable">
                Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Return Date</th>
              <th>Status</th>
              <th onClick={() => handleSort('fineAmount')} className="sortable">
                Fine {sortBy === 'fineAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBorrowings.map((borrowing) => {
              const isOverdue = !borrowing.returnDate && new Date(borrowing.dueDate) < new Date();
              const currentFine = isOverdue ? calculateFine(borrowing.dueDate) : (borrowing.fineAmount || 0);
              
              return (
                <tr key={borrowing.id} className={isOverdue ? 'overdue-row' : ''}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{borrowing.user.name}</div>
                      <div className="user-email">{borrowing.user.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="book-info">
                      <div className="book-title">{borrowing.book.title}</div>
                      <div className="book-author">by {borrowing.book.author}</div>
                      <div className="book-isbn">ISBN: {borrowing.book.isbn}</div>
                    </div>
                  </td>
                  <td>{formatDate(borrowing.borrowDate)}</td>
                  <td className={isOverdue ? 'overdue-date' : ''}>
                    {formatDate(borrowing.dueDate)}
                    {isOverdue && (
                      <div className="overdue-days">
                        {calculateDaysOverdue(borrowing.dueDate)} days overdue
                      </div>
                    )}
                  </td>
                  <td>
                    {borrowing.returnDate ? formatDate(borrowing.returnDate) : '-'}
                  </td>
                  <td>{getStatusBadge(borrowing)}</td>
                  <td className={currentFine > 0 ? 'fine-amount' : ''}>
                    {formatCurrency(currentFine)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!borrowing.returnDate && (
                        <button
                          onClick={() => {
                            setSelectedBorrowing(borrowing);
                            setShowReturnModal(true);
                          }}
                          className="btn-return"
                        >
                          Process Return
                        </button>
                      )}
                      <button className="btn-details">View Details</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredBorrowings.length === 0 && (
          <div className="no-results">
            <p>No borrowings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedBorrowing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Process Book Return</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="return-info">
                <p><strong>Book:</strong> {selectedBorrowing.book.title}</p>
                <p><strong>User:</strong> {selectedBorrowing.user.name}</p>
                <p><strong>Due Date:</strong> {formatDate(selectedBorrowing.dueDate)}</p>
                
                {new Date(selectedBorrowing.dueDate) < new Date() && (
                  <div className="overdue-info">
                    <p className="overdue-warning">
                      ⚠️ This book is {calculateDaysOverdue(selectedBorrowing.dueDate)} days overdue
                    </p>
                    <p className="fine-info">
                      Fine: {formatCurrency(calculateFine(selectedBorrowing.dueDate))}
                    </p>
                  </div>
                )}
              </div>

              <div className="return-notes">
                <label htmlFor="returnNotes">Return Notes (Optional):</label>
                <textarea
                  id="returnNotes"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Add any notes about the condition of the book or return process..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowReturnModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnBook}
                className="btn-confirm"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingManagement;
