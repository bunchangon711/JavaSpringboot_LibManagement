import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import './BooksPage.css';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  publisher: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

const BooksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationDate: '',
    publisher: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1
  });

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';
  const canManage = isAdmin || isLibrarian;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchBooks();
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/books/public/search?${searchType}=${encodeURIComponent(searchTerm)}`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId: number) => {
    if (!currentUser?.id) return;

    try {
      await API.post('/borrowings', {
        userId: currentUser.id,
        bookId: bookId
      });
      
      // Refresh books list to update available copies
      fetchBooks();
      alert('Book borrowed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to borrow book';
      alert(errorMessage);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/books', formData);
      setShowAddForm(false);
      resetForm();
      fetchBooks();
      alert('Book added successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add book';
      alert(errorMessage);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      await API.put(`/books/${editingBook.id}`, formData);
      setEditingBook(null);
      resetForm();
      fetchBooks();
      alert('Book updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update book';
      alert(errorMessage);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await API.delete(`/books/${bookId}`);
      fetchBooks();
      alert('Book deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete book';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publicationDate: '',
      publisher: '',
      category: '',
      totalCopies: 1,
      availableCopies: 1
    });
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationDate: book.publicationDate,
      publisher: book.publisher,
      category: book.category,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies
    });
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setShowAddForm(false);
    resetForm();
  };

  if (loading) {
    return <div className="books-page"><div className="loading">Loading books...</div></div>;
  }

  return (
    <div className="books-page">
      <div className="page-header">
        <h1>📚 Book Inventory</h1>
        {canManage && (          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || !!editingBook}
          >
            + Add New Book
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-controls">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-select"
          >
            <option value="title">Search by Title</option>
            <option value="author">Search by Author</option>
            <option value="category">Search by Category</option>
          </select>
          
          <input
            type="text"
            placeholder={`Enter ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <button onClick={handleSearch} className="btn btn-secondary">
            Search
          </button>
          
          <button onClick={() => { setSearchTerm(''); fetchBooks(); }} className="btn btn-outline">
            Clear
          </button>
        </div>
      </div>

      {/* Add/Edit Book Form */}
      {(showAddForm || editingBook) && (
        <div className="form-section">
          <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={editingBook ? handleUpdateBook : handleAddBook} className="book-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                required
              />
              <input
                type="date"
                placeholder="Publication Date"
                value={formData.publicationDate}
                onChange={(e) => setFormData({...formData, publicationDate: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({...formData, publisher: e.target.value})}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            
            <div className="form-row">
              <input
                type="number"
                placeholder="Total Copies"
                value={formData.totalCopies}
                onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                min="1"
                required
              />
              <input
                type="number"
                placeholder="Available Copies"
                value={formData.availableCopies}
                onChange={(e) => setFormData({...formData, availableCopies: parseInt(e.target.value)})}
                min="0"
                max={formData.totalCopies}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingBook ? 'Update Book' : 'Add Book'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Grid */}
      <div className="books-grid">
        {books.length === 0 ? (
          <div className="no-books">
            {searchTerm ? 'No books found matching your search.' : 'No books available in the library.'}
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-header">
                <h3 className="book-title">{book.title}</h3>
                <div className="book-availability">
                  {book.availableCopies > 0 ? (
                    <span className="available">Available ({book.availableCopies})</span>
                  ) : (
                    <span className="unavailable">Not Available</span>
                  )}
                </div>
              </div>
              
              <div className="book-details">
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>ISBN:</strong> {book.isbn}</p>
                <p><strong>Publisher:</strong> {book.publisher}</p>
                <p><strong>Category:</strong> {book.category}</p>
                <p><strong>Total Copies:</strong> {book.totalCopies}</p>
              </div>
              
              <div className="book-actions">
                {book.availableCopies > 0 && (
                  <button 
                    onClick={() => handleBorrowBook(book.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Borrow Book
                  </button>
                )}
                
                {canManage && (
                  <>                    <button 
                      onClick={() => startEdit(book)}
                      className="btn btn-secondary btn-sm"
                      disabled={showAddForm || !!editingBook}
                    >
                      Edit
                    </button>                    <button 
                      onClick={() => handleDeleteBook(book.id)}
                      className="btn btn-danger btn-sm"
                      disabled={showAddForm || !!editingBook}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BooksPage;
