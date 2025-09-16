import axios from 'axios';

const API = axios.create({
  baseURL: 'https://groundwater-backend.onrender.com', // ✅ Backend running on port 3000
});

export default API;
