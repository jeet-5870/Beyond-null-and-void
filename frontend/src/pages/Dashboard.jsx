import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp
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
  BarController
} from 'chart.js';

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



// Mock API for demo purposes
// const mockAPI = {
//   get: (endpoint) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         if (endpoint === '/api/samples') {
//           resolve({
//             data: [
//               { location: 'Site A', hpi: 25.4, pli: 1.2, mpi: 2.1, hei: 18.7, classification: 'Safe' },
//               { location: 'Site B', hpi: 67.8, pli: 2.8, mpi: 4.2, hei: 45.3, classification: 'Moderate' },
//               { location: 'Site C', hpi: 89.2, pli: 3.9, mpi: 6.1, hei: 78.4, classification: 'Polluted' },
//               { location: 'Site D', hpi: 34.1, pli: 1.6, mpi: 2.8, hei: 23.9, classification: 'Safe' },
//               { location: 'Site E', hpi: 156.7, pli: 5.2, mpi: 8.9, hei: 134.2, classification: 'Highly Polluted' }
//             ]
//           });
//         }
//         resolve({ data: 'Report downloaded successfully' });
//       }, 1000);
//     });
//   },
//   post: (endpoint, data) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({ data: { message: 'File uploaded successfully' } });
//       }, 2000);
//     });
//   }
// };

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
const Card = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Upload Form Component
const UploadForm = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setMessage('Only CSV files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await mockAPI.post('/upload', formData);
      setMessage(res.data.message || 'Upload successful');
      setFile(null);
      fileInputRef.current.value = null;
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setMessage('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upload Groundwater Data</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {file ? file.name : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                isUploading || !file
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            message.includes('failed') || message.includes('Please') || message.includes('Only')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message.includes('failed') || message.includes('Please') || message.includes('Only') ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
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
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          title: { 
            display: true, 
            text: 'Pollution Indices Comparison',
            font: { size: 16, weight: 'bold' },
            padding: 20
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              font: { size: 12 }
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 12 }
            }
          }
        },
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

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
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
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
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await mockAPI.get('/api/samples');
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [hasUploaded]);

  const handleUploadComplete = () => {
    setHasUploaded(prev => !prev);
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await mockAPI.get('/api/report');
      // Simulate download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'groundwater_report.pdf';
        link.click();
        setIsDownloading(false);
      }, 1000);
    } catch (err) {
      console.error('Error downloading report:', err);
      setIsDownloading(false);
    }
  };

  const stats = [
    {
      title: 'Total Locations',
      value: results.length,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Safe Sites',
      value: results.filter(r => r.classification === 'Safe').length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Polluted Sites',
      value: results.filter(r => r.classification === 'Polluted' || r.classification === 'Highly Polluted').length,
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      title: 'Average HPI',
      value: results.length ? (results.reduce((sum, r) => sum + r.hpi, 0) / results.length).toFixed(1) : '0.0',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadForm onUploadComplete={handleUploadComplete} />
        
        {results.length > 0 && (
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;