import axios from 'axios';
import 'dotenv/config';

// ✅ Load base URL from .env
const BASE_URL = process.env.BASE_URL;

// 🔐 Token retrieval helper (safe for SSR)
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// 🔧 Create base API instance
const API = axios.create({
  baseURL: BASE_URL,
});

// 🔑 Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔒 Auth-specific API instance (inherits