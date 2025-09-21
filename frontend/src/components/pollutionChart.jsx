import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';
import API from '../api.js';

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
        const res = await API.get(`/api/leaderboard/${city}?timeframe=${selectedTimeframe}`);
        setTimelineData(res.data);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to fetch timeline data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimelineData();
  }, [city, selectedTimeframe]);

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

const PollutionLeaderboard = ({ data, title }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const citiesPerPage = 10;

  useEffect(() => {
    // This component will now receive data as a prop
    if (data) {
      setLeaderboardData(data);
      setTotalPages(Math.ceil(data.length / citiesPerPage));
    } else {
      // Otherwise, fetch data from the API (for the main page)
      const fetchLeaderboard = async () => {
        try {
          const res = await API.get(`/api/leaderboard?page=${page}&limit=${citiesPerPage}`);
          setLeaderboardData(res.data.cities);
          setTotalPages(res.data.totalPages);
        } catch (err) {
          console.error('Error fetching leaderboard data:', err);
        }
      };
      fetchLeaderboard();
    }
  }, [page, data, citiesPerPage]); // Re-fetch or update when page or data changes

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

  // Determine which data to render based on props
  const displayedData = Array.isArray(data) && data.length > 0 ? data : leaderboardData;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title || 'Pollution Leaderboard'}</h3>
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
              {displayedData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 px-4 text-gray-900 font-medium">{(page - 1) * citiesPerPage + index + 1}</td>
                  <td className="py-2 px-4 text-gray-900">{city.city}</td>
                  <td className="py-2 px-4 text-gray-900 font-mono">{city.pollutionIndex ? city.pollutionIndex.toFixed(1) : 'N/A'}</td>
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