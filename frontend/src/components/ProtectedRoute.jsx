import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF6F3]">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/logo.png"
            alt="SevaConnect"
            className="h-12 w-auto animate-pulse"
          />
          <div className="w-10 h-10 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#087F73]">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated users to login, keeping the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to permitted dashboard if role does not match
    const destination = user.role === 'Admin' ? '/admin' : '/donor';
    return <Navigate to={destination} replace />;
  }

  return children;
}
