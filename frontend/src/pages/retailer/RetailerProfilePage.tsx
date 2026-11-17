import React, { useState } from 'react';
import { 
  Building, User, Mail, Phone, MapPin, 
  ShieldCheck, KeyRound, Save, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const RetailerProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('NextGen Tech Hub Private Limited');
  const [name, setName] = useState(user?.name || 'Retailer Partner');
  const [email, setEmail] = useState(user?.email || 'retailer@recircuit.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98402 88888');
  const [gstin, setGstin] = useState('33AAAAA0000A1Z5');
  const [warehouseAddress, setWarehouseAddress] = useState('Plot 44, Guindy Industrial Estate, SIDCO, Chennai, Tamil Nadu - 600032');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const payload: any = {
        name,
        phone,
        address: warehouseAddress,
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' });
          setSaving(false);
          return;
        }
        if (!currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to change password' });
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await api.updateProfile(payload);
      setMessage({ type: 'success', text: 'Retail partner credentials and warehouse address updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update profile',
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
          <Building className="w-6 h-6 text-[#16834D]" /> Retail Partner Organization & Warehouse
        </h1>
        <p className="text-xs text-[#6B756E] mt-0.5">
          Manage your enterprise profile, verified GSTIN documentation, and primary delivery hub.
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

      {/* Header Card matching reference */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'}
          alt="Retailer"
          className="w-16 h-16 rounded-full object-cover border-2 border-[#16834D]"
        />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="font-heading font-bold text-lg text-[#151A17]">{businessName}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF]">
              Verified B2B Partner
            </span>
          </div>
          <div className="text-xs text-[#6B756E] flex items-center justify-center sm:justify-start gap-2">
            <span>Primary Contact: {name}</span>
            <span>•</span>
            <span>{email}</span>
          </div>
          <div className="text-[11px] font-mono text-[#084D36] font-semibold">
            GSTIN: {gstin} • 18% Input Tax Credit Certified
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Enterprise & Warehouse */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <Building className="w-4 h-4 text-[#16834D]" /> Enterprise Details & Warehouse Delivery Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Company / Store Legal Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Authorized Contact Representative</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Business Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Verified GSTIN</label>
              <input
                type="text"
                value={gstin}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-gray-50 text-[#6B756E]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-[#151A17] mb-1">Wholesale Freight Delivery Hub Address</label>
              <input
                type="text"
                value={warehouseAddress}
                onChange={(e) => setWarehouseAddress(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
              <span className="text-[10px] text-[#6B756E] mt-1 block">
                All bulk wholesale consignments and pallet deliveries will be shipped here.
              </span>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <KeyRound className="w-4 h-4 text-[#16834D]" /> Password & Access
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#151A17] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#151A17] mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Organization Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

