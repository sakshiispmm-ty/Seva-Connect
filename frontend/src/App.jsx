import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth & Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';

// V1.2 Campaign & Donation Pages
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import DonatePage from './pages/DonatePage';
import DonationSuccessPage from './pages/DonationSuccessPage';
import DonationHistoryPage from './pages/DonationHistoryPage';

// Dashboards & Admin Pages
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CampaignManagement from './pages/admin/CampaignManagement';
import DonationVerification from './pages/admin/DonationVerification';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/donation-success" element={<DonationSuccessPage />} />

          {/* Protected Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['Donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/history"
            element={
              <ProtectedRoute allowedRoles={['Donor']}>
                <DonationHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CampaignManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DonationVerification />
              </ProtectedRoute>
            }
          />

          {/* Protected Profile Route (Accessible by both Donor and Admin) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['Donor', 'Admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
