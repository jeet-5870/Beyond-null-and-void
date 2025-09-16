import axios from 'axios';

const API = axios.create({
  baseURL: 'https://beyond-null-and-void.onrender.com', // ✅ Backend running on render
});

export default API;
