import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Recycle, QrCode, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenScanner }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isMarketplace = location.pathname === '/marketplace' || location.pathname.startsWith('/dashboard/retailer');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EBE5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching reference */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36] group-hover:scale-105 transition-transform shadow-xs">
            <Recycle className="w-6 h-6 text-[#084D36] stroke-[2.2]" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-[#084D36]">
            Re<span className="text-[#16834D]">Circuit</span>
          </span>
        </div>

        {/* Center Navigation Links matching reference */}
        <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-[#151A17]">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors py-1 ${
              isHome 
                ? 'text-[#084D36] font-semibold border-b-2 border-[#084D36]' 
                : 'text-[#6B756E] hover:text-[#084D36]'
            }`}
          >
            Home
          </button>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              if (!isHome) navigate('/');
              setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-[#6B756E] hover:text-[#084D36] transition-colors"
          >
            How It Works
          </a>
          <button
            onClick={() => navigate('/marketplace')}
            className={`transition-colors py-1 ${
              isMarketplace 
                ? 'text-[#084D36] font-semibold border-b-2 border-[#084D36]' 
                : 'text-[#6B756E] hover:text-[#084D36]'
            }`}
          >
            Marketplace
          </button>
          <a
            href="#impact"
            onClick={(e) => {
              e.preventDefault();
              if (!isHome) navigate('/');
              setTimeout(() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-[#6B756E] hover:text-[#084D36] transition-colors"
          >
            Impact
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              if (!isHome) navigate('/');
              setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-[#6B756E] hover:text-[#084D36] transition-colors"
          >
            About
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#084D36] hover:bg-[#EBF8E9] rounded-lg transition-colors border border-[#E5EBE5]"
              title="Scan QR Code"
            >
              <QrCode className="w-4 h-4 text-[#084D36]" />
              <span className="hidden lg:inline">Scan QR</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (user.role === 'ADMIN') navigate('/dashboard/admin');
                  else if (user.role === 'AGENT') navigate('/dashboard/agent');
                  else if (user.role === 'RETAILER') navigate('/dashboard/retailer');
                  else navigate('/dashboard/user');
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-[#084D36] bg-[#EBF8E9] hover:bg-[#d8f2d5] rounded-lg transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>{user.name.split(' ')[0]} ({user.role})</span>
              </button>
              <button
                onClick={logout}
                className="p-2 text-[#6B756E] hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-2 text-[14px] font-medium text-[#151A17] hover:text-[#084D36] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white bg-[#084D36] hover:bg-[#063b29] rounded-xl transition-all shadow-sm active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
