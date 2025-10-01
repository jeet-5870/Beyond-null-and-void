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
    // 🔑 UPDATED Navbar to dark theme
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-md shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold text-text-light">Groundwater Analyzer</span>
          </div>
          {/* Login Button */}
          <button
            onClick={handleLoginClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Login / Sign Up</span>
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
    // 🔑 UPDATED background to dark theme
    <div className="min-h-screen bg-primary-dark text-text-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        {/* Hero Section */}
        <div className="pt-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-light leading-tight mb-4">
            Monitor, Analyze, <span className="text-accent-blue">Act.</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
            The Groundwater Analyzer is a Smart India Hackathon initiative to bring clarity to India's water quality through community data and smart indexing.
          </p>
          <button
            onClick={handleLoginClick}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition-all transform hover:scale-105"
          >
            Get Started with Dashboard
          </button>
        </div>

        {/* Feature Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full">
          {/* 🔑 UPDATED feature card styles */}
          <div className="bg-secondary-dark rounded-lg p-6 shadow-md transition-all hover:shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-accent-blue mb-2">Real-time HPI</h3>
            <p className="text-text-muted">Instantly calculate the Heavy Metal Pollution Index upon data submission.</p>
          </div>
          <div className="bg-secondary-dark rounded-lg p-6 shadow-md transition-all hover:shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-accent-blue mb-2">Role-based Access</h3>
            <p className="text-text-muted">Tailored views for NGOs, researchers, and general users to fit their needs.</p>
          </div>
          <div className="bg-secondary-dark rounded-lg p-6 shadow-md transition-all hover:shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-accent-blue mb-2">Location Mapping</h3>
            <p className="text-text-muted">Visualize all pollution data geographically using a live map interface.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FrontPage;