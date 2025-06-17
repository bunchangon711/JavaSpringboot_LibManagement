import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import { generateOptimizedImageUrl } from '../../services/cloudinaryService';
import './CheckoutPage.css';

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

const CheckoutPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<{[key: string]: SubscriptionTier}>({});
  const [userFines, setUserFines] = useState<Fine[]>([]);
  const [borrowPeriod, setBorrowPeriod] = useState(14); // Default 14 days
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (bookId && currentUser?.id) {
        await Promise.all([
          fetchBookDetails(),
          fetchUserData()
        ]);
      }
    };
    
    fetchData();
  }, [bookId, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookDetails = async () => {
    try {
      const response = await API.get(`/books/${bookId}`);
      const bookData = response.data;
      setBook(bookData);
      
      // Set default borrow period based on book type or book-specific settings
      if (bookData.loanPeriodDays) {
        setBorrowPeriod(bookData.loanPeriodDays);
      } else {
        setBorrowPeriod(bookData.bookType === 'DIGITAL' ? 7 : 14);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
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
      
      // Fetch user fines
      await fetchUserFines();
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFines = async () => {
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

  const handleBorrowPeriodChange = (days: number) => {
    setBorrowPeriod(days);
  };

  const getMaxBorrowPeriod = () => {
    if (!book) return 14;
    
    if (book.bookType === 'DIGITAL') {
      return 21; // Max 21 days for digital books
    }
    
    // Physical books can vary based on subscription tier
    if (subscription?.tier === 'ANNUAL') {
      return 30;
    } else if (subscription?.tier === 'MONTHLY') {
      return 21;
    }
    
    return 14; // Free tier
  };

  const canProceedWithCheckout = () => {
    if (!book || !subscription) return false;
    
    const totalFines = userFines.reduce((sum, fine) => sum + fine.amount, 0);
    if (totalFines > 0) return false;
    
    if (book.isReference) return false;
    if (book.availableCopies === 0) return false;
    
    // Check subscription limits
    const currentTier = subscriptionTiers[subscription.tier];
    if (currentTier) {
      if (book.bookType === 'PHYSICAL' && subscription.physicalBooksBorrowed >= currentTier.physicalBookLimit) {
        return false;
      }
      if (book.bookType === 'DIGITAL' && currentTier.digitalBookLimit !== 'Unlimited') {
        const digitalLimit = parseInt(currentTier.digitalBookLimit);
        if (subscription.digitalBooksBorrowed >= digitalLimit) {
          return false;
        }
      }
    }
    
    return agreedToTerms;
  };

  const needsUpgrade = () => {
    if (!book || !subscription) return false;
    
    const currentTier = subscriptionTiers[subscription.tier];
    if (currentTier && book.bookType === 'PHYSICAL') {
      return subscription.physicalBooksBorrowed >= currentTier.physicalBookLimit && subscription.tier === 'FREE';
    }
    
    return false;
  };

  const handleCheckout = async () => {
    if (!currentUser?.id || !book || !canProceedWithCheckout()) return;

    setProcessing(true);
    try {
      await API.post('/borrowings', {
        userId: currentUser.id,
        bookId: book.id,
        borrowPeriodDays: borrowPeriod
      });
      
      // Success - redirect to subscription page
      navigate('/my-subscription?tab=borrowings&success=true');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to checkout book';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const calculateDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + borrowPeriod);
    return dueDate.toLocaleDateString();
  };

  const calculateLateFee = () => {
    // $0.50 per day late fee
    return 0.50;
  };

  if (loading) {
    return <div className="checkout-page"><div className="loading">Loading checkout details...</div></div>;
  }

  if (!book) {
    return (
      <div className="checkout-page">
        <div className="error-message">
          <h2>Book not found</h2>
          <button onClick={() => navigate('/books')} className="btn btn-primary">
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const totalFines = userFines.reduce((sum, fine) => sum + fine.amount, 0);
  const maxBorrowPeriod = getMaxBorrowPeriod();
  const currentTier = subscription ? subscriptionTiers[subscription.tier] : null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => navigate(`/books/${bookId}`)} className="back-button">
            ← Back to Book Details
          </button>
          <h1>📅 Checkout</h1>
        </div>

        <div className="checkout-content">
          <div className="book-summary">
            <div className="book-summary-image">
              {book.imageUrl ? (
                <img 
                  src={generateOptimizedImageUrl(book.imageUrl, 200, 300)} 
                  alt={book.title}
                />
              ) : (
                <div className="no-image">📖</div>
              )}
            </div>
            <div className="book-summary-info">
              <h2>{book.title}</h2>
              <p className="author">by {book.author}</p>
              <div className="book-details">
                <p><strong>Type:</strong> {book.bookType || 'Physical'}</p>
                <p><strong>Category:</strong> {book.category}</p>
                {book.location && <p><strong>Location:</strong> {book.location}</p>}
              </div>
            </div>
          </div>

          <div className="checkout-options">
            {/* Subscription Status */}
            {subscription && currentTier && (
              <div className="subscription-status">
                <h3>📋 Your Subscription</h3>
                <div className="tier-info">
                  <div className="tier-name">{currentTier.name} Plan</div>
                  <div className="usage-info">
                    {book.bookType === 'PHYSICAL' ? (
                      <p>
                        Physical Books: {subscription.physicalBooksBorrowed} / {currentTier.physicalBookLimit} used
                      </p>
                    ) : (
                      <p>
                        Digital Books: {subscription.digitalBooksBorrowed} / {currentTier.digitalBookLimit} used
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Warning */}
            {needsUpgrade() && (
              <div className="upgrade-warning">
                <h3>⚠️ Subscription Upgrade Required</h3>
                <p>
                  You've reached your physical book limit for the free tier. 
                  Upgrade to Monthly or Annual plan to borrow more books.
                </p>
                <button 
                  onClick={() => navigate('/my-subscription?tab=upgrade')}
                  className="btn btn-warning"
                >
                  Upgrade Subscription
                </button>
              </div>
            )}

            {/* Fine Warning */}
            {totalFines > 0 && (
              <div className="fine-warning">
                <h3>⚠️ Outstanding Fines</h3>
                <p>You must pay ${totalFines.toFixed(2)} in outstanding fines before borrowing new books.</p>
                <div className="fines-list">
                  {userFines.map((fine, index) => (
                    <div key={index} className="fine-item">
                      <span>{fine.description}</span>
                      <span className="fine-amount">${fine.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/my-subscription')}
                  className="btn btn-warning"
                >
                  Pay Fines
                </button>
              </div>
            )}

            {/* Borrow Period Selection */}
            {totalFines === 0 && !needsUpgrade() && (
              <div className="borrow-period-section">
                <h3>📅 Select Borrow Period</h3>
                <div className="period-options">
                  {[7, 14, 21, maxBorrowPeriod].filter((days, index, arr) => arr.indexOf(days) === index && days <= maxBorrowPeriod).map((days) => (
                    <button
                      key={days}
                      className={`period-option ${borrowPeriod === days ? 'selected' : ''}`}
                      onClick={() => handleBorrowPeriodChange(days)}
                    >
                      {days} days
                      {days === 7 && <span className="period-label">Quick Read</span>}
                      {days === 14 && <span className="period-label">Standard</span>}
                      {days === 21 && <span className="period-label">Extended</span>}
                      {days === 30 && <span className="period-label">Maximum</span>}
                    </button>
                  ))}
                </div>
                
                <div className="checkout-summary">
                  <div className="summary-item">
                    <strong>Borrow Date:</strong> {new Date().toLocaleDateString()}
                  </div>
                  <div className="summary-item">
                    <strong>Due Date:</strong> {calculateDueDate()}
                  </div>
                  <div className="summary-item">
                    <strong>Late Fee:</strong> ${calculateLateFee().toFixed(2)} per day after due date
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            {totalFines === 0 && !needsUpgrade() && (
              <div className="terms-section">
                <div className="terms-checkbox">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />                  <label htmlFor="terms">
                    I agree to the <button type="button" className="link-button" onClick={(e) => e.preventDefault()}>borrowing terms and conditions</button>
                  </label>
                </div>
                
                <div className="terms-list">
                  <h4>Borrowing Terms:</h4>
                  <ul>
                    <li>Books must be returned by the due date to avoid late fees</li>
                    <li>Late fees are ${calculateLateFee().toFixed(2)} per day after the due date</li>
                    <li>Books can be renewed up to 2 times if no one else has reserved them</li>
                    <li>Lost or damaged books will incur replacement costs</li>
                    <li>Outstanding fines must be paid before borrowing additional books</li>
                    {book.bookType === 'DIGITAL' && (
                      <li>Digital books will automatically expire on the due date</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Checkout Actions */}
            <div className="checkout-actions">
              {canProceedWithCheckout() ? (
                <button 
                  onClick={handleCheckout}
                  className="btn btn-primary btn-large"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : '✅ Complete Checkout'}
                </button>
              ) : (
                <button className="btn btn-outline btn-large" disabled>
                  {!agreedToTerms ? 'Please agree to terms' : 'Cannot proceed with checkout'}
                </button>
              )}
              
              <button 
                onClick={() => navigate(`/books/${bookId}`)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
