import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';
import BooksPage from './components/pages/BooksPage';
import BookDetailsPage from './components/pages/BookDetailsPage';
import CheckoutPage from './components/pages/CheckoutPage';
import ProfilePage from './components/pages/ProfilePage';
import SubscriptionPage from './components/pages/SubscriptionPage';
import AdminDashboard from './components/pages/AdminDashboard';
import './App.css';

// Placeholder components for remaining routes
const AllBorrowings = () => <div>All Borrowings Management - Coming Soon</div>;
const Reports = () => <div>Reports Page - Coming Soon</div>;
const Unauthorized = () => (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h2>Access Denied</h2>
    <p>You don't have permission to access this page.</p>
  </div>
);

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/admin-dashboard', '/login', '/register'];
  
  if (hideFooterRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Footer />;
};

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
              <Route path="/unauthorized" element={<Unauthorized />} />              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:bookId" element={<BookDetailsPage />} />
                <Route path="/checkout/:bookId" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-subscription" element={<SubscriptionPage />} />
              </Route>{/* Protected routes with specific role requirements */}
              <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'LIBRARIAN']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                {/* <Route path="/users" element={<UsersPage />} /> */}
                <Route path="/all-borrowings" element={<AllBorrowings />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
                {/* Redirect any unmatched routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ConditionalFooter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
