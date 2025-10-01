import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, ArrowRight, ArrowUp, Menu, X } from 'lucide-react';
import PollutionLeaderboard from './pollutionLeaderboard.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection, { ComplaintForm, FeedbackList } from './blogSection.jsx';
import API from '../api.js';
import Footer from '../components/footer.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#leaderboard', label: 'Leaderboard' },
    { href: '#features', label: 'Features' },
    { href: '#partners', label: 'Partners' },
    { href: '#complaint', label: 'Complaint' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-md shadow-md border-b border-gray-700" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold text-text-light">Beyond Null and Void</span>
          </div>

          {/* Desktop Navigation Links */}
          {/* 🔑 Changed lg:flex to xs:flex */}
          <div className="hidden xs:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="text-text-muted hover:text-accent-blue font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}

            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Create account</span>
              </button>
            )}
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          {/* 🔑 Changed lg:hidden to xs:hidden */}
          <button 
            className="xs:hidden p-2 text-text-light hover:text-accent-blue transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Collapsible) */}
      {/* 🔑 Changed lg:hidden to xs:hidden */}
      <div 
        className={`xs:hidden bg-secondary-dark border-t border-gray-700 transition-all duration-300 ${isMenuOpen ? 'max-h-screen opacity-100 py-2' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="flex flex-col space-y-2 px-4">
          {navLinks.map((link) => (
            <a
              key={`mobile-${link.href}`}
              href={link.href}
              onClick={handleLinkClick}
              className="py-2 text-base font-medium text-text-light hover:text-accent-blue hover:bg-primary-dark rounded-md px-3 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Mobile Auth/Dashboard Button */}
          {isLoggedIn ? (
            <button
              onClick={() => { navigate('/dashboard'); handleLinkClick(); }}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => { navigate('/login'); handleLinkClick(); }}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition"
            >
              <LogIn className="h-5 w-5" />
              <span>Create account</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const MainPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [reversedLeaderboardData, setReversedLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await API.get('/api/leaderboard?page=1&limit=10');
        const cities = res.data.cities;
        setLeaderboardData(cities);
        setReversedLeaderboardData([...cities].reverse());
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleViewTimeline = (city) => {
    console.log(`View timeline for ${city}`);
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">

        {/* Home Section */}
        <section id="home" className="bg-secondary-dark py-24 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center">
            <Droplets className="h-12 w-12 text-accent-blue mx-auto mb-4" />
            <h2 className="text-5xl font-extrabold text-text-light mb-4">Groundwater Analyzer</h2>
            <p className="text-lg text-text-muted mb-6">
              A Smart India Hackathon initiative to monitor, analyze, and act on groundwater pollution across India.
            </p>
            {role && (
              <p className="text-sm text-text-muted mb-4 italic">
                Welcome back, <span className="font-semibold text-accent-blue">{role}</span>!
              </p>
            )}
            <p className="italic text-text-muted text-sm mb-10">
              “From beneath the surface, clarity rises. Let data speak for the water we drink.”
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#leaderboard" className="px-6 py-3 bg-accent-blue text-primary-dark rounded-lg font-medium hover:bg-sky-400/80 transition">View Pollution Rankings</a>
              <a href="#complaint" className="px-6 py-3 bg-primary-dark text-text-light rounded-lg font-medium hover:bg-secondary-dark border border-gray-600 transition">Raise a Concern</a>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {isLoading ? (
            <div className="lg:col-span-2 flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-accent-blue"></div>
            </div>
          ) : error ? (
            <div className="lg:col-span-2 bg-danger/20 text-danger p-4 rounded-md text-center">
              <p>{error}</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="lg:col-span-2 text-center text-text-muted">
              No data available at the moment.
            </div>
          ) : (
            <>
              <PollutionLeaderboard 
                data={leaderboardData} 
                title="Top 10 Least Polluted Cities (HPI)" 
                onViewTimeline={handleViewTimeline}
              />
              <PollutionLeaderboard 
                data={reversedLeaderboardData} 
                title="Top 10 Most Polluted Cities (HPI)" 
                onViewTimeline={handleViewTimeline}
              />
            </>
          )}
        </section>

        {/* App Functionality Section - UPDATED CONTENT */}
        <section id="features" className="bg-primary-dark py-24 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-text-light text-center mb-6">Actionable Insights & Platform Tools</h2>
            <p className="text-center text-text-muted mb-12 max-w-3xl mx-auto">
              Groundwater Analyzer provides a suite of tools built for data transparency, community engagement, and rapid response to pollution threats.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { title: '🧪 Comprehensive Indexing', desc: 'Real-time calculation of HPI, HEI, PLI, and MPI for all submitted samples.' },
                { title: '📍 Location Heatmaps', desc: 'Geospatial visualization of pollution levels to pinpoint affected areas quickly.' },
                { title: '📈 Timeline Analysis', desc: 'Track historical performance and trends for any monitored city over time.' },
                { title: '📄 PDF Report Generation', desc: 'Authenticated users can download comprehensive water quality PDF reports for their data.' },
                { title: '🔐 Secure Role Dashboards', desc: 'Dedicated dashboards ensure data privacy and relevant tools for NGOs and Researchers.' },
                { title: '📤 Bulk CSV Submission', desc: 'Seamless portal for researchers and partners to upload large water sample datasets.' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-secondary-dark p-6 rounded-lg shadow hover:shadow-md transition border border-gray-700">
                  <h3 className="text-xl font-semibold text-accent-blue mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="bg-primary-dark py-20 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-text-light text-center mb-6">Our Partners</h2>
            <p className="text-center text-text-muted mb-10 max-w-2xl mx-auto">
              Collaborating with institutions, NGOs, and researchers to build a cleaner, data-driven future.
            </p>
            <PartnersBoard />
          </div>
        </section>

        {/* Complaint Section */}
        <section id="complaint" className="bg-primary-dark py-20 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-text-light text-center mb-6">Community Voice</h2>
            <p className="text-center text-text-muted mb-10 max-w-2xl mx-auto">
              Submit a concern or see what others are reporting to monitor local issues in real-time.
            </p>
            {/* Grid container for side-by-side layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Complaint Form */}
              <ComplaintForm />
              
              {/* Right Column: Recent Feedback List */}
              <FeedbackList />
            </div>
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-accent-blue text-primary-dark p-3 rounded-full shadow-lg hover:bg-sky-400/80 transition"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      
      <Footer />
    </div>
  );
};

export default MainPage;