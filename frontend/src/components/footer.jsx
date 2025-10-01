import React from 'react';

const Footer = () => {
  return (
    // 🔑 UPDATED colors
    <footer className="bg-primary-dark text-text-light py-8 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-sm hover:text-accent-blue transition-colors text-text-muted">About Us</a>
          <a href="#" className="text-sm hover:text-accent-blue transition-colors text-text-muted">Privacy Policy</a>
          <a href="#complaint" className="text-sm hover:text-accent-blue transition-colors text-text-muted">Raise a Concern</a>
        </div>

        {/* Project Identity */}
        <p className="text-sm font-semibold text-text-muted">
          &copy; 2024 <span className="text-accent-blue">Groundwater Analyzer</span> — A Smart India Hackathon Initiative
        </p>

        {/* Tagline */}
        <p className="mt-2 text-xs text-text-muted/70 italic">
          Empowering communities through data, clarity, and clean water.
        </p>

        {/* Acknowledgment */}
        <p className="mt-2 text-xs text-text-muted/50">
          Built with purpose, precision, and poetic code.
        </p>
      </div>
    </footer>
  );
};

export default Footer;