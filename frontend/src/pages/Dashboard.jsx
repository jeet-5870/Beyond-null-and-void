// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Droplets, MapPin, TrendingUp, BarChart2,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff,
  Menu, X, Home, LogOut, UploadCloud, Bell, Slash, ArrowLeft 
} from 'lucide-react'; // 🔑 Added BarChart2 for new tab
import API from '../api.js';
import UploadForm from '../components/uploadForm.jsx';
import ResultTable from '../components/resultTable.jsx';
import WaterQualityMap from '../components/waterQualityMap.jsx';
import Footer from '../components/footer.jsx';
import PredictionChart from '../components/predictionChart.jsx';
import HotspotsPage from './HotspotsPage.jsx'; // 🔑 NEW IMPORT
import AnomaliesPage from './AnomaliesPage.jsx'; // 🔑 NEW IMPORT
import { Card, CardContent, CardHeader } from '../components/card.jsx';

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

  // 🔑 NEW: State to manage the active view/tab
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'hotspots', 'anomalies', 'prediction'
  const [predictionLocation, setPredictionLocation] = useState(null);

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
    
    const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
    setAlerts(storedAlerts);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertButtonRef.current && !alertButtonRef.current.contains(event.target) && isAlertsOpen) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAlertsOpen]);

  const isUploadAllowed = role !== 'ngo'; 
  const isPredictionAllowed = role === 'researcher' || role === 'ngo';

  const getUploadDescription = () => {
    if (role === 'researcher') return 'Researcher accounts can upload files for project-wide storage and permanent analysis.';
    if (role === 'guest') return 'Guest accounts can upload files for personal, private analysis within your session.';
    return ''; 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleGoToMainPage = () => navigate('/');

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
    if (showResults) {
      setShowResults(false);
    } else {
      fetchResults();
    }
  };

  const handleUploadComplete = (response) => {
    if (response?.alerts?.length > 0) {
      if (role !== 'guest') {
        const newAlerts = response.alerts.map(alert => ({ ...alert, id: Date.now() + Math.random(), read: false }));
        const updatedAlerts = [...newAlerts, ...alerts];
        setAlerts(updatedAlerts);
        localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
        setError(`CRITICAL ALERT: ${newAlerts.length} highly polluted sample(s) detected. Check notifications for details.`);
      } else {
         setError(`ATTENTION: ${response.alerts.length} highly polluted sample(s) detected. Please check the result table for details.`);
      }
    }
    fetchResults();
  };
  
  const handleMarkAsRead = (id) => {
    const updatedAlerts = alerts.map(alert => alert.id === id ? { ...alert, read: true } : alert);
    setAlerts(updatedAlerts);
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  };
  
  const unreadAlertCount = alerts.filter(a => !a.read).length;

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const res = await API.get('/api/report', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
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

  const handleShowPrediction = (location) => {
    if (isPredictionAllowed) {
        setPredictionLocation(location.location);
        setCurrentView('prediction');
    }
  };
  
  const handleBackToMainDashboard = () => {
      setCurrentView('dashboard');
      setPredictionLocation(null);
  };

  const stats = [
    { title: 'Total Locations', value: results.length, icon: MapPin, color: 'text-accent-blue' },
    { title: 'Safe Sites', value: results.filter(r => r.classification === 'Safe').length, icon: CheckCircle, color: 'text-success' },
    { title: 'Polluted Sites', value: results.filter(r => r.classification === 'Polluted' || r.classification === 'Highly Polluted').length, icon: AlertCircle, color: 'text-danger' },
    { title: 'Anomalous Samples', value: results.filter(r => r.is_anomaly).length, icon: Slash, color: 'text-danger' },
  ];
  
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
            {role !== 'guest' && (
              <div className="relative" ref={alertButtonRef}>
                <button
                  onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                  className="p-2 rounded-full text-text-light hover:text-danger hover:bg-primary-dark transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadAlertCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-secondary-dark bg-danger" />
                  )}
                </button>
                
                {isAlertsOpen && (
                  <Card className="absolute right-0 mt-3 w-80 max-w-xs z-50 p-0">
                    <CardHeader><h4>Alerts</h4></CardHeader>
                    <CardContent>
                      {alerts.length === 0 ? <p>No recent alerts.</p> : <ul>{alerts.map(a => <li key={a.id}>{a.message}</li>)}</ul>}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <div className="relative">
              <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-2 rounded-lg hover:bg-primary-dark">
                {isNavOpen ? <X className="h-6 w-6 text-text-light" /> : <Menu className="h-6 w-6 text-text-light" />}
              </button>
              {isNavOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary-dark border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-text-light border-b border-gray-700">Hi, {fullname}!</div>
                  <button onClick={handleGoToMainPage} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-primary-dark"><Home/><span>Main Page</span></button>
                  <button onClick={handleLogout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-danger hover:bg-primary-dark"><LogOut/><span>Logout</span></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="pt-20">
        <nav className="flex justify-between items-center p-4 bg-primary-dark border-b border-gray-700">
          <div className="flex space-x-2">
            <TabButton icon={BarChart2} label="Dashboard" activeView={currentView} targetView="dashboard" onClick={() => setCurrentView('dashboard')} />
            <TabButton icon={MapPin} label="Hotspots" activeView={currentView} targetView="hotspots" onClick={() => setCurrentView('hotspots')} />
            <TabButton icon={AlertTriangle} label="Anomalies" activeView={currentView} targetView="anomalies" onClick={() => setCurrentView('anomalies')} />
          </div>
          <button
            onClick={handleRetrieveResults}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-accent-blue border border-accent-blue hover:bg-accent-blue/20"
          >
            {showResults ? <><EyeOff className="h-4 w-4" /><span>Hide Results</span></> : <><Eye className="h-4 w-4" /><span>Retrieve Results</span></>}
          </button>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {isUploadAllowed ? (
            <UploadForm onUploadComplete={handleUploadComplete} uploadType="samples" />
          ) : (
            <div className="p-6 bg-secondary-dark rounded-xl text-center mb-8">
              <h3 className="text-xl font-bold">Upload Disabled</h3>
              <p>File upload is restricted for {role} accounts.</p>
            </div>
          )}

          {error && <div className="bg-danger/20 text-danger p-4 rounded-md mb-8">{error}</div>}

          {isLoading ? (
            <div className="text-center py-20">Loading...</div>
          ) : showResults ? (
            <>
              {currentView === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map(stat => (
                      <Card key={stat.title}><CardContent className="p-6">
                          <p className="text-sm text-text-muted">{stat.title}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                      </CardContent></Card>
                    ))}
                  </div>
                  <div ref={mapRef}><WaterQualityMap data={results} selectedLocation={selectedLocation} /></div>
                  <ResultTable data={results} onShowOnMap={handleShowOnMap} onShowPrediction={isPredictionAllowed ? handleShowPrediction : null} />
                  <div className="flex justify-center mt-8">
                    <button onClick={handleDownloadReport} disabled={isDownloading} className="bg-accent-blue text-primary-dark px-8 py-4 rounded-lg font-semibold">
                      {isDownloading ? 'Generating...' : <><Download /><span>Download PDF Report</span></>}
                    </button>
                  </div>
                </>
              )}

              {currentView === 'hotspots' && <HotspotsPage />}
              
              {currentView === 'anomalies' && <AnomaliesPage role={role} />}

              {currentView === 'prediction' && predictionLocation && (
                <>
                  <button onClick={handleBackToMainDashboard} className="flex items-center space-x-1 mb-4">
                    <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
                  </button>
                  <PredictionChart location={predictionLocation} onBack={handleBackToMainDashboard} />
                </>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-text-muted">Click "Retrieve Results" to view data.</div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const TabButton = ({ icon: Icon, label, activeView, targetView, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      activeView === targetView ? 'bg-accent-blue text-primary-dark' : 'text-text-muted hover:bg-secondary-dark'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

export default Dashboard;