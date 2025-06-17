import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import { generateOptimizedImageUrl } from '../../services/cloudinaryService';
import './BookDetailsPage.css';

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
  callNumber?: string;
  location?: string;
  description?: string;
  isReference?: boolean;
  loanPeriodDays?: number;
  bookType?: string;
}

interface Subscription {
  id: number;
  tier: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  autoRenew: boolean;
  physicalBooksBorrowed: number;
  digitalBooksBorrowed: number;
}

interface SubscriptionTier {
  name: string;
  price: number;
  physicalBookLimit: number;
  digitalBookLimit: string;
  description: string;
  benefits: string;
}

interface Fine {
  amount: number;
  description: string;
  dueDate: string;
}

const BookDetailsPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<{[key: string]: SubscriptionTier}>({});
  const [userFines, setUserFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (bookId) {
        await fetchBookDetails();
        await fetchUserData();
      }
    };
    
    fetchData();
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookDetails = async () => {
    try {
      const response = await API.get(`/books/${bookId}`);
      const bookData = response.data;
      setBook(bookData);
      
      // Fetch related books in the same category
      if (bookData.category) {
        fetchRelatedBooks(bookData.category, bookData.id);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  const fetchRelatedBooks = async (category: string, excludeBookId: number) => {
    try {
      const response = await API.get(`/books`, {
        params: {
          category: category,
          page: 0,
          size: 6
        }
      });
      
      // Filter out the current book
      const related = response.data.content?.filter((b: Book) => b.id !== excludeBookId) || [];
      setRelatedBooks(related.slice(0, 5));
    } catch (error) {
      console.error('Error fetching related books:', error);
    }
  };

  const fetchUserData = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Fetch user subscription
      const subResponse = await API.get(`/subscriptions/user/${currentUser.id}`);
      setSubscription(subResponse.data);
      
      // Fetch subscription tiers
      const tierNames = ['FREE', 'MONTHLY', 'ANNUAL'];
      const tierData: {[key: string]: SubscriptionTier} = {};
      
      for (const tier of tierNames) {
        const response = await API.get(`/subscriptions/tier-info/${tier}`);
        tierData[tier] = response.data;
      }
      setSubscriptionTiers(tierData);
      
      // Fetch user fines (placeholder - would be real API call)
      fetchUserFines();
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFines = async () => {
    // Placeholder for fine fetching - in real implementation this would be an API call
    try {
      const borrowingsResponse = await API.get(`/borrowings/user/${currentUser?.id}`);
      const borrowings = borrowingsResponse.data;
      
      const fines: Fine[] = [];
      for (const borrowing of borrowings) {
        if (!borrowing.isReturned && borrowing.fine && borrowing.fine > 0) {
          fines.push({
            amount: borrowing.fine,
            description: `Late return: ${borrowing.book.title}`,
            dueDate: borrowing.dueDate
          });
        }
      }
      setUserFines(fines);
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleBorrowBook = async () => {
    if (!currentUser?.id || !book) return;

    // Check subscription limits before borrowing
    if (subscription && book.bookType === 'PHYSICAL') {
      const currentTier = subscriptionTiers[subscription.tier];
      if (currentTier && subscription.physicalBooksBorrowed >= currentTier.physicalBookLimit) {
        if (subscription.tier === 'FREE') {
          // Redirect to subscription page for upgrade
          navigate('/my-subscription?tab=upgrade');
          return;
        } else {
          alert('You have reached your physical book borrowing limit for this subscription tier.');
          return;
        }
      }
    }

    setBorrowing(true);
    try {
      await API.post('/borrowings', {
        userId: currentUser.id,
        bookId: book.id
      });
      
      alert('Book borrowed successfully!');
      navigate('/my-subscription?tab=borrowings');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to borrow book';
      alert(errorMessage);
    } finally {
      setBorrowing(false);
    }
  };

  const handleCheckout = () => {
    navigate(`/checkout/${bookId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBookStatusInfo = () => {
    if (!book) return null;
    
    if (book.isReference) {
      return { status: 'reference', message: 'Reference only - cannot be borrowed', color: 'orange' };
    }
    
    if (book.availableCopies === 0) {
      return { status: 'unavailable', message: 'Currently unavailable', color: 'red' };
    }
    
    return { status: 'available', message: `${book.availableCopies} of ${book.totalCopies} available`, color: 'green' };
  };

  if (loading) {
    return <div className="book-details-page"><div className="loading">Loading book details...</div></div>;
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="error-message">
          <h2>Book not found</h2>
          <button onClick={() => navigate('/books')} className="btn btn-primary">
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getBookStatusInfo();
  const canBorrow = !book.isReference && book.availableCopies > 0;
  const totalFines = userFines.reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Back to Catalog
        </button>

        <div className="book-details-content">
          <div className="book-image-section">
            <div className="book-image-container">
              {book.imageUrl ? (
                <img 
                  src={generateOptimizedImageUrl(book.imageUrl, 400, 600)} 
                  alt={book.title}
                  className="book-image"
                />
              ) : (
                <div className="no-image">📖</div>
              )}
            </div>
          </div>

          <div className="book-info-section">
            <div className="book-header">
              <h1>{book.title}</h1>
              <h2 className="author">by {book.author}</h2>
              
              <div className={`availability-status ${statusInfo?.status}`}>
                <span className="status-indicator" style={{ backgroundColor: statusInfo?.color }}></span>
                {statusInfo?.message}
              </div>
            </div>

            <div className="book-meta">
              <div className="meta-grid">
                <div className="meta-item">
                  <strong>ISBN:</strong> {book.isbn}
                </div>
                <div className="meta-item">
                  <strong>Publisher:</strong> {book.publisher}
                </div>
                <div className="meta-item">
                  <strong>Publication Date:</strong> {formatDate(book.publicationDate)}
                </div>
                <div className="meta-item">
                  <strong>Category:</strong> {book.category}
                </div>
                <div className="meta-item">
                  <strong>Type:</strong> {book.bookType || 'Physical'}
                </div>
                {book.callNumber && (
                  <div className="meta-item">
                    <strong>Call Number:</strong> {book.callNumber}
                  </div>
                )}
                {book.location && (
                  <div className="meta-item">
                    <strong>Location:</strong> {book.location}
                  </div>
                )}
                {book.loanPeriodDays && (
                  <div className="meta-item">
                    <strong>Loan Period:</strong> {book.loanPeriodDays} days
                  </div>
                )}
              </div>
            </div>

            {book.description && (
              <div className="book-description">
                <h3>Description</h3>
                <p>{book.description}</p>
              </div>
            )}

            {/* Fine Warning */}
            {totalFines > 0 && (
              <div className="fine-warning">
                <h3>⚠️ Outstanding Fines</h3>
                <p>You have ${totalFines.toFixed(2)} in outstanding fines that must be paid before borrowing new books.</p>
                <div className="fines-list">
                  {userFines.map((fine, index) => (
                    <div key={index} className="fine-item">
                      <span>{fine.description}</span>
                      <span className="fine-amount">${fine.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="book-actions">
              {canBorrow && totalFines === 0 ? (
                <div className="action-buttons">
                  <button 
                    onClick={handleCheckout}
                    className="btn btn-primary btn-large"
                    disabled={borrowing}
                  >
                    📅 Checkout
                  </button>
                  <button 
                    onClick={handleBorrowBook}
                    className="btn btn-secondary btn-large"
                    disabled={borrowing}
                  >
                    {borrowing ? 'Borrowing...' : '📚 Quick Borrow'}
                  </button>
                </div>
              ) : (
                <div className="unavailable-actions">
                  {book.isReference && (
                    <button className="btn btn-outline" disabled>
                      Reference Only
                    </button>
                  )}
                  {book.availableCopies === 0 && (
                    <button className="btn btn-outline" disabled>
                      Currently Unavailable
                    </button>
                  )}
                  {totalFines > 0 && (
                    <button 
                      onClick={() => navigate('/my-subscription')}
                      className="btn btn-warning"
                    >
                      Pay Fines to Borrow
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="related-books-section">
            <h3>Related Books in {book.category}</h3>
            <div className="related-books-grid">
              {relatedBooks.map((relatedBook) => (
                <div 
                  key={relatedBook.id} 
                  className="related-book-card"
                  onClick={() => navigate(`/books/${relatedBook.id}`)}
                >
                  <div className="related-book-image">
                    {relatedBook.imageUrl ? (
                      <img 
                        src={generateOptimizedImageUrl(relatedBook.imageUrl, 150, 200)} 
                        alt={relatedBook.title}
                      />
                    ) : (
                      <div className="no-image">📖</div>
                    )}
                  </div>
                  <div className="related-book-info">
                    <h4>{relatedBook.title}</h4>
                    <p>{relatedBook.author}</p>
                    <div className={`availability ${relatedBook.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                      {relatedBook.availableCopies > 0 ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;
