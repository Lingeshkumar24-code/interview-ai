import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Interview APIs
export const interviewAPI = {
  create: (data) => api.post('/interviews/', data),
  list: () => api.get('/interviews/'),
  get: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/submit-answer`, data),
  complete: (id) => api.post(`/interviews/${id}/complete`),
  getReport: (id) => api.get(`/interviews/${id}/report`),
  getPdfUrl: (id) => `${API_BASE}/interviews/${id}/pdf`,
  getCareer: (id) => api.get(`/interviews/${id}/career`),
  getDashboard: () => api.get('/interviews/stats/dashboard'),
};

// Resume API
export const resumeAPI = {
  analyze: (formData) => api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
