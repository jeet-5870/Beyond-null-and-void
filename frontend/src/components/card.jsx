// frontend/src/components/card.jsx
import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-secondary-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-primary-dark ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export { Card, CardHeader, CardContent };