import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from "../api.js"
import UploadForm from '../components/uploadForm.jsx';
import PollutionChart from '../components/pollutionChart.jsx';
import SafetyBadge from '../components/safetyBadge.jsx';
import ResultTable from '../components/resultTable.jsx';

function Dashboard() {
  const [results, setResults] = useState([]);
  const [hasUploaded, setHasUploaded] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await API.get('/');
      console.log('Fetched result', res.data); // debug
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };


  useEffect(() => {
    fetchResults();
  }, [hasUploaded]);

  const handleUploadComplete = () => {
    setHasUploaded(true);
  };


  // In Dashboard.jsx
const handleDownloadReport = async () => {
  try {
    const res = await API.get('/api/report', { responseType: 'blob' }); // responseType is crucial for file downloads
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'groundwater_report.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (err) {
    console.error('Error downloading report:', err);
  }
};


  return (
    <div>
      <h2>Groundwater Pollution Dashboard</h2>
      <UploadForm onUploadComplete={handleUploadComplete} />
      <SafetyBadge data={results} />
      <PollutionChart data={results} />
      <ResultTable data={results} />
      <button onClick={handleDownloadReport}>Download PDF Report</button>
    </div>
  );
}

export default Dashboard;
