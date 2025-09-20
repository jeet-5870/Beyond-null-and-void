import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn } from 'lucide-react';

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
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">E-Cell</span>
          </div>
          {/* Login Button */}
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

// Main Landing Page Component
const FrontPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        {/* Hero Section */}
        <div className="pt-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
            Empowering the Next Generation of Founders
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            The Entrepreneurship Cell is a student-run body dedicated to fostering innovation and entrepreneurial spirit among students.
          </p>
          <button
            onClick={handleLoginClick}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        {/* Feature Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full">
          <div className="bg-gray-50 rounded-lg p-6 shadow-md transition-all hover:shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Event Check-in</h3>
            <p className="text-gray-600">Quick and seamless entry to all E-Cell events with our QR-based system.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow-md transition-all hover:shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Startup Showcase</h3>
            <p className="text-gray-600">Explore and connect with groundbreaking startups and our successful alumni network.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow-md transition-all hover:shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dynamic Sponsor Wall</h3>
            <p className="text-gray-600">Showcase your support with dynamic badges on a dedicated page for our sponsors.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FrontPage;
