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

// 🔑 FIX: Base URL set to the root. Login components must now include the full '/api/auth' prefix.
export const AuthAPI = axios.create({
  baseURL: BASE_URL, 
});

export default API;
