import axios from 'axios';

// Normalize the API base URL to ensure trailing slashes are trimmed and /api path is present
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanUrl = rawUrl.replace(/\/+$/, '');
const baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL,
});

// Helper function to handle and normalize API errors
export const handleApiError = (error, defaultMessage = 'An unexpected error occurred') => {
  if (!error.response) {
    return 'Unable to connect to the server. Please make sure the backend is running.';
  }
  
  const status = error.response.status;
  const backendMessage = error.response.data?.message;

  if (status === 401) {
    return backendMessage || 'Your session has expired. Please log in again.';
  }
  if (status === 403) {
    return backendMessage || 'You do not have permission to access this section.';
  }
  if (status === 404) {
    return backendMessage || 'The requested resource was not found.';
  }
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  return backendMessage || defaultMessage;
};

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
