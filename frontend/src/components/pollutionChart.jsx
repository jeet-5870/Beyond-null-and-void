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
    const initialHPI = timelineData[0]?.hpi || 0;
    const finalHPI = timelineData[timelineData.length - 1]?.hpi || 0;
    const percentageChange = ((initialHPI - finalHPI) / initialHPI) * 100;
    
    if (percentageChange > 5) return `Improved by ${percentageChange.toFixed(2)}% (HPI Reduced)`;
    if (percentageChange < -5) return `Worsened by ${Math.abs(percentageChange).toFixed(2)}% (HPI Increased)`;
    return 'No significant change';
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-primary-dark transition-colors">
            <ArrowLeft className="h-5 w-5 text-text-muted" />
          </button>
          <h3 className="text-xl font-bold text-text-light">{city} - Timeline</h3>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <label htmlFor="timeframe" className="text-sm font-medium text-text-muted">Timeframe:</label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            // 泊 UPDATED input styles for dark theme
            className="rounded-lg border border-gray-600 bg-secondary-dark text-text-light p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
          <div className="w-full h-64 flex items-center justify-center text-text-muted">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-gray-700 border-t-accent-blue"></span>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center text-danger">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="w-full h-64 bg-primary-dark rounded-lg flex items-center justify-center text-accent-blue font-mono border border-gray-700">
              [Placeholder for Interactive Chart of HPI over time]
            </div>
            <div className="mt-4 text-center">
              {/* 泊 UPDATED color based on performance */}
              <p className="text-lg font-semibold text-text-light">Performance: 
                <span className={getBestPerformance().includes('Improved') ? 'text-success' : getBestPerformance().includes('Worsened') ? 'text-danger' : 'text-text-muted'}>
                  {` ${getBestPerformance()}`}
                </span>
              </p>
              <p className="text-sm text-text-muted">
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
  // 🔑 FIX: Removed pagination states (page, totalPages, citiesPerPage) 
  // as this component is now used exclusively with pre-fetched data (top/bottom 10).
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]); // State now only holds the prop data
  
  // 🔑 FIX: Simplified useEffect to just use the incoming data prop
  useEffect(() => {
    if (data && data.length > 0) {
        setLeaderboardData(data);
    } 
    // Removed API fetching logic as it's handled in mainPage.jsx now
  }, [data]); 

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
  const displayedData = leaderboardData;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-accent-blue" />
          <h3 className="text-lg font-semibold text-text-light">{title || 'Pollution Leaderboard'}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-primary-dark"> {/* 泊 Table header colors */}
                <th className="py-2 px-4 text-text-muted">Rank</th>
                <th className="py-2 px-4 text-text-muted">City</th>
                <th className="py-2 px-4 text-text-muted">Pollution Index</th>
                <th className="py-2 px-4 text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-700 last:border-b-0 odd:bg-secondary-dark even:bg-primary-dark/70">
                  <td className="py-2 px-4 text-text-light font-medium">{index + 1}</td> {/* 🔑 FIX: Simplified Rank */}
                  <td className="py-2 px-4 text-text-light">{city.city}</td>
                  <td className="py-2 px-4 text-text-light font-mono">{city.pollutionIndex ? city.pollutionIndex.toFixed(1) : 'N/A'}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleViewTimeline(city.city)}
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
        {/* 🔑 FIX: Removed Pagination Controls */}
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;