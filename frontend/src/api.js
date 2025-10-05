import axios from 'axios';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL;

const API = axios.create({
  baseURL: BASE_URL, 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = axios.create({
  baseURL: `${BASE_URL}/api/auth`, 
});

export default API;