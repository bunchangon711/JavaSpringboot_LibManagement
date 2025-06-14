import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

// Placeholder components for the routes
const Home = () => <div>Home Page</div>;
const Books = () => <div>Books Page</div>;
const Users = () => <div>Users Page</div>;
const Borrowings = () => <div>Borrowings Page</div>;
const Unauthorized = () => <div>You don't have permission to access this page</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
          </Route>
            {/* Protected routes with specific role requirements */}
          <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'LIBRARIAN']} />}>
            <Route path="/users" element={<Users />} />
            <Route path="/borrowings" element={<Borrowings />} />
          </Route>
          
          {/* Redirect any unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
