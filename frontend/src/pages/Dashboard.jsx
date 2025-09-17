import React, { useState, useEffect } from 'react';
import API from '../api.js'; 
import UploadForm from '../components/uploadForm.jsx';
import ResultTable from '../components/resultTable.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import SafetyBadge from '../components/safetyBadge.jsx';

// Main Dashboard Component
const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await API.get('/api/samples');
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load data. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleUploadComplete = () => {
    fetchResults();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Groundwater Pollution Dashboard</h1>
      <UploadForm onUploadComplete={handleUploadComplete} />

      {error && <div style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading analysis results...</div>
      ) : results.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Analysis Results</h2>
          <div style={{ marginBottom: '2rem' }}>
            <SafetyBadge data={results} />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <PollutionChart data={results} />
          </div>
          <div>
            <ResultTable data={results} />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>No data to display. Please upload a CSV file to begin analysis.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;