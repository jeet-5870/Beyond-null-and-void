import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import { Upload, Calendar, ArrowLeft } from 'lucide-react';
// 🔑 FIX: Import AuthAPI to ensure unauthenticated requests are used for the public route
import API, { AuthAPI } from '../api.js'; 

const HistoricalUploadPage = () => {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format to set the maximum allowed date
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !date) {
      setMessage('Please select both a file and a date.');
      return;
    }

    // Explicitly check if the selected date is in the past
    const selectedDate = new Date(date);
    const currentDate = new Date(today);

    if (selectedDate >= currentDate) {
      setMessage('Please select a date in the past.');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setMessage('Only CSV files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);
    setIsUploading(true);

    try {
      // 🔑 FIX: Use AuthAPI.post for the public /api/upload/historical endpoint.
      // This prevents sending potentially stale JWT tokens, resolving the upload failure.
      const res = await AuthAPI.post('/api/upload/historical', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Upload successful');
      setFile(null);
      setDate('');
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Upload failed';
      setMessage(errorMsg);
      console.error('❌ Historical upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const messageColor = message.includes('failed') || message.includes('Please select a date in the past') ? 'text-danger' : 'text-success';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-dark flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-accent-blue" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-text-light">Upload Historical Data</h3>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-dark transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-text-muted" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-text-muted mb-6 text-center">
            This page is for uploading past water quality data. Please select a CSV file and the date the samples were collected.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="date-picker" className="block text-sm font-medium text-gray-600 dark:text-text-muted mb-2 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Sample Collection Date</span>
              </label>
              <input
                id="date-picker"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={today} // This prevents selection of future dates
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark text-gray-800 dark:text-text-light rounded-md focus:ring-accent-blue focus:border-accent-blue"
              />
            </div>

            <div>
              <label htmlFor="file-upload-historical" className="block text-sm font-medium text-gray-600 dark:text-text-muted mb-2">
                CSV File
              </label>
              <input
                id="file-upload-historical"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="block w-full text-sm text-gray-600 dark:text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-blue file:text-white dark:file:text-primary-dark hover:file:bg-sky-400/80"
              />
              <p className="text-xs text-gray-600 dark:text-text-muted mt-2 truncate max-w-full">
                {file ? `Selected: ${file.name}` : 'No file selected'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading || !file || !date}
              className="w-full px-4 py-3 text-white dark:text-primary-dark bg-accent-blue rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-200 dark:disabled:text-text-muted"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-primary-dark border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Historical Data</span>
              )}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center text-sm font-medium ${messageColor}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalUploadPage;