import axios from 'axios';

const BASE_URL = 'https://beyond-null-and-void.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

const AuthAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true 
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend cookie is expired or invalid, automatically clear state and redirect
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      localStorage.removeItem('role'); // Clear non-sensitive UI role caching
      
      // Force a redirect to the login page cleanly
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
export { AuthAPI };
