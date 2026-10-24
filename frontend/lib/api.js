import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token in browser
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('blogify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle auth errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isAuthRoute && localStorage.getItem('blogify_token')) {
        localStorage.removeItem('blogify_token');
        localStorage.removeItem('blogify_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

