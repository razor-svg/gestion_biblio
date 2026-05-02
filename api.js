import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksAPI = {
  search: (params) => api.get('/livres/search', { params }),
  getAll: () => api.get('/livres'),
  getById: (id) => api.get(`/livres/${id}`),
  getAvailable: () => api.get('/livres/available'),
  create: (data) => api.post('/livres', data),
  update: (id, data) => api.put(`/livres/${id}`, data),
  delete: (id) => api.delete(`/livres/${id}`),
};

// Authors API
export const authorsAPI = {
  getAll: () => api.get('/auteurs'),
  getById: (id) => api.get(`/auteurs/${id}`),
  getForSelect: () => api.get('/auteurs/select'),
  create: (data) => api.post('/auteurs', data),
  update: (id, data) => api.put(`/auteurs/${id}`, data),
  delete: (id) => api.delete(`/auteurs/${id}`),
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/membres'),
  getById: (id) => api.get(`/membres/${id}`),
  getActive: () => api.get('/membres/active'),
  getForSelect: () => api.get('/membres/select'),
  create: (data) => api.post('/membres', data),
  update: (id, data) => api.put(`/membres/${id}`, data),
  delete: (id) => api.delete(`/membres/${id}`),
  suspend: (id) => api.post(`/membres/${id}/suspend`),
  reactivate: (id) => api.post(`/membres/${id}/reactivate`),
};

// Borrowing API
export const borrowingAPI = {
  getActive: () => api.get('/emprunts'),
  getOverdue: () => api.get('/emprunts/overdue'),
  getMemberHistory: (membreId) => api.get(`/emprunts/member/${membreId}`),
  borrow: (data) => api.post('/emprunts/borrow', data),
  return: (data) => api.post('/emprunts/return', data),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
