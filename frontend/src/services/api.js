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
    const token = localStorage.getItem('sevaconnect_token') || localStorage.getItem('token');
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
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getVirtualMailbox: (email) => api.get('/auth/virtual-mailbox', { params: { email } })
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

// Donation Service (V1.2 & V2.3)
export const donationService = {
  register: (data) => api.post('/donations', data),
  getMyDonations: () => api.get('/donations/my'),
  getMyHistory: () => api.get('/donations/my'),
  getByToken: (token) => api.get(`/donations/token/${token}`),
  getAll: (params) => api.get('/donations', { params }),
  verify: (id) => api.put(`/donations/${id}/verify`),
  reject: (id, data) => api.put(`/donations/${id}/reject`, data),
  complete: (id) => api.put(`/donations/${id}/complete`),
  getReceipt: (id) => api.get(`/donations/${id}/receipt`),
  getTimeline: (id) => api.get(`/donations/${id}/timeline`)
};

// Volunteer Service (V1.3 & V2.1 & V2.3)
export const volunteerService = {
  getProfile: () => api.get('/volunteers/profile'),
  updateProfile: (data) => api.put('/volunteers/profile', data),
  getTasks: (params) => api.get('/volunteers/tasks', { params }),
  updateTaskStatus: (id, data) => api.put(`/volunteers/tasks/${id}/status`, data),
  deliverTask: (id) => api.put(`/volunteers/tasks/${id}/deliver`),
  getAll: (params) => api.get('/volunteers', { params }),
  getActivity: (id) => api.get(`/volunteers/${id}/activity`),
  getHistory: (params) => api.get('/volunteers/history', { params }),
  getContributionSummary: () => api.get('/volunteers/contribution-summary')
};

// Beneficiary Service (V1.3 & V2.1)
export const beneficiaryService = {
  create: (data) => api.post('/beneficiaries', data),
  getAll: (params) => api.get('/beneficiaries', { params }),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data)
};

// Assistance Request Service (V1.3 & V2.1)
export const assistanceRequestService = {
  submit: (data) => api.post('/assistance-requests', data),
  getAll: (params) => api.get('/assistance-requests', { params }),
  getById: (id) => api.get(`/assistance-requests/${id}`),
  review: (id, data) => api.put(`/assistance-requests/${id}/review`, data),
  allocate: (id, data) => api.put(`/assistance-requests/${id}/allocate`, data),
  getMatches: (id) => api.get(`/assistance-requests/${id}/matches`),
  updatePriority: (id, data) => api.put(`/assistance-requests/${id}/priority`, data)
};

// Inventory Service (V1.3 & V2.1)
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  create: (data) => api.post('/inventory', data),
  adjust: (id, data) => api.put(`/inventory/${id}`, data),
  getHistory: (id) => api.get(`/inventory/${id}/history`)
};

// Donor Service (V2.1)
export const donorService = {
  getAll: (params) => api.get('/donors', { params })
};

// Notification Service (V2.1)
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read')
};

// Report & Analytics Service (V2.2)
export const reportService = {
  // Donations
  getDonationSummary: (params) => api.get('/reports/donations/summary', { params }),
  getDonationsByPeriod: (params) => api.get('/reports/donations/by-period', { params }),
  getDonationsByCampaign: (params) => api.get('/reports/donations/by-campaign', { params }),

  // Campaigns
  getCampaignsSummary: (params) => api.get('/reports/campaigns/summary', { params }),
  getCampaignPerformance: (id) => api.get(`/reports/campaigns/${id}/performance`),

  // Volunteers
  getVolunteersSummary: (params) => api.get('/reports/volunteers/summary', { params }),
  getVolunteerActivity: (id) => api.get(`/reports/volunteers/${id}`),

  // Beneficiaries
  getBeneficiariesSummary: (params) => api.get('/reports/beneficiaries/summary', { params }),
  getBeneficiariesByCategory: (params) => api.get('/reports/beneficiaries/by-category', { params }),

  // Inventory
  getInventorySummary: (params) => api.get('/reports/inventory/summary', { params }),
  getLowStockReport: () => api.get('/reports/inventory/low-stock'),
  getItemHistory: (id) => api.get(`/reports/inventory/${id}/history`),
  getDashboardPayload: (params) => api.get('/reports/dashboard', { params }),
  // Version 3.1: Intelligent Analytics Insights
  getIntelligentInsights: () => api.get('/reports/insights')
};

// Feedback Service (V2.3)
export const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  getMyFeedback: (params) => api.get('/feedback/my', { params }),
  getAll: (params) => api.get('/feedback', { params })
};

// Chatbot Service (V3.1)
export const chatbotService = {
  sendMessage: (data) => api.post('/chatbot/message', data)
};

// Smart Recommendations Service (V3.1)
export const recommendationService = {
  getRecommendedCampaigns: () => api.get('/recommendations/campaigns'),
  getSuggestedTasks: () => api.get('/recommendations/tasks')
};

export default api;



