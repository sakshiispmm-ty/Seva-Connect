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

// V1.3 NGO Operations Pages
import RequestAssistancePage from './pages/RequestAssistancePage';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import BeneficiaryManagement from './pages/admin/BeneficiaryManagement';
import AssistanceRequestManagement from './pages/admin/AssistanceRequestManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import VolunteerManagement from './pages/admin/VolunteerManagement';

// Dashboards & Admin Pages
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CampaignManagement from './pages/admin/CampaignManagement';
import DonationVerification from './pages/admin/DonationVerification';
import DonorManagement from './pages/admin/DonorManagement';
import NotificationsPage from './pages/NotificationsPage';

// V2.2 Reports & Analytics Pages
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import DonationReports from './pages/admin/reports/DonationReports';
import CampaignReports from './pages/admin/reports/CampaignReports';
import VolunteerReports from './pages/admin/reports/VolunteerReports';
import BeneficiaryReports from './pages/admin/reports/BeneficiaryReports';
import InventoryReports from './pages/admin/reports/InventoryReports';

// V2.3 Feedback & Volunteer Activity Pages
import FeedbackManagement from './pages/admin/FeedbackManagement';
import VolunteerHistoryPage from './pages/volunteer/VolunteerHistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/donor/login" element={<Navigate to="/login/donor" replace />} />
          <Route path="/volunteer/login" element={<Navigate to="/login/volunteer" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login/admin" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/donation-success" element={<DonationSuccessPage />} />
          <Route path="/request-assistance" element={<RequestAssistancePage />} />

          {/* Protected Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['Donor', 'Admin']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/history"
            element={
              <ProtectedRoute allowedRoles={['Donor', 'Admin']}>
                <DonationHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Volunteer Routes (V1.3) */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['Volunteer', 'Admin']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/profile"
            element={
              <ProtectedRoute allowedRoles={['Volunteer', 'Admin']}>
                <VolunteerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/history"
            element={
              <ProtectedRoute allowedRoles={['Volunteer', 'Admin']}>
                <VolunteerHistoryPage />
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
          <Route
            path="/admin/donors"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DonorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assistance-requests"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AssistanceRequestManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/beneficiaries"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <BeneficiaryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/volunteers"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <VolunteerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <FeedbackManagement />
              </ProtectedRoute>
            }
          />

          {/* V2.2 Reports & Analytics Routes */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/donations"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DonationReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/campaigns"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CampaignReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/volunteers"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <VolunteerReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/beneficiaries"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <BeneficiaryReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/inventory"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <InventoryReports />
              </ProtectedRoute>
            }
          />

          {/* Protected Profile Route (Accessible by Donor, Admin, and Volunteer) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['Donor', 'Admin', 'Volunteer']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Dedicated Notifications Feed Route (V2.1) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['Donor', 'Admin', 'Volunteer']}>
                <NotificationsPage />
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
