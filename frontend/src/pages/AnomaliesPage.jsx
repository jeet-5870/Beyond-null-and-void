// frontend/src/pages/AnomaliesPage.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import API from '../api.js';

const AnomaliesPage = ({ role }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const res = await API.get('/api/analysis');
        setAnomalies(res.data.anomalies || []);
      } catch (error) {
        console.error("Failed to fetch anomaly data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleDownloadReport = () => {
    // Basic CSV export logic
    const headers = "Location,Pollutant,Value,Threshold,Timestamp\n";
    const csvContent = anomalies.map(a =>
      `${a.location},${a.pollutant},${a.value},${a.threshold},${new Date(a.timestamp).toISOString()}`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "anomaly_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPrivilegedUser = role === 'ngo' || role === 'researcher';

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-light mb-6">Anomaly Detection</h2>
      
      {anomalies.length > 0 && (
        <div className="bg-danger/20 text-danger p-4 rounded-md mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <p className="font-medium">
              {anomalies.length} abnormal spike(s) detected in water contamination levels.
            </p>
          </div>
          <button className="p-1 rounded-full hover:bg-danger/30"><X className="h-4 w-4" /></button>
        </div>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text-light">Anomaly Alerts Log</h3>
          {isPrivilegedUser && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-lg text-primary-dark bg-accent-blue hover:bg-sky-400/80 transition"
            >
              <Download className="h-3 w-3" />
              <span>Download Report</span>
            </button>
          )}
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-700">
            {isLoading ? (
              <p className="text-center py-4 text-text-muted">Loading anomalies...</p>
            ) : anomalies.length === 0 ? (
              <p className="text-center py-4 text-text-muted">No anomalies detected.</p>
            ) : (
              anomalies.map((alert, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                    <div className="flex-1">
                      <p className="font-semibold text-text-light">
                        <span className="text-danger">{alert.pollutant}</span> spike in {alert.location}
                      </p>
                      <p className="text-sm text-text-muted">
                        Detected Value: {alert.value} (Threshold: {alert.threshold})
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
      
      {/* For trend graphs, you would map through locations with anomalies and render 
        a modified version of your existing 'PollutionChart' component for each one, 
        passing the anomaly points as special data to be highlighted.
      */}
    </div>
  );
};

export default AnomaliesPage;