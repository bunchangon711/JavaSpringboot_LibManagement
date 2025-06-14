import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { uploadImage, generateOptimizedImageUrl } from '../../services/cloudinaryService';
import Pagination from '../common/Pagination';
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
  imageUrl?: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const BooksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
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
  const canManage = isAdmin || isLibrarian;

  useEffect(() => {
    // Check for search query from navbar
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setSearchType('title');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize, searchTerm, searchType]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      let url = '/books/paginated';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: 'title',
        sortDir: 'asc'
      });

      if (searchTerm.trim()) {
        url = '/books/public/search/paginated';
        params.append(searchType, searchTerm);
      }

      const response = await API.get(`${url}?${params}`);
      const pageData: PagedResponse<Book> = response.data;
      
      setBooks(pageData.content);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Fallback to non-paginated endpoint
      try {
        const response = await API.get('/books');
        setBooks(response.data);
        setTotalElements(response.data.length);
        setTotalPages(1);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(0); // Reset to first page
    fetchBooks();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page
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

  const handleBorrowBook = async (bookId: number) => {
    if (!currentUser?.id) return;

    try {
      await API.post('/borrowings', {
        userId: currentUser.id,
        bookId: bookId
      });
      
      fetchBooks(); // Refresh to update available copies
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
    return <div className="books-page"><div className="loading">Loading books...</div></div>;
  }

  return (
    <div className="books-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📚 Book Inventory</h1>
          <div className="header-stats">
            <span className="stat-item">Total: {totalElements} books</span>
          </div>
        </div>
        {canManage && (
          <button 
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
          
          <button onClick={() => { setSearchTerm(''); setCurrentPage(0); }} className="btn btn-outline">
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

            {/* Image Upload Section */}
            <div className="image-upload-section">
              <label>Book Cover Image:</label>
              <div className="image-upload-container">
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img 
                      src={generateOptimizedImageUrl(formData.imageUrl, 120, 160)} 
                      alt="Book cover preview" 
                    />
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
            {searchTerm ? 'No books found matching your search.' : 'No books available in the library.'}
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                {book.imageUrl ? (
                  <img 
                    src={generateOptimizedImageUrl(book.imageUrl)} 
                    alt={book.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTQwSDEwMFYxNjBIMTAwWiIgc3Ryb2tlPSIjOUM5QzlDIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNODAgMTUwSDE4MCIgc3Ryb2tlPSIjOUM5QzlDIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>📚</span>
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="book-content">
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
                    <>
                      <button 
                        onClick={() => startEdit(book)}
                        className="btn btn-secondary btn-sm"
                        disabled={showAddForm || !!editingBook}
                      >
                        Edit
                      </button>
                      <button 
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
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalElements > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          size={pageSize}
          onPageChange={handlePageChange}
          onSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default BooksPage;
