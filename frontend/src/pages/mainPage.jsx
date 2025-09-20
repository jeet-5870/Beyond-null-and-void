import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, TrendingUp, Handshake, Mail } from 'lucide-react';

// --- Reusable Components ---

const Navbar = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login');
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">E-Cell</span>
          </div>
          <button
            onClick={handleLoginClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

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

// --- Featured Sections ---

const PollutionLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const citiesPerPage = 10;

  useEffect(() => {
    // 🌍 Placeholder for fetching paginated leaderboard data from the backend
    const fetchLeaderboard = async () => {
      // Assuming a new backend endpoint like /api/leaderboard?page=1
      // const res = await API.get(`/api/leaderboard?page=${page}`);
      // setLeaderboardData(res.data.cities);
      // setTotalPages(res.data.totalPages);

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
      ];
      setLeaderboardData(mockData.slice((page - 1) * citiesPerPage, page * citiesPerPage));
      setTotalPages(Math.ceil(mockData.length / citiesPerPage));
    };

    fetchLeaderboard();
  }, [page]);

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
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 px-4 text-gray-900 font-medium">{(page - 1) * citiesPerPage + index + 1}</td>
                  <td className="py-2 px-4 text-gray-900">{city.city}</td>
                  <td className="py-2 px-4 text-gray-900 font-mono">{city.pollutionIndex.toFixed(1)}</td>
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

const TimelineSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pollution Change Over Time</h3>
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-500 mb-4">
          Visualizing the impact of our efforts. This timeline will show the positive changes in pollution indices over time.
        </p>
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-mono">
          [Placeholder for Interactive Timeline Chart]
        </div>
      </CardContent>
    </Card>
  );
};

const PartnersBoard = () => {
  const partners = [
    { name: 'EcoConnect NGO', contribution: '120 data submissions' },
    { name: 'CleanWater Foundation', contribution: '80 data submissions' },
    { name: 'Green Earth Alliance', contribution: '65 data submissions' },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Handshake className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Our Top Partners</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {partners.map((partner, index) => (
            <li key={index} className="py-3 flex justify-between items-center">
              <span className="text-gray-900 font-medium">{partner.name}</span>
              <span className="text-sm text-gray-500">{partner.contribution}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const BlogSection = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) {
      setMessage('Feedback cannot be empty.');
      return;
    }

    // 📩 Placeholder for a public feedback submission endpoint
    // try {
    //   await axios.post('/api/feedback', { feedback });
    //   setMessage('Thank you for your valuable feedback!');
    //   setFeedback('');
    // } catch (error) {
    //   setMessage('Failed to submit feedback. Please try again.');
    // }
    
    console.log('Feedback submitted:', feedback);
    setMessage('Thank you for your valuable feedback! (Simulated submission)');
    setFeedback('');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Give Your Valuable Feedback</h3>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts or suggestions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
        {message && <p className={`mt-4 text-center ${message.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      </CardContent>
    </Card>
  );
};

const MainPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Beyond Null and Void</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PollutionLeaderboard />
            <TimelineSection />
          </div>
          <div className="lg:col-span-1">
            <PartnersBoard />
            <BlogSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;