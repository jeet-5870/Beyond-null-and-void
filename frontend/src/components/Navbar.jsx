import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-primary-dark/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold text-gray-800 dark:text-text-light">Beyond Null and Void</span>
          </div>

          <div className="hidden xs:flex items-center space-x-6">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-text-muted hover:bg-gray-100 dark:hover:bg-primary-dark">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-text-muted hover:text-accent-blue font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}

            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Create account</span>
              </button>
            )}
          </div>

          <button
            className="xs:hidden p-2 text-gray-800 dark:text-text-light hover:text-accent-blue transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={`xs:hidden bg-gray-50 dark:bg-secondary-dark border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${isMenuOpen ? 'max-h-screen opacity-100 py-2' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="flex flex-col space-y-2 px-4">
          {navLinks.map((link) => (
            <a
              key={`mobile-${link.href}`}
              href={link.href}
              onClick={handleLinkClick}
              className="py-2 text-base font-medium text-gray-800 dark:text-text-light hover:text-accent-blue hover:bg-gray-100 dark:hover:bg-primary-dark rounded-md px-3 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <button
              onClick={() => { navigate('/dashboard'); handleLinkClick(); }}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-semibold rounded-lg text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => { navigate('/login'); handleLinkClick(); }}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-semibold rounded-lg text-white dark:text-primary-dark bg-sky-500 dark:bg-accent-blue hover:bg-sky-600 dark:hover:bg-sky-400/80 transition"
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

export default Navbar;