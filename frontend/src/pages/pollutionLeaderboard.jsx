import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import API from '../api.js'; // Assuming API.js is available for backend calls

// Component to display a city's pollution timeline
const PollutionTimeline = ({ city, onBack }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [timelineData, setTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 🌍 Placeholder for fetching real timeline data from the backend
        // const res = await API.get(`/api/timeline/${city}?timeframe=${selectedTimeframe}`);
        // setTimelineData(res.data);

        // Simulated backend response for demonstration
        const mockData = {
          '7d': [{ date: '2025-09-14', hpi: 288.1 }, { date: '2025-09-17', hpi: 287.5 }, { date: '2025-09-20', hpi: 285.4 }],
          '15d': [{ date: '2025-09-06', hpi: 292.1 }, { date: '2025-09-13', hpi: 289.0 }, { date: '2025-09-20', hpi: 285.4 }],
          '1m': [{ date: '2025-08-21', hpi: 290.1 }, { date: '2025-09-01', hpi: 288.5 }, { date: '2025-09-20', hpi: 285.4 }],
          '3m': [{ date: '2025-06-21', hpi: 320.5 }, { date: '2025-07-21', hpi: 310.2 }, { date: '2025-08-21', hpi: 290.1 }, { date: '2025-09-20', hpi: 285.4 }],
          '6m': [{ date: '2025-03-21', hpi: 340.8 }, { date: '2025-06-21', hpi: 320.5 }, { date: '2025-09-20', hpi: 285.4 }],
        };
        setTimelineData(mockData[city]?.[selectedTimeframe] || []);

      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to fetch timeline data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimelineData();
  }, [city, selectedTimeframe]);

  // Simple logic to determine "best performance"
  const getBestPerformance = () => {
    if (timelineData.length < 2) return null;
    const initialHPI = timelineData[0].hpi;
    const finalHPI = timelineData[timelineData.length - 1].hpi;
    const percentageChange = ((initialHPI - finalHPI) / initialHPI) * 100;
    return percentageChange > 0 ? `Improved by ${percentageChange.toFixed(2)}%` : 'No significant change';
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">{city} - Timeline</h3>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <label htmlFor="timeframe" className="text-sm font-medium text-gray-600">Timeframe:</label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="15d">Last 15 days</option>
            <option value="1m">Last 1 month</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center text-gray-500">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-gray-300 border-t-gray-500"></span>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-mono">
              [Placeholder for Interactive Chart of HPI over time]
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-gray-900">Performance: <span className="text-green-600">{getBestPerformance()}</span></p>
              <p className="text-sm text-gray-500">
                Based on data from the last {selectedTimeframe.replace('d', ' days').replace('m', ' months')}.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const PollutionLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const citiesPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const mockData = [
        { city: 'Gwalior', pollutionIndex: 285.4 },
        { city: 'Kanpur', pollutionIndex: 250.1 },
        { city: 'Lucknow', pollutionIndex: 215.8 },
        { city: 'Varanasi', pollutionIndex: 198.5 },
        { city: 'Agra', pollutionIndex: 180.2 },
        { city: 'Allahabad', pollutionIndex: 165.7 },
        { city: 'Bareilly', pollutionIndex: 154.3 },
        { city: 'Meerut', pollutionIndex: 142.1 },
        { city: 'Jhansi', pollutionIndex: 130.9 },
        { city: 'Aligarh', pollutionIndex: 125.6 },
        { city: 'Moradabad', pollutionIndex: 110.3 },
        { city: 'Muzaffarnagar', pollutionIndex: 95.7 },
      ].sort((a, b) => b.pollutionIndex - a.pollutionIndex);
      setLeaderboardData(mockData.slice((page - 1) * citiesPerPage, page * citiesPerPage));
      setTotalPages(Math.ceil(mockData.length / citiesPerPage));
    };

    fetchLeaderboard();
  }, [page]);

  const handleViewTimeline = (city) => {
    setSelectedCity(city);
    setShowTimeline(true);
  };

  const handleBackToLeaderboard = () => {
    setShowTimeline(false);
    setSelectedCity(null);
  };

  if (showTimeline && selectedCity) {
    return <PollutionTimeline city={selectedCity} onBack={handleBackToLeaderboard} />;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Polluted Cities (HPI)</h3>
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
              {leaderboardData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 px-4 text-gray-900 font-medium">{(page - 1) * citiesPerPage + index + 1}</td>
                  <td className="py-2 px-4 text-gray-900">{city.city}</td>
                  <td className="py-2 px-4 text-gray-900 font-mono">{city.pollutionIndex.toFixed(1)}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleViewTimeline(city.city)}
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
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page => Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page => Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;
