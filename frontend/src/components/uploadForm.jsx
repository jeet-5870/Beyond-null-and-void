import React, { useEffect, useState, useRef } from 'react';
import API from '../api.js'; // Axios instance

function UploadForm({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  // Reset file input on mount
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      setFile(null);
    }
  }, []);

  // Auto-clear message after 5 seconds
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
      const res = await API.post('/upload', formData, {
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

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>📤 Upload Groundwater CSV</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={isUploading} style={{ marginLeft: '1rem' }}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default UploadForm;
