import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  Receipt,
  Heart,
  User as UserIcon,
  Search,
  Bell,
  Laptop,
  ShoppingCart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NotificationDrawer } from '../components/NotificationDrawer';

export const RetailerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/retailer', icon: LayoutDashboard, end: true },
    { name: 'Browse Products', path: '/dashboard/retailer/browse', icon: Store },
    { name: 'My Orders', path: '/dashboard/retailer/orders', icon: Package },
    { name: 'Transactions', path: '/dashboard/retailer/transactions', icon: Receipt },
    { name: 'Wishlists', path: '/dashboard/retailer/wishlists', icon: Heart },
    { name: 'Profile', path: '/dashboard/retailer/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference image (hidden on mobile, visible on lg+) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E5EBE5] flex-col justify-between shrink-0 p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] group-hover:scale-105 transition-transform">
              <Laptop className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#084D36]">
              Re<span className="text-[#16834D]">Circuit</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-[#084D36] text-white font-semibold shadow-xs'
                        : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Retailer Card at bottom */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center justify-between px-2">
          <Link to="/dashboard/retailer/profile" className="flex items-center gap-3 overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
              alt="Retailer Partner"
              className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5] group-hover:ring-2 group-hover:ring-[#084D36]/20 transition"
            />
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-[#151A17] truncate">{user?.retailerProfile?.businessName || 'Supreme Electronics'}</div>
              <div className="text-[10px] text-[#6B756E]">B2B Retail Partner</div>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#6B756E] hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
                    <Laptop className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="font-heading font-extrabold text-lg text-[#084D36]">
                    Re<span className="text-[#16834D]">Circuit</span>
                  </span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#084D36] text-white shadow-xs'
                            : 'text-[#6B756E] hover:text-[#151A17] hover:bg-[#F8FAF7]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E5EBE5] flex items-center justify-between">
              <Link to="/dashboard/retailer/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                  alt="Retailer Partner"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-[#151A17] truncate">{user?.retailerProfile?.businessName || 'Supreme Electronics'}</div>
                  <div className="text-[10px] text-[#6B756E]">Retail Partner</div>
                </div>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 text-gray-500 hover:text-red-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Top bar matching reference */}
        <header className="h-16 bg-white border-b border-[#E5EBE5] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-48 sm:w-80 max-w-full">
              <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search refurbished laptops, parts..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#084D36] hover:bg-[#EBF8E9] rounded-lg transition-colors border border-[#E5EBE5]"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#16834D] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100 rounded-lg relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#16834D] absolute top-1.5 right-1.5" />
            </button>

            {/* Profile Pill matching reference */}
            <Link to="/dashboard/retailer/profile" className="flex items-center gap-2.5 pl-3 border-l border-[#E5EBE5] hover:opacity-80 transition">
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
                alt="Retailer"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">Retailer</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">Retail Partner</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Nested Page Content */}
        <div className="flex-1 p-6 sm:p-8 pb-32 sm:pb-32 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
};

