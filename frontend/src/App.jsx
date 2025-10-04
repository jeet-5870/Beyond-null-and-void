import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import API, { AuthAPI } from './api.js';
import Dashboard from './pages/Dashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HistoricalUploadPage from './pages/HistoricalUploadPage.jsx';
import AnomaliesPage from './pages/AnomaliesPage.jsx';
import HotspotsPage from './pages/HotspotsPage.jsx';
import MainPage from './pages/mainPage.jsx';
import Navbar from './components/Navbar.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext.jsx';

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
        await AuthAPI.get('/verify-token');
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
    <ThemeProvider>
      <Router>
        <Navbar />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="/historical-upload" element={<HistoricalUploadPage />} />
          <Route path="/anomalies" element={isAuthenticated ? <AnomaliesPage /> : <Navigate to="/login" />} />
          <Route path="/hotspots" element={isAuthenticated ? <HotspotsPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;