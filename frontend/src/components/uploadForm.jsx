import React, { useEffect, useState, useRef } from 'react';
import API from '../api.js';
import { Upload } from 'lucide-react';

function UploadForm({ onUploadComplete, uploadType }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      setFile(null);
    }
  }, []);

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

    // This determines the correct backend route: /api/standards or /upload
    const endpoint = uploadType === 'standards' ? '/api/standards' : '/upload';

    try {
      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Upload successful');
      setFile(null);
      fileInputRef.current.value = null;
      if (onUploadComplete) onUploadComplete(res.data); // Passing res.data for alerts
    } catch (err) {
      // FIX: This captures the specific backend error message, e.g., "No metal standards found"
      const errorMsg = err.response?.data?.error || 'Upload failed';
      setMessage(errorMsg);
      console.error('❌ Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
const messageColor = (message.includes('failed') || message.includes('No metal standards found')) ? 'text-danger' : 'text-success';

  return (
    // 🔑 UPDATED colors for dark theme
    <div className="flex flex-col items-center justify-center p-6 bg-secondary-dark rounded-xl shadow-lg border border-gray-700 mb-8">
      <h3 className="text-2xl font-bold text-text-light mb-4">{formTitle}</h3>
      <p className="text-text-muted mb-6">Upload a CSV file to analyze pollution indices.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 w-full max-w-sm">
        <label htmlFor={`file-upload-${uploadType}`} className="w-full">
          <div className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-primary-dark hover:bg-primary-dark/80 transition-colors duration-200">
            <Upload className="h-12 w-12 text-accent-blue mb-2" />
            <p className="text-sm text-text-light">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-text-muted mt-1">CSV file only</p>
          </div>
          <input
            id={`file-upload-${uploadType}`}
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
        <p className="text-sm text-text-muted truncate max-w-full">{file ? `Selected: ${file.name}` : 'No file selected'}</p>
        <button
          type="submit"
          disabled={isUploading || !file}
          // 🔑 FIXED: Replaced 'bg-color' with 'bg-accent-blue' for consistency
          className="w-full px-4 py-2 text-primary-dark bg-accent-blue rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-text-muted"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-dark border-t-transparent"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <span>Analyze Data</span>
          )}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm font-medium ${messageColor}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default UploadForm;