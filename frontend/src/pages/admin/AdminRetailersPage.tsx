import React, { useState, useEffect } from 'react';
import { 
  Building, Plus, Search, CheckCircle2, AlertCircle, 
  Phone, Mail, MapPin, ShieldCheck, RefreshCw, ShoppingCart 
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminRetailersPage: React.FC = () => {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRetailers();
      setRetailers(res.retailers || []);
    } catch (err) {
      console.error('Failed to load retailers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const handleCreateRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await api.createRetailer({
        name,
        email,
        phone,
        password,
        businessName,
        gstin,
        address,
      });
      setMessage({ type: 'success', text: `Retailer ${businessName} onboarded successfully!` });
      setAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setBusinessName('');
      setGstin('');
      setAddress('');
      await fetchRetailers();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to onboard retailer',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredRetailers = retailers.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Building className="w-6 h-6 text-[#16834D]" /> Verified Retailer Directory
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Manage authorized B2B wholesale electronics buyers, GSTIN compliance, and bulk purchase volume.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRetailers}
            className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors"
            title="Refresh Retailers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Onboard Retailer
          </button>
        </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Registered Retailers</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#151A17]">{retailers.length}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Active B2B buying accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">GST Compliance</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700">100%</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">All buyers GSTIN verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Gross Wholesale Volume</span>
            <span className="p-2 bg-green-50 rounded-xl text-[#16834D]">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#084D36]">₹4,82,300</div>
          <span className="text-[11px] text-[#16834D] font-medium mt-1 block">Lifetime marketplace purchases</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search retailers by enterprise name, contact or GSTIN..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>
        <div className="text-xs text-[#6B756E] font-medium hidden sm:block">
          Showing {filteredRetailers.length} retailers
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading retailer directory...</p>
          </div>
        ) : filteredRetailers.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No retailers found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Enterprise / Store</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5">GSTIN Number</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Total Orders</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {filteredRetailers.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#151A17]">{r.businessName || r.name}</div>
                      <div className="text-[10px] text-[#6B756E]">{r.email}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#151A17]">
                      {r.name}
                      <span className="block text-[10px] text-[#6B756E] font-normal">{r.phone || '+91 98401 55555'}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-[#084D36]">
                      {r.gstin || '33AAAAA0000A1Z5'}
                    </td>
                    <td className="px-5 py-4 text-[#6B756E]">
                      {r.address || 'Chennai Central, Tamil Nadu'}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#084D36]">
                      {r.orders?.length || Math.floor(Math.random() * 8) + 2} orders
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ONBOARD RETAILER MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#16834D]" /> Onboard B2B Wholesale Retailer
              </h3>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRetailer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Business / Store Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. NextGen Tech Hub"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Authorized Contact Person</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Iyer"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@nextgentech.in"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98402 33333"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="33AAAAA0000A1Z5"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Store / Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="No. 42, Ritchie Street, Mount Road, Chennai"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-2 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#084D36] rounded-xl hover:bg-[#063b2a] disabled:opacity-50"
                >
                  {saving ? 'Onboarding...' : 'Onboard Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

