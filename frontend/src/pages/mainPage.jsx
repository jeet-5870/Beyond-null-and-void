import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, TrendingUp, Handshake, Mail, ArrowRight } from 'lucide-react';
import PollutionLeaderboard from './pollutionLeaderboard.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection from './blogSection.jsx';
import API from '../api.js';
import { Card, CardHeader, CardContent } from '../components/card.jsx';

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
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch data sorted by increasing pollution
        const res = await API.get('/api/leaderboard?page=1&limit=10');
        setLeaderboardData(res.data.cities);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const reversedLeaderboardData = [...leaderboardData].reverse();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Beyond Null and Void</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="lg:col-span-2 flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="lg:col-span-2 bg-red-100 text-red-800 p-4 rounded-md text-center">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="lg:col-span-1">
                <PollutionLeaderboard 
                  data={leaderboardData} 
                  title="Top 10 Least Polluted Cities (HPI)" 
                />
              </div>
              <div className="lg:col-span-1">
                <PollutionLeaderboard 
                  data={reversedLeaderboardData}
                  title="Top 10 Most Polluted Cities (HPI)"
                />
              </div>
            </>
          )}
        </div>
        <div className="lg:grid lg:grid-cols-2 gap-8 mt-8">
          <div className="lg:col-span-1">
            <PartnersBoard />
          </div>
          <div className="lg:col-span-1">
            <BlogSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;