// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/mainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HistoricalUploadPage from './pages/HistoricalUploadPage.jsx'; // Import the new page
import { AuthAPI } from './api.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        await AuthAPI.get('/verify-token', {
             headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkTokenValidity();
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };
  
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
        {/* Add the new public route */}
        <Route path="/historical-upload" element={<HistoricalUploadPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;