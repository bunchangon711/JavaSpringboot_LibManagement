import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state or default to home page
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required');
      return;
    }
    
    try {
      await login(username, password);
      // Redirect to the page the user was trying to access
      navigate(from, { replace: true });
    } catch (err) {
      // Error is already handled in AuthContext
      console.error('Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Library Management System</h2>
      
      {/* Display error messages */}
      {(formError || error) && (
        <div className="error-message">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="login-footer">
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
