import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // ✅ Backend running on port 3000
});

export default API;
