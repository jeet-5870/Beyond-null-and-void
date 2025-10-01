import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';

// NOTE: This component is functionally similar to the one in pollutionChart.jsx, 
// but is kept here for compatibility with mainPage.jsx imports.
const PollutionLeaderboard = ({ data, title, onViewTimeline }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-accent-blue" />
          <h3 className="text-lg font-semibold text-text-light">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-primary-dark">
                <th className="py-2 px-4 text-text-muted">Rank</th>
                <th className="py-2 px-4 text-text-muted">City</th>
                <th className="py-2 px-4 text-text-muted">Pollution Index</th>
                <th className="py-2 px-4 text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-700 last:border-b-0 odd:bg-secondary-dark even:bg-primary-dark/70">
                  <td className="py-2 px-4 text-text-light font-medium">{index + 1}</td>
                  <td className="py-2 px-4 text-text-light">{city.city}</td>
                  <td className="py-2 px-4 text-text-light font-mono">
                    {city.pollutionIndex ? city.pollutionIndex.toFixed(1) : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => onViewTimeline(city.city)}
                      className="text-accent-blue hover:underline text-sm font-semibold"
                    >
                      View Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;