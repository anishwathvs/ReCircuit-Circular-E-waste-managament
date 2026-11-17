import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading, demoLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not logged in, detect target dashboard from URL and auto-authenticate demo role for seamless exploration
    if (!loading && !user) {
      if (location.pathname.startsWith('/dashboard/admin')) {
        demoLogin('ADMIN');
      } else if (location.pathname.startsWith('/dashboard/agent')) {
        demoLogin('AGENT');
      } else if (location.pathname.startsWith('/dashboard/retailer')) {
        demoLogin('RETAILER');
      } else if (location.pathname.startsWith('/dashboard/user')) {
        demoLogin('USER');
      }
    }
  }, [user, loading, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center text-[#084D36]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#084D36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Authenticating session...</span>
        </div>
      </div>
    );
  }

  // If still no user, wait or redirect to home
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center text-[#084D36]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#084D36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Preparing dashboard...</span>
        </div>
      </div>
    );
  }

  // If user role does not match allowed roles, redirect to their role's dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
    if (user.role === 'AGENT') return <Navigate to="/dashboard/agent" replace />;
    if (user.role === 'RETAILER') return <Navigate to="/dashboard/retailer" replace />;
    return <Navigate to="/dashboard/user" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
