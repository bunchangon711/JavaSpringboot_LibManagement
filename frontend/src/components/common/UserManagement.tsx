import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationDate: string;
}

const UserManagement: React.FC = () => {
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
    if (!editingUser) return;    try {
      // Create update data without password if it's empty
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
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
      password: '', // Don't pre-fill password
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowAddForm(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <h2>👥 User Management</h2>
          <p>Manage library users and their permissions</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn btn-primary"
          disabled={!isAdmin}
        >
          + Add User
        </button>
      </div>

      {/* Add/Edit User Form */}
      {(showAddForm || editingUser) && (
        <div className="form-container">
          <div className="form-header">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          </div>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="password"
                placeholder={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingUser}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={!isAdmin}
              >
                <option value="USER">User</option>
                <option value="LIBRARIAN">Librarian</option>
                {isAdmin && <option value="ADMIN">Admin</option>}
              </select>
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

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => startEdit(user)}
                      className="btn btn-edit"
                      disabled={!isAdmin && user.role === 'ADMIN'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-delete"
                      disabled={!isAdmin || user.id === currentUser?.id}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="no-users">
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
