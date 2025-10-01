// /src/components/Card.jsx
import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  // 🔑 UPDATED for dark theme: white background changed to primary-dark/secondary-dark base
  <div className={`bg-secondary-dark rounded-xl shadow-2xl border border-gray-700 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  // 🔑 UPDATED for dark theme: colors and borders
  <div className={`px-6 py-4 border-b border-gray-700 bg-primary-dark ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export { Card, CardHeader, CardContent };