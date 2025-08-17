import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
});

API.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // If we have a token, add it to the headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (user) {
    // If we have user data but no token, try to get token from user data
    const userData = JSON.parse(user);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for handling 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;