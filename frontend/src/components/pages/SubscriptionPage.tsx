import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import './SubscriptionPage.css';

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

interface Borrowing {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    bookType: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  isReturned: boolean;
  fine: number | null;
  renewalCount: number;
  maxRenewals: number;
}

interface PaymentInfo {
  id: number;
  paymentMethod: string;
  isActive: boolean;
  isDefault: boolean;
  displayInfo: string;
  maskedAccountInfo: string;
  isExpired?: boolean;
}

const SubscriptionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<{[key: string]: SubscriptionTier}>({});
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'borrowings' | 'upgrade' | 'payment'>('overview');  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.id) {
        await fetchUserSubscription();
        await fetchTierInfo();
        await fetchBorrowings();
        await fetchPaymentInfo();
      }
    };
    
    fetchData();
    
    // Handle URL parameters
    const tab = searchParams.get('tab') as 'overview' | 'borrowings' | 'upgrade' | 'payment';
    if (tab && ['overview', 'borrowings', 'upgrade', 'payment'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Show success message if redirected from checkout
    const success = searchParams.get('success');
    if (success === 'true') {
      setTimeout(() => {
        alert('Book checked out successfully! You can view your borrowed books below.');
      }, 500);
    }
  }, [currentUser, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserSubscription = async () => {
    try {
      const response = await API.get(`/subscriptions/user/${currentUser?.id}`);
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchTierInfo = async () => {
    try {
      const tierNames = ['FREE', 'MONTHLY', 'ANNUAL'];
      const tierData: {[key: string]: SubscriptionTier} = {};
      
      for (const tier of tierNames) {
        const response = await API.get(`/subscriptions/tier-info/${tier}`);
        tierData[tier] = response.data;
      }
      
      setTiers(tierData);
    } catch (error) {
      console.error('Error fetching tier info:', error);
    }
  };
  const fetchBorrowings = async () => {
    try {
      const response = await API.get(`/borrowings/user/${currentUser?.id}`);
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await API.get(`/payment-info/user/${currentUser?.id}`);
      setPaymentInfo(response.data);
    } catch (error) {
      console.error('Error fetching payment info:', error);
      // Payment info might not exist, which is fine
      setPaymentInfo(null);
    }
  };

  const handleUpgrade = async (newTier: string) => {
    if (!currentUser?.id) return;

    try {
      await API.put('/subscriptions/upgrade', {
        userId: currentUser.id,
        tier: newTier
      });
      
      fetchUserSubscription();
      alert(`Successfully upgraded to ${tiers[newTier]?.name} plan!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upgrade subscription';
      alert(errorMessage);
    }
  };

  const handleRenewBook = async (borrowingId: number) => {
    try {
      await API.put(`/borrowings/${borrowingId}/renew`);
      fetchBorrowings();
      alert('Book renewed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to renew book';
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = () => {
    if (!subscription?.endDate) return null;
    const now = new Date();
    const expiryDate = new Date(subscription.endDate);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getActiveBorrowings = () => {
    return borrowings.filter(b => !b.isReturned);
  };

  const getPhysicalBorrowings = () => {
    return getActiveBorrowings().filter(b => b.book.bookType === 'PHYSICAL');
  };

  const getDigitalBorrowings = () => {
    return getActiveBorrowings().filter(b => b.book.bookType === 'DIGITAL');
  };

  if (loading) {
    return <div className="subscription-page"><div className="loading">Loading...</div></div>;
  }

  const currentTier = subscription ? tiers[subscription.tier] : null;
  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="subscription-page">
      <div className="page-header">
        <h1>📋 My Library Subscription</h1>
        <div className="header-info">
          <span className="user-name">Welcome, {currentUser?.name}</span>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'borrowings' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrowings')}
        >
          Book inventory
        </button>        <button 
          className={`tab ${activeTab === 'upgrade' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade')}
        >
          Upgrade Plan
        </button>
        <button 
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment Info
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-tab">
          {subscription && currentTier && (
            <div className="current-plan">
              <div className="plan-header">
                <h2>Current Plan: {currentTier.name}</h2>
                <div className={`plan-status ${subscription.isActive ? 'active' : 'inactive'}`}>
                  {subscription.isActive ? '✅ Active' : '❌ Inactive'}
                </div>
              </div>
              
              <div className="plan-details">
                <div className="plan-info">
                  <h3>Plan Details</h3>
                  <p><strong>Price:</strong> ${currentTier.price}/month</p>
                  <p><strong>Description:</strong> {currentTier.description}</p>
                  <p><strong>Benefits:</strong> {currentTier.benefits}</p>
                  <p><strong>Start Date:</strong> {formatDate(subscription.startDate)}</p>
                  {subscription.endDate && (
                    <p><strong>End Date:</strong> {formatDate(subscription.endDate)}</p>
                  )}
                  {daysUntilExpiry !== null && (
                    <p className={`expiry-warning ${daysUntilExpiry <= 7 ? 'urgent' : ''}`}>
                      <strong>Days until expiry:</strong> {daysUntilExpiry} days
                    </p>
                  )}
                </div>

                <div className="usage-stats">
                  <h3>Current Usage</h3>
                  <div className="usage-item">
                    <span>Physical Books:</span>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{
                          width: `${Math.min(100, (subscription.physicalBooksBorrowed / currentTier.physicalBookLimit) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span>{subscription.physicalBooksBorrowed} / {currentTier.physicalBookLimit}</span>
                  </div>
                  
                  <div className="usage-item">
                    <span>Digital Books:</span>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{
                          width: currentTier.digitalBookLimit === 'Unlimited' ? '0%' : 
                                 `${Math.min(100, (subscription.digitalBooksBorrowed / parseInt(currentTier.digitalBookLimit)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span>{subscription.digitalBooksBorrowed} / {currentTier.digitalBookLimit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'borrowings' && (
        <div className="borrowings-tab">
          <h2>My Borrowed Books</h2>
          
          {getActiveBorrowings().length === 0 ? (
            <div className="no-borrowings">
              <p>You don't have any active borrowings.</p>
            </div>
          ) : (
            <div className="borrowings-sections">
              {getPhysicalBorrowings().length > 0 && (
                <div className="borrowing-section">
                  <h3>📚 Physical Books ({getPhysicalBorrowings().length})</h3>
                  <div className="borrowings-list">
                    {getPhysicalBorrowings().map((borrowing) => (
                      <div key={borrowing.id} className="borrowing-card">
                        <div className="book-info">
                          <h4>{borrowing.book.title}</h4>
                          <p>by {borrowing.book.author}</p>
                        </div>
                        <div className="borrowing-details">
                          <p><strong>Borrowed:</strong> {formatDate(borrowing.borrowDate)}</p>
                          <p><strong>Due:</strong> {formatDate(borrowing.dueDate)}</p>
                          <p><strong>Renewals:</strong> {borrowing.renewalCount}/{borrowing.maxRenewals}</p>
                          {borrowing.fine && borrowing.fine > 0 && (
                            <p className="fine"><strong>Fine:</strong> ${borrowing.fine.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="borrowing-actions">
                          {borrowing.renewalCount < borrowing.maxRenewals && (
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleRenewBook(borrowing.id)}
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getDigitalBorrowings().length > 0 && (
                <div className="borrowing-section">
                  <h3>💻 Digital Books ({getDigitalBorrowings().length})</h3>
                  <div className="borrowings-list">
                    {getDigitalBorrowings().map((borrowing) => (
                      <div key={borrowing.id} className="borrowing-card digital">
                        <div className="book-info">
                          <h4>{borrowing.book.title}</h4>
                          <p>by {borrowing.book.author}</p>
                        </div>
                        <div className="borrowing-details">
                          <p><strong>Downloaded:</strong> {formatDate(borrowing.borrowDate)}</p>
                          <p><strong>Access until:</strong> {formatDate(borrowing.dueDate)}</p>
                        </div>
                        <div className="borrowing-actions">
                          <button className="btn btn-primary">Read Online</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>      )}

      {activeTab === 'payment' && (
        <div className="payment-tab">
          <h2>Payment Information</h2>
          
          {paymentInfo ? (
            <div className="payment-info-container">
              <div className="current-payment-method">
                <div className="payment-header">
                  <h3>Current Payment Method</h3>
                  <div className={`payment-status ${paymentInfo.isActive ? 'active' : 'inactive'}`}>
                    {paymentInfo.isActive ? '✅ Active' : '❌ Inactive'}
                  </div>
                </div>
                
                <div className="payment-details">
                  <div className="payment-method-card">
                    <div className="method-icon">
                      {paymentInfo.paymentMethod === 'BANK_ACCOUNT' && '🏦'}
                      {paymentInfo.paymentMethod === 'PAYPAL' && '💙'}
                      {paymentInfo.paymentMethod === 'STRIPE' && '💳'}
                    </div>
                    <div className="method-info">
                      <h4>
                        {paymentInfo.paymentMethod === 'BANK_ACCOUNT' && 'Bank Account'}
                        {paymentInfo.paymentMethod === 'PAYPAL' && 'PayPal'}
                        {paymentInfo.paymentMethod === 'STRIPE' && 'Credit/Debit Card'}
                      </h4>
                      <p className="masked-info">{paymentInfo.maskedAccountInfo}</p>
                      <p className="display-info">{paymentInfo.displayInfo}</p>
                      {paymentInfo.isExpired && (
                        <p className="expired-warning">⚠️ This payment method has expired</p>
                      )}
                    </div>
                    <div className="method-actions">
                      <button className="btn btn-secondary btn-sm">Update</button>
                      {paymentInfo.isActive ? (
                        <button className="btn btn-warning btn-sm">Deactivate</button>
                      ) : (
                        <button className="btn btn-primary btn-sm">Reactivate</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="payment-actions-section">
                <h3>Manage Payment Methods</h3>
                <div className="payment-options">
                  <button className="btn btn-outline">Change Payment Method</button>
                  <button className="btn btn-outline">Add Backup Method</button>
                  <button className="btn btn-danger-outline">Remove Payment Info</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-payment-info">
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No Payment Information</h3>
                <p>Add a payment method to continue with paid subscriptions and process automatic renewals.</p>
                
                <div className="add-payment-section">
                  <h4>Choose a Payment Method:</h4>
                  <div className="payment-method-options">
                    <div className="payment-option-card">
                      <div className="option-icon">🏦</div>
                      <div className="option-info">
                        <h5>Bank Account</h5>
                        <p>Direct bank transfer (ACH)</p>
                        <small>• Low fees • Secure • 1-3 business days</small>
                      </div>
                      <button className="btn btn-outline">Add Bank Account</button>
                    </div>
                    
                    <div className="payment-option-card">
                      <div className="option-icon">💙</div>
                      <div className="option-info">
                        <h5>PayPal</h5>
                        <p>PayPal account payment</p>
                        <small>• Instant • Buyer protection • Global</small>
                      </div>
                      <button className="btn btn-outline">Connect PayPal</button>
                    </div>
                    
                    <div className="payment-option-card">
                      <div className="option-icon">💳</div>
                      <div className="option-info">
                        <h5>Credit/Debit Card</h5>
                        <p>Visa, Mastercard, American Express</p>
                        <small>• Instant • Widely accepted • Rewards</small>
                      </div>
                      <button className="btn btn-outline">Add Card</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="payment-security-info">
            <h3>🔒 Security & Privacy</h3>
            <div className="security-features">
              <div className="security-item">
                <span className="security-icon">🛡️</span>
                <div>
                  <strong>Bank-level encryption</strong>
                  <p>All payment data is encrypted using industry-standard SSL/TLS protocols.</p>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">🔐</span>
                <div>
                  <strong>PCI DSS Compliant</strong>
                  <p>We meet the highest standards for handling payment card information.</p>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">👁️</span>
                <div>
                  <strong>No data storage</strong>
                  <p>We don't store full card numbers or sensitive banking details on our servers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upgrade' && (
        <div className="upgrade-tab">
          <h2>Upgrade Your Plan</h2>
          <div className="tier-comparison">
            {Object.entries(tiers).map(([tierKey, tier]) => (
              <div 
                key={tierKey} 
                className={`tier-card ${subscription?.tier === tierKey ? 'current' : ''}`}
              >
                <div className="tier-header">
                  <h3>{tier.name}</h3>
                  <div className="tier-price">
                    ${tier.price}
                    {tierKey !== 'FREE' && <span>/month</span>}
                  </div>
                </div>
                
                <div className="tier-features">
                  <p>{tier.description}</p>
                  <ul>
                    <li>Physical books: {tier.physicalBookLimit}</li>
                    <li>Digital books: {tier.digitalBookLimit}</li>
                  </ul>
                  <p className="tier-benefits">{tier.benefits}</p>
                </div>
                
                <div className="tier-action">
                  {subscription?.tier === tierKey ? (
                    <button className="btn btn-current" disabled>
                      Current Plan
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleUpgrade(tierKey)}
                    >
                      {tierKey === 'FREE' ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            ))}          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="payment-tab">
          <h2>Payment Information</h2>
          
          {paymentInfo ? (
            <div className="payment-info-container">
              <div className="current-payment-method">
                <div className="payment-header">
                  <h3>Current Payment Method</h3>
                  <div className={`payment-status ${paymentInfo.isActive ? 'active' : 'inactive'}`}>
                    {paymentInfo.isActive ? '✅ Active' : '❌ Inactive'}
                  </div>
                </div>
                
                <div className="payment-method-card">
                  <div className="method-icon">
                    {paymentInfo.paymentMethod === 'BANK_ACCOUNT' && '🏦'}
                    {paymentInfo.paymentMethod === 'PAYPAL' && '💰'}
                    {paymentInfo.paymentMethod === 'STRIPE' && '💳'}
                  </div>
                  
                  <div className="method-info">
                    <h4>
                      {paymentInfo.paymentMethod === 'BANK_ACCOUNT' && 'Bank Account'}
                      {paymentInfo.paymentMethod === 'PAYPAL' && 'PayPal'}
                      {paymentInfo.paymentMethod === 'STRIPE' && 'Credit/Debit Card'}
                    </h4>
                    <p className="masked-info">{paymentInfo.maskedAccountInfo}</p>
                    <p>Added: {formatDate(paymentInfo.displayInfo)}</p>
                    {paymentInfo.isExpired && (
                      <p className="expired-warning">⚠️ This payment method has expired</p>
                    )}
                  </div>
                  
                  <div className="method-actions">
                    <button className="btn btn-secondary btn-sm">Update</button>
                    {paymentInfo.isActive ? (
                      <button className="btn btn-warning btn-sm">Deactivate</button>
                    ) : (
                      <button className="btn btn-primary btn-sm">Activate</button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="payment-actions-section">
                <h3>Payment Actions</h3>
                <div className="payment-options">
                  <button className="btn btn-outline">Update Payment Method</button>
                  <button className="btn btn-outline">Add Backup Method</button>
                  <button className="btn btn-danger-outline">Remove Payment Method</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-payment-info">
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No Payment Method Added</h3>
                <p>
                  To enjoy premium features and maintain your subscription, please add a payment method. 
                  All payment information is securely encrypted and protected.
                </p>
                
                <div className="add-payment-section">
                  <h4>Choose Your Payment Method</h4>
                  <div className="payment-method-options">
                    <div className="payment-option-card">
                      <div className="option-icon">🏦</div>
                      <div className="option-info">
                        <h5>Bank Account</h5>
                        <p>Direct bank transfer (ACH)</p>
                        <small>Low fees, 1-3 business days processing</small>
                        <button className="btn btn-outline btn-sm">Add Bank Account</button>
                      </div>
                    </div>
                    
                    <div className="payment-option-card">
                      <div className="option-icon">💰</div>
                      <div className="option-info">
                        <h5>PayPal</h5>
                        <p>Use your PayPal account</p>
                        <small>Instant processing, PayPal fees apply</small>
                        <button className="btn btn-outline btn-sm">Connect PayPal</button>
                      </div>
                    </div>
                    
                    <div className="payment-option-card">
                      <div className="option-icon">💳</div>
                      <div className="option-info">
                        <h5>Credit/Debit Card</h5>
                        <p>Visa, Mastercard, American Express</p>
                        <small>Instant processing, secure via Stripe</small>
                        <button className="btn btn-outline btn-sm">Add Card</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="payment-security-info">
            <h3>🔒 Your Payment Security</h3>
            <div className="security-features">
              <div className="security-item">
                <div className="security-icon">🛡️</div>
                <div>
                  <strong>256-bit SSL Encryption</strong>
                  <p>All payment data is encrypted using industry-standard SSL encryption protocols.</p>
                </div>
              </div>
              
              <div className="security-item">
                <div className="security-icon">🏅</div>
                <div>
                  <strong>PCI DSS Compliant</strong>
                  <p>We meet the highest security standards for handling payment card information.</p>
                </div>
              </div>
              
              <div className="security-item">
                <div className="security-icon">🔐</div>
                <div>
                  <strong>No Stored Card Details</strong>
                  <p>We never store your full payment details on our servers. All sensitive data is tokenized.</p>
                </div>
              </div>
              
              <div className="security-item">
                <div className="security-icon">📱</div>
                <div>
                  <strong>Two-Factor Authentication</strong>
                  <p>Additional security layer for payment method changes and sensitive operations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
