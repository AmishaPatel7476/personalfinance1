// src/services/api.js

import axios from 'axios';

// API base URL ko .env file se le rahe hain
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Yahan hum JWT token ko request headers mein add kar sakte hain
// Ek example ke liye, hum hardcoded token use kar rahe hain
API.interceptors.request.use((config) => {
  const token = 'your_jwt_token_here'; // Isse dynamically fetch karna hoga
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;