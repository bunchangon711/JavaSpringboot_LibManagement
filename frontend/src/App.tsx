import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import HomePage from './components/pages/HomePage';
import BooksPage from './components/pages/BooksPage';
import ProfilePage from './components/pages/ProfilePage';
import UsersPage from './components/pages/UsersPage';
import './App.css';

// Placeholder components for remaining routes
const MyBorrowings = () => <div>My Borrowings Page - Coming Soon</div>;
const AllBorrowings = () => <div>All Borrowings Management - Coming Soon</div>;
const Reports = () => <div>Reports Page - Coming Soon</div>;
const Unauthorized = () => (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h2>Access Denied</h2>
    <p>You don't have permission to access this page.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-borrowings" element={<MyBorrowings />} />
              </Route>
              
              {/* Protected routes with specific role requirements */}
              <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'LIBRARIAN']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/all-borrowings" element={<AllBorrowings />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
              
              {/* Redirect any unmatched routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
