import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, TrendingUp, Handshake, Mail, ArrowRight, BarChart3 } from 'lucide-react';
import PollutionLeaderboard from './pollutionLeaderboard.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection from './blogSection.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import API from '../api.js';

// Reusable Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">E-Cell</span>
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleDashboardClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const MainPage = () => {
  const [safeCitiesData, setSafeCitiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSafeCities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await API.get('/api/samples');
        const safeCities = res.data
          .filter(city => city.classification === 'Safe')
          .sort((a, b) => a.hei - b.hei)
          .slice(0, 10);
        setSafeCitiesData(safeCities);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data for the chart.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafeCities();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Beyond Null and Void</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PollutionLeaderboard />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                <p className="text-xl">Loading chart data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-md mb-8">
                <p className="font-medium text-center">{error}</p>
              </div>
            ) : (
              safeCitiesData.length > 0 && (
                <PollutionChart 
                  data={safeCitiesData} 
                  title="Top 10 Safest Cities by HEI" 
                />
              )
            )}
          </div>
          <div className="lg:col-span-1">
            <PartnersBoard />
            <BlogSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;