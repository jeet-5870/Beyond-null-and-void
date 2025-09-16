import React, { useEffect, useState, useRef } from 'react';
import API from "../api.js"

function UploadForm({onUploadComplete}) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(()=>{
    if(fileInputRef.current){
      fileInputRef.current.value = null;
      setFile(null);
    }
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/upload', formData);
      setMessage(res.data.message);
      setFile(null);
      fileInputRef.current.value = null;
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setMessage('Upload failed');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Upload Groundwater CSV</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default UploadForm;
