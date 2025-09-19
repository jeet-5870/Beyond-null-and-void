import React, { useState, useEffect } from 'react';
import API from '../api.js';
import UploadForm from '../components/uploadForm.jsx';
import ResultTable from '../components/resultTable.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import SafetyBadge from '../components/safetyBadge.jsx';
import {
  Download, Droplets, MapPin, TrendingUp,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/card.jsx';

// Header Component
const Header = () => (
  <header className="bg-gradient-to-r bg-color text-white shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Droplets className="h-10 w-10 text-white" />
        <div>
          <h1 className="text-3xl font-bold">Groundwater Pollution Analyzer</h1>
          <p className="text-secndary-text-color mt-1">Advanced Environmental Monitoring System</p>
        </div>
      </div>
      <div>
        <h3 className='text-secondary-text-color'>Beyond<br /> Null and Void</h3>
      </div>
    </div>
  </div>
</header>
);

// Navigation Component
const Navbar = ({ onRetrieve, showResults }) => (
  <nav className="flex justify-end p-4 bg-gray-50 border-b border-gray-200">
    <button
      onClick={onRetrieve}
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
);

// Main Dashboard Component
const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
    <div className="min-h-screen bg-color">
      <Header />
      <Navbar onRetrieve={handleRetrieveResults} showResults={showResults} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadForm onUploadComplete={handleUploadComplete} uploadType="samples" />

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-8">
            <p className="font-medium text-center">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
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

              <SafetyBadge data={results} />
              <PollutionChart data={results} key={JSON.stringify(results)} />
              <ResultTable data={results} />

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="bg-gradient-to-r bg-white text-color px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-100">
              <FileText className="h-20 w-20 mb-4" />
              <p className="text-xl font-medium">No data to display. Please upload a CSV file to get started.</p>
              <p className="text-sm mt-2">The dashboard will populate with analysis results after a successful upload.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-100">
            <p className="text-lg font-medium">Click "Retrieve Results" to view the latest analysis.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
