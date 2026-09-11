import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach authenticated JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sevaconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Catch 401 unauthorized/expired sessions and handle gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // If we are not on public auth pages, clear state and redirect
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('sevaconnect_token');
        localStorage.removeItem('sevaconnect_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// User Profile Service
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData)
};

// Administration Service
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// Campaign Service (V1.2)
export const campaignService = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data)
};

// Donation Service (V1.2)
export const donationService = {
  register: (data) => api.post('/donations', data),
  getMyDonations: () => api.get('/donations/my'),
  getMyHistory: () => api.get('/donations/my'),
  getByToken: (token) => api.get(`/donations/token/${token}`),
  getAll: (params) => api.get('/donations', { params }),
  verify: (id) => api.put(`/donations/${id}/verify`),
  reject: (id) => api.put(`/donations/${id}/reject`),
  complete: (id) => api.put(`/donations/${id}/complete`),
  getReceipt: (id) => api.get(`/donations/${id}/receipt`)
};

export default api;
