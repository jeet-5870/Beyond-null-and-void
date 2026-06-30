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

export default API;
export { AuthAPI };
