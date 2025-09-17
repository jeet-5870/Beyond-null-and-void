import React, { useState, useEffect, useRef } from 'react';
import API from './api.js'; // 📥 Import your Axios instance
import {
  Upload,
  FileText,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Download,
  Droplets,
  Activity,
  MapPin,
  TrendingUp,
} from 'lucide-react';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // 📊 Use the react-chartjs-2 wrapper

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

// Header Component
const Header = () => (
  <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center space-x-3">
        <Droplets className="h-10 w-10 text-blue-300" />
        <div>
          <h1 className="text-3xl font-bold">Groundwater Pollution Analyzer</h1>
          <p className="text-blue-200 mt-1">Advanced Environmental Monitoring System</p>
        </div>
      </div>
    </div>
  </header>
);

// Card Component
const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Upload Form Component (This component is now imported from './components/uploadForm.jsx')
// Do not duplicate it here.

// Safety Badge Component
const SafetyBadge = ({ data }) => {
  const getStatusColor = (classification) => {
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Polluted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Highly Polluted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (classification) => {
    switch (classification) {
      case 'Safe':
        return <CheckCircle className="h-5 w-5" />;
      case 'Moderate':
      case 'Polluted':
      case 'Highly Polluted':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Water Safety Status</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data.map((item) => (
            <div
              key={item.location}
              className={`p-4 rounded-lg border-2 ${getStatusColor(item.classification)} transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold text-sm">{item.location}</span>
                </div>
                {getIcon(item.classification)}
              </div>
              <p className="font-bold text-lg">{item.classification}</p>
              <p className="text-sm opacity-75">HPI: {item.hpi?.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Pollution Chart Component
const PollutionChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.location),
    datasets: [
      {
        label: 'Heavy Metal Pollution Index (HPI)',
        data: data.map((d) => d.hpi),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Heavy Metal Evaluation Index (HEI)',
        data: data.map((d) => d.hei),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Pollution Indices Comparison',
        font: { size: 16, weight: 'bold' },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: { size: 12 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pollution Analysis</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Results Table Component
const ResultTable = ({ data }) => {
  const getClassificationBadge = (classification) => {
    const colors = {
      'Safe': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Polluted': 'bg-orange-100 text-orange-800',
      'Highly Polluted': 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${colors[classification] || 'bg-gray-100 text-gray-800'}`}>
        {classification}
      </span>
    );
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Detailed Results</h3>
          </div>
          <span className="text-sm text-gray-500">{data.length} locations analyzed</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  HPI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MPI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  HEI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Classification
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={item.location} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.hpi?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.pli?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.mpi?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.hei?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getClassificationBadge(item.classification)}
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

// Main Dashboard Component
const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // This function fetches the analysis results from your backend
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      // ➡️ Use your API instance to make the GET request
      const res = await API.get('/api/samples');
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // This useEffect now runs once on component mount and fetches initial results
  useEffect(() => {
    fetchResults();
  }, []);

  // Handler for when a new file has been successfully uploaded from the form
  const handleUploadComplete = () => {
    // 🔄 Fetch the updated data after a new file has been processed
    fetchResults();
  };

  // Handler for downloading the report
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // ➡️ Use your API instance to fetch the report from the backend
      const res = await API.get('/api/report', {
        responseType: 'blob', // 📦 Important: Treat the response as a binary blob
      });

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
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pass the callback to the imported UploadForm component */}
        <UploadForm onUploadComplete={handleUploadComplete} />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-4 text-xl text-gray-600">Loading analysis results...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            {/* Statistics Cards */}
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
            <PollutionChart data={results} />
            <ResultTable data={results} />

            {/* Download Report Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;