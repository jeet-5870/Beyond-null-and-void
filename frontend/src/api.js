import axios from 'axios';

const BASE_URL = 'https://beyond-null-and-void.onrender.com';

const API = axios.create({
  baseURL: BASE_URL, 
});

// 🔑 API instance that automatically adds the JWT token for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = axios.create({
  // 🔑 FIX: Corrected baseURL to target the backend auth routes directly,
  // preventing 404 errors on auth initiation.
  baseURL: `${BASE_URL}/api/auth`, 
});

export default API;