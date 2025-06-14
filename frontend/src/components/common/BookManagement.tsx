import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import { uploadImage, generateOptimizedImageUrl } from '../../services/cloudinaryService';

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
  imageUrl?: string;
}

const BookManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationDate: '',
    publisher: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    imageUrl: ''
  });

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'LIBRARIAN';
  const canManageBooks = isAdmin || isLibrarian;
  useEffect(() => {
    const fetchBooksWithSearch = async () => {
      try {
        setLoading(true);
        let url = '/books';
        if (searchTerm) {
          url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        const response = await API.get(url);
        setBooks(response.data.content || response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksWithSearch();
  }, [searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = '/books';
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await API.get(url);
      setBooks(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const result = await uploadImage(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      return '';
    } finally {
      setUploading(false);
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
      availableCopies: 1,
      imageUrl: ''
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
      availableCopies: book.availableCopies,
      imageUrl: book.imageUrl || ''
    });
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setShowAddForm(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="book-management">
      <div className="management-header">
        <div className="header-content">
          <h2>📚 Book Management</h2>
          <p>Manage library book inventory</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn btn-primary"
            disabled={!canManageBooks}
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Add/Edit Book Form */}
      {(showAddForm || editingBook) && (
        <div className="form-container">
          <div className="form-header">
            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
          </div>
          <form onSubmit={editingBook ? handleUpdateBook : handleAddBook}>
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
            
            <div className="image-upload-section">
              <label>Book Cover Image:</label>
              {formData.imageUrl && (
                <div className="current-image">
                  <img src={generateOptimizedImageUrl(formData.imageUrl, 100, 150)} alt="Book cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, imageUrl: ''})}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = await handleImageUpload(file);
                    if (imageUrl) {
                      setFormData({...formData, imageUrl});
                    }
                  }
                }}
                disabled={uploading}
              />
              {uploading && <div className="upload-progress">Uploading...</div>}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
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
            <p>No books found.</p>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                {book.imageUrl ? (
                  <img 
                    src={generateOptimizedImageUrl(book.imageUrl, 200, 300)} 
                    alt={book.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book.png';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">📚</div>
                )}
              </div>
              
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-details">ISBN: {book.isbn}</p>
                <p className="book-details">Category: {book.category}</p>
                <p className="book-details">Publisher: {book.publisher}</p>
                <p className="book-details">
                  Publication: {new Date(book.publicationDate).toLocaleDateString()}
                </p>
                
                <div className="book-availability">
                  <span className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    {book.availableCopies}/{book.totalCopies} Available
                  </span>
                </div>
                
                {canManageBooks && (
                  <div className="book-actions">
                    <button
                      onClick={() => startEdit(book)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookManagement;
