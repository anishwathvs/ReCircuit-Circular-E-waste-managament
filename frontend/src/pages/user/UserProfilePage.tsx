import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Lock, 
  ShieldCheck, CheckCircle2, AlertCircle, Save, KeyRound 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456');
  const [address, setAddress] = useState(user?.address || 'Flat 4B, Emerald Heights, Velachery');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [pincode, setPincode] = useState('600042');
  const [upiId, setUpiId] = useState('user@okhdfcbank');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const payload: any = {
        name,
        phone,
        address,
        city
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' });
          setSaving(false);
          return;
        }
        if (!currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to set a new password' });
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await api.updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile details updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile settings.' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
          <User className="w-6 h-6 text-[#16834D]" /> Account & Pickup Settings
        </h1>
        <p className="text-xs text-[#6B756E] mt-0.5">
          Manage your personal information, default pickup address, and security preferences.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-[#EBF8E9] border border-[#C3E8BF] text-[#16834D]' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* User Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name || 'User'}
          className="w-16 h-16 rounded-full object-cover border-2 border-[#16834D]"
        />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="font-heading font-bold text-lg text-[#151A17]">{user?.name || 'Anishwath V'}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF]">
              Verified Seller
            </span>
          </div>
          <div className="text-xs text-[#6B756E] flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" /> {user?.email || 'user@recircuit.in'}
          </div>
          <p className="text-[11px] text-[#6B756E]">
            Member since November 2026 • Verified e-waste recycling participant
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Contact & Address Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <MapPin className="w-4 h-4 text-[#16834D]" /> Primary Contact & Pickup Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Default Pickup Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
              <span className="text-[10px] text-[#6B756E] mt-1 block">
                Collection agents will be dispatched to this address for approved requests.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Postal Code (PIN)</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>
        </div>

        {/* Payout Information */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <ShieldCheck className="w-4 h-4 text-[#16834D]" /> Payout Settlement Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">UPI ID for Direct Payouts</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
              <span className="text-[10px] text-[#6B756E] mt-1 block">Payout funds are credited within 24 hours of device resale.</span>
            </div>
          </div>
        </div>

        {/* Security & Password Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <KeyRound className="w-4 h-4 text-[#16834D]" /> Security & Password
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

