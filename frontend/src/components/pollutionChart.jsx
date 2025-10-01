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
            // 🔑 UPDATED input styles for dark theme
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
              {/* 🔑 UPDATED color based on performance */}
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
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const citiesPerPage = 10;
  
  // This useEffect attempts to fetch data if the component is used alone (without data prop)
  // For mainPage.jsx, it uses the data prop, making the API call inside this useEffect redundant/overridden.
  useEffect(() => {
    if (data && data.length > 0) {
        // If data is passed as prop (as in mainPage.jsx), use it
        setLeaderboardData(data);
        setTotalPages(Math.ceil(data.length / citiesPerPage));
    } else {
      // Otherwise, fetch data from the API (for standalone use, if any)
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
  }, [page, data, citiesPerPage]); 

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
  // Slicing local data for pagination if necessary (though the data prop typically contains all 10 items)
  const displayedData = Array.isArray(data) && data.length > 0 ? data : leaderboardData;

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
              <tr className="border-b border-gray-700 bg-primary-dark"> {/* 🔑 Table header colors */}
                <th className="py-2 px-4 text-text-muted">Rank</th>
                <th className="py-2 px-4 text-text-muted">City</th>
                <th className="py-2 px-4 text-text-muted">Pollution Index</th>
                <th className="py-2 px-4 text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-700 last:border-b-0 odd:bg-secondary-dark even:bg-primary-dark/70">
                  <td className="py-2 px-4 text-text-light font-medium">{(page - 1) * citiesPerPage + index + 1}</td>
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
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page => Math.max(1, page - 1))}
            disabled={page === 1}
            // 🔑 UPDATED pagination styles
            className="px-4 py-2 text-sm font-medium text-text-light bg-primary-dark rounded-lg hover:bg-primary-dark/80 disabled:opacity-50 disabled:text-text-muted border border-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page => Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            // 🔑 UPDATED pagination styles
            className="px-4 py-2 text-sm font-medium text-text-light bg-primary-dark rounded-lg hover:bg-primary-dark/80 disabled:opacity-50 disabled:text-text-muted border border-gray-700"
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;