import axios from 'axios';

const API = axios.create({
  baseURL: 'https://beyond-null-and-void.onrender.com', // ✅ Backend running on render
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;