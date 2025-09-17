import React from 'react';
import { Shield, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

// Card Components (you can also put these in a shared file)
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

function SafetyBadge({ data }) {
  const getStatusColor = (classification) => {
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Polluted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Highly Polluted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (classification) => {
    switch (classification) {
      case 'Safe':
        return <CheckCircle className="h-5 w-5" />;
      case 'Moderate':
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
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Water Safety Status</h3>
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