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

    const endpoint = uploadType === 'standards' ? '/api/standards' : '/upload';

    try {
      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Upload successful');
      setFile(null);
      fileInputRef.current.value = null;
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Upload failed';
      setMessage(errorMsg);
      console.error('❌ Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Correctly define messageColor before the return statement
  const messageColor = message.includes('failed') ? 'text-red-500' : 'text-green-500';

  const formTitle = uploadType === 'standards' ? 'Upload Metal Standards CSV' : 'Upload Groundwater Samples CSV';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{formTitle}</h3>
      <p className="text-gray-500 mb-6">Upload a CSV file to analyze pollution indices.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 w-full max-w-sm">
        <label htmlFor={`file-upload-${uploadType}`} className="w-full">
          <div className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">CSV file only</p>
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
        {file && <p className="text-sm text-gray-600 truncate max-w-full">Selected: {file.name}</p>}
        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full px-4 py-2 text-white bg-color rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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