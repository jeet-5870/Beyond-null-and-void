import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';

const PollutionLeaderboard = ({ data, title, onViewTimeline }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 text-gray-600">Rank</th>
                <th className="py-2 px-4 text-gray-600">City</th>
                <th className="py-2 px-4 text-gray-600">Pollution Index</th>
                <th className="py-2 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 px-4 text-gray-900 font-medium">{index + 1}</td>
                  <td className="py-2 px-4 text-gray-900">{city.city}</td>
                  <td className="py-2 px-4 text-gray-900 font-mono">
                    {city.pollutionIndex ? city.pollutionIndex.toFixed(1) : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => onViewTimeline(city.city)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
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
