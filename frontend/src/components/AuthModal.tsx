import React, { useState } from 'react';
import { X, ArrowRight, Shield, User, Truck, Store, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
}) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(defaultMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register({ name, email, password, role, phone });
      } else {
        await login({ email, password });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: Role) => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(demoRole);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EBE5] bg-[#F8FAF7]">
          <div>
            <h3 className="font-heading font-bold text-xl text-[#084D36]">
              {isRegister ? 'Join ReCircuit' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-[#6B756E] mt-0.5">
              {isRegister ? 'Create an account to start recycling & earning' : 'Sign in to access your dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B756E] hover:text-[#151A17] hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="bg-[#EBF8E9] p-3.5 rounded-xl border border-[#d3ecd0]">
            <p className="text-xs font-bold text-[#084D36] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#16834D]" />
              Quick 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoClick('USER')}
                className="flex items-center gap-2 p-2 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-[#084D36] transition-colors shadow-2xs text-left"
              >
                <User className="w-4 h-4 text-[#16834D] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold">User</div>
                  <div className="text-[9px] text-gray-500">Anishwath V</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('ADMIN')}
                className="flex items-center gap-2 p-2 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-[#084D36] transition-colors shadow-2xs text-left"
              >
                <Shield className="w-4 h-4 text-[#16834D] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold">Admin</div>
                  <div className="text-[9px] text-gray-500">Super Admin</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('AGENT')}
                className="flex items-center gap-2 p-2 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-[#084D36] transition-colors shadow-2xs text-left"
              >
                <Truck className="w-4 h-4 text-[#16834D] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold">Agent</div>
                  <div className="text-[9px] text-gray-500">Rakesh K</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('RETAILER')}
                className="flex items-center gap-2 p-2 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-[#084D36] transition-colors shadow-2xs text-left"
              >
                <Store className="w-4 h-4 text-[#16834D] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold">Retailer</div>
                  <div className="text-[9px] text-gray-500">Retail Partner</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5EBE5] w-full" />
            <span className="bg-white px-3 text-xs text-[#6B756E] uppercase tracking-wider absolute">
              or enter credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#151A17] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anishwath V"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-2 focus:ring-[#084D36]/20 focus:border-[#084D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#151A17] mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-2 focus:ring-[#084D36]/20 focus:border-[#084D36] bg-white"
                  >
                    <option value="USER">Individual / Household (Seller)</option>
                    <option value="RETAILER">Electronics Retailer (B2B Buyer)</option>
                    <option value="AGENT">Collection Field Agent</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@recircuit.com"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-2 focus:ring-[#084D36]/20 focus:border-[#084D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-2 focus:ring-[#084D36]/20 focus:border-[#084D36]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#084D36] hover:bg-[#063b29] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-[#084D36] hover:underline font-semibold"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

