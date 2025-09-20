import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn } from 'lucide-react';
import PollutionLeaderboard from './pollutionLeaderboard.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection from './blogSection.jsx';

// Reusable Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login');
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">E-Cell</span>
          </div>
          <button
            onClick={handleLoginClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const MainPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Beyond Null and Void</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PollutionLeaderboard />
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
