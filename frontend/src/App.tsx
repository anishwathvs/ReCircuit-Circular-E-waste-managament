import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickRoleBar } from './components/QuickRoleBar';
import { AuthModal } from './components/AuthModal';
import { QRScannerModal } from './components/QRScannerModal';

// Layouts & Guards
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AgentLayout } from './layouts/AgentLayout';
import { RetailerLayout } from './layouts/RetailerLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { ProductPassportPage } from './pages/ProductPassportPage';

// User Dashboard Pages
import { UserOverviewPage } from './pages/user/UserOverviewPage';
import { UserRegisterPage } from './pages/user/UserRegisterPage';
import { UserRequestsPage } from './pages/user/UserRequestsPage';
import { UserHistoryPage } from './pages/user/UserHistoryPage';
import { UserEarningsPage } from './pages/user/UserEarningsPage';
import { UserProfilePage } from './pages/user/UserProfilePage';

// Admin Dashboard Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage';
import { AdminRefurbishmentPage } from './pages/admin/AdminRefurbishmentPage';
import { AdminRetailersPage } from './pages/admin/AdminRetailersPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Agent Dashboard Pages
import { AgentOverviewPage } from './pages/agent/AgentOverviewPage';
import { AgentPickupsPage } from './pages/agent/AgentPickupsPage';
import { AgentInspectionsPage } from './pages/agent/AgentInspectionsPage';
import { AgentHistoryPage } from './pages/agent/AgentHistoryPage';
import { AgentProfilePage } from './pages/agent/AgentProfilePage';

// Retailer Dashboard Pages
import { RetailerOverviewPage } from './pages/retailer/RetailerOverviewPage';
import { RetailerBrowsePage } from './pages/retailer/RetailerBrowsePage';
import { RetailerOrdersPage } from './pages/retailer/RetailerOrdersPage';
import { RetailerTransactionsPage } from './pages/retailer/RetailerTransactionsPage';
import { RetailerWishlistsPage } from './pages/retailer/RetailerWishlistsPage';
import { RetailerProfilePage } from './pages/retailer/RetailerProfilePage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Backward compatibility for ?view= query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'user') navigate('/dashboard/user', { replace: true });
    else if (view === 'admin') navigate('/dashboard/admin', { replace: true });
    else if (view === 'agent') navigate('/dashboard/agent', { replace: true });
    else if (view === 'retailer') navigate('/dashboard/retailer', { replace: true });
    else if (view === 'passport') {
      const id = params.get('id') || 'RC-2026-00142';
      navigate(`/passport/${id}`, { replace: true });
    } else if (view === 'scanner' || params.get('scan') === 'true') {
      setIsScannerOpen(true);
    }
  }, [navigate]);

  const openAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col font-sans text-[#151A17] antialiased">
      {/* Top Navbar only on non-dashboard public pages */}
      {!isDashboardRoute && (
        <Navbar
          onOpenAuth={openAuth}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      )}

      {/* Main Routes */}
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <LandingPage
                onRegisterClick={() => {
                  if (user) navigate('/dashboard/user/register');
                  else openAuth('register');
                }}
                onTrackClick={() => setIsScannerOpen(true)}
                onViewPassport={(id) => navigate(`/passport/${id || 'RC-2026-00142'}`)}
                onViewMarketplace={() => navigate('/dashboard/retailer/browse')}
              />
            }
          />

          {/* Public Marketplace Catalog View */}
          <Route
            path="/marketplace"
            element={
              <div className="max-w-6xl mx-auto px-4 py-8 w-full">
                <RetailerBrowsePage />
              </div>
            }
          />

          {/* Public Product Passport */}
          <Route path="/passport/:customId" element={<ProductPassportPage />} />
          <Route path="/passport" element={<Navigate to="/passport/RC-2026-00142" replace />} />

          {/* USER DASHBOARD ROUTE GROUP */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserOverviewPage />} />
            <Route path="register" element={<UserRegisterPage />} />
            <Route path="requests" element={<UserRequestsPage />} />
            <Route path="history" element={<UserHistoryPage />} />
            <Route path="earnings" element={<UserEarningsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
          </Route>

          {/* ADMIN DASHBOARD ROUTE GROUP */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="agents" element={<AdminAgentsPage />} />
            <Route path="refurbishment" element={<AdminRefurbishmentPage />} />
            <Route path="retailers" element={<AdminRetailersPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* AGENT DASHBOARD ROUTE GROUP */}
          <Route
            path="/dashboard/agent"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentOverviewPage />} />
            <Route path="pickups" element={<AgentPickupsPage />} />
            <Route path="inspections" element={<AgentInspectionsPage />} />
            <Route path="history" element={<AgentHistoryPage />} />
            <Route path="profile" element={<AgentProfilePage />} />
          </Route>

          {/* RETAILER DASHBOARD ROUTE GROUP */}
          <Route
            path="/dashboard/retailer"
            element={
              <ProtectedRoute allowedRoles={['RETAILER']}>
                <RetailerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RetailerOverviewPage />} />
            <Route path="browse" element={<RetailerBrowsePage />} />
            <Route path="orders" element={<RetailerOrdersPage />} />
            <Route path="transactions" element={<RetailerTransactionsPage />} />
            <Route path="wishlists" element={<RetailerWishlistsPage />} />
            <Route path="profile" element={<RetailerProfilePage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer on public pages */}
      {!isDashboardRoute && <Footer />}

      {/* Persistent Live Demo Switcher */}
      <QuickRoleBar onOpenScanner={() => setIsScannerOpen(true)} />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          if (user?.role === 'ADMIN') navigate('/dashboard/admin');
          else if (user?.role === 'AGENT') navigate('/dashboard/agent');
          else if (user?.role === 'RETAILER') navigate('/dashboard/retailer');
          else navigate('/dashboard/user');
        }}
      />

      {/* Global QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onNavigateToPassport={(customId) => navigate(`/passport/${customId || 'RC-2026-00142'}`)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
