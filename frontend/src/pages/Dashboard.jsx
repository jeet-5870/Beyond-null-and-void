import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Droplets, MapPin, TrendingUp,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff,
  Menu, X, Home, LogOut
} from 'lucide-react';
import API from '../api.js';
import UploadForm from '../components/uploadForm.jsx';
import ResultTable from '../components/resultTable.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import SafetyBadge from '../components/safetyBadge.jsx';
import { Card, CardContent, CardHeader } from '../components/card.jsx';
import WaterQualityMap from '../components/waterQualityMap.jsx';

const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [username, setUsername] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    // 🔑 You would typically decode the JWT token here to get the username
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch (e) {
        console.error("Failed to decode token:", e);
        setUsername('User');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGoToMainPage = () => {
    navigate('/');
  };

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await API.get('/api/samples');
      setResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load data. Please check the backend connection.');
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveResults = () => {
    showResults ? setShowResults(false) : fetchResults();
  };

  const handleUploadComplete = () => {
    fetchResults();
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const res = await API.get('/api/report', { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'groundwater_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const stats = [
    {
      title: 'Total Locations',
      value: results.length,
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      title: 'Safe Sites',
      value: results.filter((r) => r.classification === 'Safe').length,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Polluted Sites',
      value: results.filter((r) => r.classification === 'Polluted' || r.classification === 'Highly Polluted').length,
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      title: 'Average HPI',
      value: results.length ? (results.reduce((sum, r) => sum + r.hpi, 0) / results.length).toFixed(1) : '0.0',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Droplets className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Groundwater Analyzer</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Environmental Monitoring System</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              {isNavOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>
            {isNavOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
                  Hi, {username}!
                </div>
                <button
                  onClick={handleGoToMainPage}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Main Page</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="pt-20">
        <nav className="flex justify-end p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleRetrieveResults}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            {showResults ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide Results</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Retrieve Results</span>
              </>
            )}
          </button>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UploadForm onUploadComplete={handleUploadComplete} uploadType="samples" />

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-8">
              <p className="font-medium text-center">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
              <p className="text-xl">Loading analysis results...</p>
            </div>
          ) : showResults ? (
            results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <WaterQualityMap/>
                <SafetyBadge data={results} />
                <PollutionChart data={results} key={JSON.stringify(results)} />
                <ResultTable data={results} />

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 shadow-lg hover:bg-blue-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating Report...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        <span>Download PDF Report</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <FileText className="h-20 w-20 mb-4" />
                <p className="text-xl font-medium">No data to display. Please upload a CSV file to get started.</p>
                <p className="text-sm mt-2">The dashboard will populate with analysis results after a successful upload.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <p className="text-lg font-medium">Click "Retrieve Results" to view the latest analysis.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
