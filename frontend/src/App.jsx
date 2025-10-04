import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import api from './api';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import HistoricalUploadPage from './pages/HistoricalUploadPage';
import AnomaliesPage from './pages/AnomaliesPage';
import HotspotsPage from './pages/HotspotsPage';
import MainPage from './pages/mainPage';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.get('/auth/verify-token');
          setIsLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <Routes>
        <Route path="/" element={!isLoggedIn ? <MainPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!isLoggedIn ? <LoginPage setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/historical-upload" element={isLoggedIn ? <HistoricalUploadPage /> : <Navigate to="/login" />} />
        <Route path="/anomalies" element={isLoggedIn ? <AnomaliesPage /> : <Navigate to="/login" />} />
        <Route path="/hotspots" element={isLoggedIn ? <HotspotsPage /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;