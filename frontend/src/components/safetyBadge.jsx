import React from 'react';
import { Shield, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';

function SafetyBadge({ data }) {
  const getStatusColor = (classification) => {
    // 🔑 Using light and dark theme color variables
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-success/20 dark:text-success dark:border-success/50';
      case 'Polluted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-warning/20 dark:text-warning dark:border-warning/50';
      case 'Highly Polluted':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-danger/20 dark:text-danger dark:border-danger/50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-secondary-dark/50 dark:text-text-muted dark:border-gray-700';
    }
  };

  const getIcon = (classification) => {
    switch (classification) {
      case 'Safe':
        return <CheckCircle className="h-5 w-5" />;
      case 'Polluted':
      case 'Highly Polluted':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-accent-blue" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-text-light">Water Safety Status</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data.map((item) => (
            <div
              key={item.location}
              className={`p-4 rounded-lg border-2 ${getStatusColor(item.classification)} transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold text-sm">{item.location}</span>
                </div>
                {getIcon(item.classification)}
              </div>
              <p className="font-bold text-lg">{item.classification}</p>
              <p className="text-sm opacity-75">HPI: {item.hpi?.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SafetyBadge;