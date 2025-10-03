import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-primary-dark text-gray-600 dark:text-text-light py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-sm text-gray-500 dark:text-text-muted hover:text-accent-blue transition-colors">About Us</a>
          <a href="#" className="text-sm text-gray-500 dark:text-text-muted hover:text-accent-blue transition-colors">Privacy Policy</a>
          <a href="#complaint" className="text-sm text-gray-500 dark:text-text-muted hover:text-accent-blue transition-colors">Raise a Concern</a>
        </div>

        {/* Project Identity */}
        <p className="text-sm font-semibold text-gray-600 dark:text-text-muted">
          &copy; 2024 <span className="text-accent-blue">Groundwater Analyzer</span> — A Smart India Hackathon Initiative
        </p>

        {/* Tagline */}
        <p className="mt-2 text-xs text-gray-500 dark:text-text-muted/70 italic">
          Empowering communities through data, clarity, and clean water.
        </p>

        {/* Acknowledgment */}
        <p className="mt-2 text-xs text-gray-400 dark:text-text-muted/50">
          Built with purpose, precision, and poetic code.
        </p>
      </div>
    </footer>
  );
};

export default Footer;