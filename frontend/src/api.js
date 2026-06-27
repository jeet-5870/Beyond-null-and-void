import axios from 'axios';

// Load base URL from environment (no 'dotenv/config' required on frontend)
const BASE_URL = 'https://beyond-null-and-void.onrender.com';

// Token retrieval helper (safe for SSR)
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Create base API instance (Authenticated API with token interceptor)
const API = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth-specific API instance (Unauthenticated API for login/signup/token verification)
const AuthAPI = axios.create({
  baseURL: BASE_URL,
});

export default API;
export { AuthAPI };
