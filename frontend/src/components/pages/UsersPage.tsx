import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';
import './UsersPage.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationDate: string;
}

const UsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      setShowAddForm(false);
      resetForm();
      fetchUsers();
      alert('User added successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add user';
      alert(errorMessage);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await API.put(`/users/${editingUser.id}`, updateData);
      setEditingUser(null);
      resetForm();
      fetchUsers();
      alert('User updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await API.delete(`/users/${userId}`);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER'
    });
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowAddForm(false);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'LIBRARIAN': return 'role-librarian';
      default: return 'role-user';
    }
  };

  if (loading) {
    return <div className="users-page"><div className="loading">Loading users...</div></div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || !!editingUser}
        >
          + Add New User
        </button>
      </div>

      {/* Add/Edit User Form */}
      {(showAddForm || editingUser) && (
        <div className="form-section">
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="user-form">
            <div className="form-row">
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password {editingUser && '(Leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                  disabled={!isAdmin} // Only admin can change roles
                >
                  <option value="USER">User</option>
                  <option value="LIBRARIAN">Librarian</option>
                  {isAdmin && <option value="ADMIN">Admin</option>}
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="users-section">
        <h3>All Users ({users.length})</h3>
        
        {users.length === 0 ? (
          <div className="no-users">
            No users found.
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Email</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Joined</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {users.map((user) => (
              <div key={user.id} className="table-row">
                <div className="table-cell user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    {user.id === currentUser?.id && (
                      <div className="current-user-badge">You</div>
                    )}
                  </div>
                </div>
                
                <div className="table-cell">{user.email}</div>
                
                <div className="table-cell">
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="table-cell">{formatDate(user.registrationDate)}</div>
                
                <div className="table-cell actions">
                  <button 
                    onClick={() => startEdit(user)}
                    className="btn btn-secondary btn-sm"
                    disabled={showAddForm || !!editingUser}
                  >
                    Edit
                  </button>
                  
                  {user.id !== currentUser?.id && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-danger btn-sm"
                      disabled={showAddForm || !!editingUser}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
