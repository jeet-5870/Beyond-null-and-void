// frontend/src/App.jsx

import React, { useState, useEffect } from 'react'; // 🔑 Import useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/mainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AuthAPI } from './api.js'; // 🔑 Import AuthAPI

// Main application component that sets up routing
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 🔑 NEW State

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Use AuthAPI (which includes the base URL and JWT interceptor) to hit the protected endpoint
        await AuthAPI.get('/verify-token', {
             headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
      } catch (error) {
        // If the token is expired or invalid, clear storage
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkTokenValidity();
  }, []); // Run only on mount

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };
  
  // 🔑 NEW: Render a loading screen while checking auth status
  if (isCheckingAuth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-primary-dark">
            <h1 className="text-xl font-bold text-text-light">Loading...</h1>
        </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;