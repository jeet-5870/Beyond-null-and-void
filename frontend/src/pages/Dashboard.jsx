// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Droplets, MapPin, TrendingUp,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff,
  Menu, X, Home, LogOut, UploadCloud, Bell, Slash 
} from 'lucide-react';
import API from '../api.js';
import UploadForm from '../components/uploadForm.jsx';
import ResultTable from '../components/resultTable.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import SafetyBadge from '../components/safetyBadge.jsx';
import { Card, CardContent, CardHeader } from '../components/card.jsx';
import WaterQualityMap from '../components/waterQualityMap.jsx';
import Footer from '../components/footer.jsx';

const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [fullname, setFullname] = useState('User');
  const [role, setRole] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const alertButtonRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setFullname(payload.fullname); 
        setRole(payload.role || storedRole);
      } catch (e) {
        console.error("Failed to decode token:", e);
        setFullname('User');
        setRole(storedRole || 'guest');
      }
    }
    
    // Load persisted alerts from localStorage
    const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
    setAlerts(storedAlerts);
  }, []);

  // Close alert dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertButtonRef.current && !alertButtonRef.current.contains(event.target) && isAlertsOpen) {
        setIsAlertsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAlertsOpen]);

  // Logic to determine upload permission (Guest and Researcher can upload)
  const isUploadAllowed = role !== 'ngo'; 

  const getUploadDescription = () => {
    if (role === 'researcher') {
      return 'Researcher accounts can upload files for project-wide storage and permanent analysis.';
    }
    if (role === 'guest') {
      return 'Guest accounts can upload files for personal, private analysis within your session.';
    }
    return ''; 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleGoToMainPage = () => {
    navigate('/');
  };

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetches user-specific results
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

  // 🔑 Updated to correctly process the backend's response containing 'alerts'
  const handleUploadComplete = (response) => {
    if (response && response.alerts && response.alerts.length > 0) {
      const newAlerts = response.alerts.map(alert => ({
        ...alert,
        id: Date.now() + Math.random(),
        read: false,
      }));
      
      const updatedAlerts = [...newAlerts, ...alerts];
      setAlerts(updatedAlerts);
      localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
      
      // Notify the user about the critical alert in the main error area
      setError(`CRITICAL ALERT: ${newAlerts.length} highly polluted sample(s) detected. Check notifications for details.`);
    }
    // Automatically fetch new data upon successful upload
    fetchResults();
  };
  
  const handleMarkAsRead = (id) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  };
  
  const unreadAlertCount = alerts.filter(a => !a.read).length;

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

  const handleShowOnMap = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    {
      title: 'Total Locations',
      value: results.length,
      icon: MapPin,
      color: 'text-accent-blue',
    },
    {
      title: 'Safe Sites',
      value: results.filter((r) => r.classification === 'Safe').length,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Polluted Sites',
      value: results.filter((r) => r.classification === 'Polluted' || r.classification === 'Highly Polluted').length,
      icon: AlertCircle,
      color: 'text-danger',
    },
    {
      title: 'Anomalous Samples', // 🔑 NEW STAT
      value: results.filter((r) => r.is_anomaly).length,
      icon: Slash, // Using Slash for anomaly
      color: 'text-danger',
    },
    {
      title: 'Average HPI',
      value: results.length ? (results.reduce((sum, r) => sum + r.hpi, 0) / results.length).toFixed(1) : '0.0',
      icon: TrendingUp,
      color: 'text-text-muted',
    },
  ];
  
  // 🔑 REMOVED: Calculation for safeCitiesData is removed
  /*
  const safeCitiesData = results
    .filter(city => city.classification === 'Safe')
    .sort((a, b) => a.hei - b.hei)
    .slice(0, 10);
  */

  return (
    <div className="min-h-screen bg-primary-dark">
      <header className="bg-secondary-dark shadow-lg fixed w-full z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Droplets className="h-10 w-10 text-accent-blue" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-light">Groundwater Analyzer</h1>
              <p className="text-sm text-text-muted mt-1 hidden sm:block">
                Environmental Monitoring System - <span className="text-accent-blue font-semibold uppercase">{role}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Notification Bell System */}
            <div className="relative" ref={alertButtonRef}>
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="p-2 rounded-full text-text-light hover:text-danger hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                aria-label="View notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadAlertCount > 0 && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-secondary-dark bg-danger text-white text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    {/* Display unread count (max 9 for small badge) */}
                    {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                  </span>
                )}
              </button>
              
              {isAlertsOpen && (
                <Card className="absolute right-0 mt-3 w-80 max-w-xs origin-top-right shadow-2xl z-50 p-0">
                  <CardHeader className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-text-light">Alerts ({unreadAlertCount} unread)</h4>
                    <button 
                       onClick={() => setAlerts(alerts.map(a => ({...a, read: true})))}
                       className="text-xs text-accent-blue hover:underline disabled:opacity-50"
                       disabled={unreadAlertCount === 0}
                    >
                        Mark All Read
                    </button>
                  </CardHeader>
                  <CardContent className="p-0 max-h-96 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-text-muted">
                        <Slash className="h-5 w-5 mx-auto mb-1" />
                        No recent alerts.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-700">
                        {alerts.map(alert => (
                          <li 
                            key={alert.id} 
                            className={`p-3 transition-colors ${alert.read ? 'bg-secondary-dark/50' : 'bg-secondary-dark hover:bg-primary-dark border-l-4 border-danger'}`}
                            onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                          >
                            <div className="flex items-start space-x-2">
                              <AlertCircle className={`h-4 w-4 mt-0.5 ${alert.read ? 'text-text-muted' : 'text-danger'}`} />
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${alert.read ? 'text-text-muted' : 'text-danger'}`}>
                                    Critical Pollution Alert
                                </p>
                                <p className={`text-xs ${alert.read ? 'text-text-muted' : 'text-text-light'}`}>
                                    {alert.message}
                                </p>
                                <span className="text-xs text-text-muted mt-1 block">
                                    {alert.location} - {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Nav Menu Button */}
            <div className="relative">
              <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-2 rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue">
                {isNavOpen ? <X className="h-6 w-6 text-text-light" /> : <Menu className="h-6 w-6 text-text-light" />}
              </button>
              {isNavOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary-dark border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm font-semibold text-text-light border-b border-gray-700">
                    Hi, {fullname}!
                  </div>
                  <button
                    onClick={handleGoToMainPage}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-text-light hover:bg-primary-dark"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go to Main Page</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-danger hover:bg-primary-dark"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="pt-20">
        <nav className="flex justify-end p-4 bg-primary-dark border-b border-gray-700">
          <button
            onClick={handleRetrieveResults}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-accent-blue border border-accent-blue hover:bg-accent-blue/20 transition-colors"
          >
            {showResults ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide Results</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Retrieve My Results</span>
              </>
            )}
          </button>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {isUploadAllowed ? (
            <div className="mb-8">
              <div className="p-4 bg-secondary-dark rounded-t-xl border-b border-gray-700">
                 <p className="text-sm text-text-muted text-center italic">
                    {getUploadDescription()}
                </p>
              </div>
              {/* Note: handleUploadComplete is now correctly receiving the response object */}
              <UploadForm onUploadComplete={handleUploadComplete} uploadType="samples" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-secondary-dark rounded-xl shadow-lg border border-gray-700 mb-8">
              <UploadCloud className="h-12 w-12 text-warning mb-4" />
              <h3 className="text-2xl font-bold text-text-light mb-2">Upload Disabled</h3>
              <p className="text-text-muted text-center max-w-lg">
                File upload functionality is restricted for <span className="font-semibold text-danger uppercase">{role}</span> accounts. 
                Please use the "Retrieve My Results" button above to view previously analyzed data or contact a researcher to submit new data.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-danger/20 text-danger p-4 rounded-md mb-8">
              <p className="font-medium text-center">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-accent-blue mb-4"></div>
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
                            <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-text-light">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full bg-primary-dark ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div ref={mapRef}>
                  <WaterQualityMap data={results} selectedLocation={selectedLocation} />
                </div>

                <ResultTable data={results} onShowOnMap={handleShowOnMap} />

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="bg-accent-blue text-primary-dark px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 shadow-lg hover:bg-sky-400/80 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-dark border-t-transparent"></div>
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
              <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
                <FileText className="h-20 w-20 mb-4" />
                <p className="text-xl font-medium">No data to display. Please {isUploadAllowed ? 'upload a CSV file' : 'ask a researcher/guest to upload data'}.</p>
                <p className="text-sm mt-2">The dashboard will populate with analysis results after a successful upload.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
              <p className="text-lg font-medium">Click "Retrieve My Results" to view the latest analysis.</p>
            </div>
          )}
        </main>
        <footer>
          <Footer/>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;