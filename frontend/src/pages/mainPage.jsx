import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, ArrowRight, ArrowUp, Menu, X, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'; 
import PollutionLeaderboard from '../components/pollutionChart.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection, { ComplaintForm, FeedbackList } from './blogSection.jsx';
import API from '../api.js';
import Footer from '../components/footer.jsx';

// ... (Navbar component remains the same)

const MainPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [reversedLeaderboardData, setReversedLeaderboardData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await API.get('/api/leaderboard?page=1&limit=10');
        const { cities, stats } = res.data;

        setLeaderboardData(cities);
        setReversedLeaderboardData([...cities].reverse());

        // Use the new global stats from the API
        const newSummaryMetrics = [
          {
            title: 'Global Average HPI',
            value: stats.averageHPI ? parseFloat(stats.averageHPI).toFixed(1) : 'N/A',
            icon: TrendingUp,
            color: 'text-accent-blue',
          },
          {
            title: 'Lowest HPI Recorded',
            value: stats.lowestHPI ? parseFloat(stats.lowestHPI).toFixed(1) : 'N/A',
            icon: CheckCircle,
            color: 'text-success',
          },
          {
            title: 'Highest HPI Recorded',
            value: stats.highestHPI ? parseFloat(stats.highestHPI).toFixed(1) : 'N/A',
            icon: AlertCircle,
            color: 'text-danger',
          },
        ];
        setSummaryMetrics(newSummaryMetrics);

      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // ... (rest of the component remains the same, but make sure to render `summaryMetrics` state)
  
  return (
    <div className="min-h-screen bg-primary-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        {/* ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 px-6">
          {isLoading ? (
            <div className="md:col-span-3 flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-accent-blue"></div>
            </div>
          ) : (
            summaryMetrics.map((metric, index) => (
              <div key={index} className="bg-primary-dark p-4 rounded-lg border border-gray-700 shadow-md">
                <div className="flex items-center space-x-2 justify-center">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <p className="text-sm font-medium text-text-muted">{metric.title}</p>
                </div>
                <p className={`text-3xl font-bold mt-2 ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
            ))
          )}
        </div>
        {/* ... */}
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;