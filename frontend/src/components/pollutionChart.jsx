import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';
import API from '../api.js';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Add the 'export' keyword here
export const PollutionTimeline = ({ city, onBack }) => {
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
    if (timelineData.length < 2) return 'No significant change';
    const initialHPI = timelineData[0]?.hpi || 0;
    const finalHPI = timelineData[timelineData.length - 1]?.hpi || 0;
    const percentageChange = ((initialHPI - finalHPI) / initialHPI) * 100;
    
    if (percentageChange > 5) return `Improved by ${percentageChange.toFixed(2)}% (HPI Reduced)`;
    if (percentageChange < -5) return `Worsened by ${Math.abs(percentageChange).toFixed(2)}% (HPI Increased)`;
    return 'No significant change';
  };

  const chartData = {
    labels: timelineData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'HPI (Heavy Metal Pollution Index)',
        data: timelineData.map(item => item.hpi),
        borderColor: '#38bdf8', // accent-blue
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#38bdf8',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f1f5f9', // text-light
        }
      },
      title: {
        display: true,
        text: `HPI Trend for ${city}`,
        color: '#94a3b8', // text-muted
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#94a3b8',
        },
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#1e293b', // secondary-dark border
        }
      },
      y: {
        title: {
          display: true,
          text: 'HPI Score',
          color: '#94a3b8',
        },
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#1e293b',
        }
      },
    },
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
        <div className="flex items-center space-x-2">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-full hover:bg-primary-dark transition-colors">
              <ArrowLeft className="h-5 w-5 text-text-muted" />
            </button>
          )}
          <h3 className="text-xl font-bold text-text-light">{city} - Timeline</h3>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <label htmlFor="timeframe" className="text-sm font-medium text-text-muted">Timeframe:</label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
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
        ) : timelineData.length === 0 ? (
           <div className="w-full h-64 flex items-center justify-center text-text-muted">
            <p>No timeline data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="w-full h-64 bg-primary-dark rounded-lg flex items-center justify-center text-accent-blue font-mono border border-gray-700 p-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  
  useEffect(() => {
    // This logic is now handled in mainPage.jsx
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
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;