import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-sm hover:text-blue-400 transition-colors">About Us</a>
          <a href="#" className="text-sm hover:text-blue-400 transition-colors">Privacy Policy</a>
          <a href="#complaint" className="text-sm hover:text-blue-400 transition-colors">Raise a Concern</a>
        </div>

        {/* Project Identity */}
        <p className="text-sm font-semibold text-gray-300">
          &copy; 2024 <span className="text-blue-400">Groundwater Analyzer</span> — A Smart India Hackathon Initiative
        </p>

        {/* Tagline */}
        <p className="mt-2 text-xs text-gray-400 italic">
          Empowering communities through data, clarity, and clean water.
        </p>

        {/* Acknowledgment */}
        <p className="mt-2 text-xs text-gray-500">
          Built with purpose, precision, and poetic code.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
