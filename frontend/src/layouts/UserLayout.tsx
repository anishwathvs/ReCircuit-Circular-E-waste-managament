import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  History,
  Wallet,
  User as UserIcon,
  Search,
  Bell,
  Laptop,
  LogOut,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from '../components/NotificationDrawer';

export const UserLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/user', icon: LayoutDashboard, end: true },
    { name: 'Register E-Waste', path: '/dashboard/user/register', icon: PlusCircle },
    { name: 'My Requests', path: '/dashboard/user/requests', icon: FileText },
    { name: 'Product History', path: '/dashboard/user/history', icon: History },
    { name: 'Earnings', path: '/dashboard/user/earnings', icon: Wallet },
    { name: 'Profile', path: '/dashboard/user/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference image */}
      <aside className="w-64 bg-white border-r border-[#E5EBE5] flex flex-col justify-between shrink-0 p-4 sticky top-0 h-screen overflow-y-auto">
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

        {/* User Card at bottom of sidebar */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center justify-between px-2">
          <Link to="/dashboard/user/profile" className="flex items-center gap-3 overflow-hidden group">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="User avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5] group-hover:ring-2 group-hover:ring-[#084D36]/20 transition"
            />
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-[#151A17] truncate">{user?.name || 'Anishwath V'}</div>
              <div className="text-[10px] text-[#6B756E]">Verified Seller</div>
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

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Top bar matching reference */}
        <header className="h-16 bg-white border-b border-[#E5EBE5] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-80 max-w-full">
            <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, requests..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100 rounded-lg relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#16834D] absolute top-1.5 right-1.5" />
            </button>

            {/* User pill matching reference */}
            <Link to="/dashboard/user/profile" className="flex items-center gap-2.5 pl-3 border-l border-[#E5EBE5] hover:opacity-80 transition">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">{user?.name || 'Anishwath V'}</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">User</div>
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

