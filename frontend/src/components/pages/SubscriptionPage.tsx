import React, { useState, useEffect } from 'react';
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

const SubscriptionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<{[key: string]: SubscriptionTier}>({});
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'borrowings' | 'upgrade'>('overview');
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.id) {
        await fetchUserSubscription();
        await fetchTierInfo();
        await fetchBorrowings();
      }
    };
    
    fetchData();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

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
          My Borrowings
        </button>
        <button 
          className={`tab ${activeTab === 'upgrade' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade')}
        >
          Upgrade Plan
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
