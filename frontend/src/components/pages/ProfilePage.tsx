import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationDate: string;
}

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const fetchProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await API.get(`/users/${currentUser.id}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const fetchMyBorrowings = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await API.get(`/borrowings/user/${currentUser.id}`);
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  }, [currentUser?.id]);

  const fetchMyReservations = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await API.get(`/reservations/user/${currentUser.id}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchProfile();
    fetchMyBorrowings();
    fetchMyReservations();
  }, [fetchProfile, fetchMyBorrowings, fetchMyReservations]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      // Only include password if user wants to change it
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      await API.put(`/users/${currentUser?.id}`, updateData);
      setEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      await fetchProfile(); // Refresh profile data
      alert('Profile updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      alert(errorMessage);
    }
  };

  const handleReturnBook = async (borrowingId: number) => {
    try {
      await API.put(`/borrowings/${borrowingId}/return`);
      fetchMyBorrowings(); // Refresh borrowings
      alert('Book returned successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to return book';
      alert(errorMessage);
    }
  };

  const handleRenewBook = async (borrowingId: number) => {
    if (!currentUser?.id) return;
    
    try {
      await API.put(`/borrowings/${borrowingId}/renew/user/${currentUser.id}`);
      fetchMyBorrowings(); // Refresh borrowings
      alert('Book renewed successfully! New due date has been set.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to renew book';
      alert(errorMessage);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!currentUser?.id) return;
    
    try {
      await API.delete(`/reservations/${reservationId}/user/${currentUser.id}`);
      fetchMyReservations(); // Refresh reservations
      alert('Reservation cancelled successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel reservation';
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !borrowings.find(b => b.dueDate === dueDate)?.isReturned;
  };

  if (loading) {
    return <div className="profile-page"><div className="loading">Loading profile...</div></div>;
  }

  if (!profile) {
    return <div className="profile-page"><div className="error">Failed to load profile</div></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowings')}
          >
            Borrow history
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            My Reservations
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-info">
              <div className="user-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h2>{profile.name}</h2>
                <p className="user-email">{profile.email}</p>
                <p className="user-role">Role: <span className="role-badge">{profile.role}</span></p>
                <p className="user-since">Member since: {formatDate(profile.registrationDate)}</p>
              </div>
            </div>

            {!editing ? (
              <div className="profile-actions">
                <button 
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="edit-form">
                <h3>Edit Profile</h3>
                
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="password-section">
                  <h4>Change Password (Optional)</h4>
                  
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name,
                        email: profile.email,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'borrowings' && (
        <div className="borrowings-content">
          <h3>My Borrowed Books</h3>
          
          {borrowings.length === 0 ? (
            <div className="no-borrowings">
              <p>You haven't borrowed any books yet.</p>
            </div>
          ) : (
            <div className="borrowings-list">
              {borrowings.map((borrowing) => (
                <div key={borrowing.id} className={`borrowing-card ${borrowing.isReturned ? 'returned' : isOverdue(borrowing.dueDate) ? 'overdue' : 'active'}`}>
                  <div className="borrowing-header">
                    <h4>{borrowing.book.title}</h4>
                    <div className="borrowing-status">
                      {borrowing.isReturned ? (
                        <span className="status returned">Returned</span>
                      ) : isOverdue(borrowing.dueDate) ? (
                        <span className="status overdue">Overdue</span>
                      ) : (
                        <span className="status active">Active</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="borrowing-details">
                    <p><strong>Author:</strong> {borrowing.book.author}</p>
                    <p><strong>Borrowed:</strong> {formatDate(borrowing.borrowDate)}</p>
                    <p><strong>Due Date:</strong> {formatDate(borrowing.dueDate)}</p>
                    {borrowing.returnDate && (
                      <p><strong>Returned:</strong> {formatDate(borrowing.returnDate)}</p>
                    )}
                    {borrowing.fine > 0 && (
                      <p className="fine"><strong>Fine:</strong> ${borrowing.fine.toFixed(2)}</p>
                    )}
                  </div>
                  
                  {!borrowing.isReturned && (
                    <div className="borrowing-actions">
                      <button 
                        onClick={() => handleReturnBook(borrowing.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Return Book
                      </button>
                      <button 
                        onClick={() => handleRenewBook(borrowing.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        Renew Book
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="reservations-content">
          <h3>My Book Reservations</h3>
          
          {reservations.length === 0 ? (
            <div className="no-reservations">
              <p>You have no active reservations.</p>
            </div>
          ) : (
            <div className="reservations-list">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="reservation-card">                  <div className="reservation-details">
                    <h4>{reservation.book.title}</h4>
                    <p><strong>Author:</strong> {reservation.book.author}</p>
                    <p><strong>Reserved On:</strong> {formatDate(reservation.reservationDate)}</p>
                    <p><strong>Status:</strong> <span className={`status ${reservation.status.toLowerCase()}`}>{reservation.status}</span></p>
                    {reservation.queuePosition && (
                      <p><strong>Queue Position:</strong> #{reservation.queuePosition}</p>
                    )}
                    {reservation.expiryDate && (
                      <p><strong>Valid Until:</strong> {formatDate(reservation.expiryDate)}</p>
                    )}
                  </div>
                  
                  {reservation.isActive && (
                    <div className="reservation-actions">
                      <button 
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
