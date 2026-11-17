import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, User, ShieldCheck, Truck, Store, QrCode, Scan, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Role } from '../types';

interface QuickRoleBarProps {
  onOpenScanner: () => void;
}

export const QuickRoleBar: React.FC<QuickRoleBarProps> = ({ onOpenScanner }) => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pathname = location.pathname;

  const handleRoleSwitch = async (role: Role, route: string) => {
    if (!user || user.role !== role) {
      await demoLogin(role);
    }
    navigate(route);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 px-3.5 py-2 bg-[#084D36] hover:bg-[#063b29] text-white rounded-full shadow-2xl border border-emerald-600/40 flex items-center gap-2 text-xs font-bold transition-all"
        title="Open Live Demo Switcher"
      >
        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
        <span>Demo Switcher</span>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-2.5 py-1.5 bg-[#084D36]/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-emerald-600/30 flex items-center gap-1 sm:gap-2 max-w-[95vw] overflow-x-auto text-[13px] font-medium">
      <div className="hidden lg:flex items-center px-2 text-emerald-200/80 text-[11px] font-bold tracking-wider uppercase border-r border-emerald-700/60 pr-2.5">
        Live Demo
      </div>

      <button
        onClick={() => navigate('/')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname === '/'
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Landing</span>
      </button>

      <button
        onClick={() => handleRoleSwitch('USER', '/dashboard/user')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname.startsWith('/dashboard/user')
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>User</span>
      </button>

      <button
        onClick={() => handleRoleSwitch('ADMIN', '/dashboard/admin')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname.startsWith('/dashboard/admin')
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>

      <button
        onClick={() => handleRoleSwitch('AGENT', '/dashboard/agent')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname.startsWith('/dashboard/agent')
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <Truck className="w-3.5 h-3.5" />
        <span>Agent</span>
      </button>

      <button
        onClick={() => handleRoleSwitch('RETAILER', '/dashboard/retailer')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname.startsWith('/dashboard/retailer')
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <Store className="w-3.5 h-3.5" />
        <span>Retailer</span>
      </button>

      <div className="h-4 w-[1px] bg-emerald-700/60 mx-1 hidden sm:block" />

      <button
        onClick={() => navigate('/passport/RC-2026-00142')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          pathname.startsWith('/passport')
            ? 'bg-white text-[#084D36] font-semibold shadow-xs'
            : 'text-white/90 hover:bg-white/15'
        }`}
      >
        <QrCode className="w-3.5 h-3.5" />
        <span>QR Passport</span>
      </button>

      <button
        onClick={onOpenScanner}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#62B735] hover:bg-[#529d2b] text-white font-semibold transition-all shadow-sm"
      >
        <Scan className="w-3.5 h-3.5" />
        <span>Scan QR</span>
      </button>

      <button
        onClick={() => setIsCollapsed(true)}
        className="p-1 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 ml-1"
        title="Minimize Bar"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
