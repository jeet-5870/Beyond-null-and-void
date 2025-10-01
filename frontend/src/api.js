import axios from 'axios';

const API = axios.create({
  baseURL: 'https://beyond-null-and-void.onrender.com', // ✅ Backend running on render
});

// 🔑 API instance that automatically adds the JWT token for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔑 NEW: Separate API instance specifically for authentication endpoints
// This instance MUST NOT attach the Authorization header, preventing 401 errors
export const AuthAPI = axios.create({
  baseURL: 'https://beyond-null-and-void.onrender.com/api/auth', 
});

export default API;
