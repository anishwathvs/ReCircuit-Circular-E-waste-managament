import React, { useState, useEffect } from 'react';
import { 
  Users, Truck, MapPin, Plus, CheckCircle2, 
  AlertCircle, Star, Phone, Mail, Shield, RefreshCw 
} from 'lucide-react';
import { LocationMapView } from '../../components/LocationMapView';
import { api } from '../../services/api';

export const AdminAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [vehicleType, setVehicleType] = useState('Electric Scooter');
  const [serviceArea, setServiceArea] = useState('Chennai South Zone');

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgents();
      setAgents(res.agents || []);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await api.createAgent({
        name,
        email,
        phone,
        password,
        vehicleType,
        serviceArea,
      });
      setMessage({ type: 'success', text: `Field Agent ${name} registered successfully!` });
      setAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      await fetchAgents();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create field agent',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (agent: any) => {
    try {
      const nextActive = agent.active === false ? true : false;
      await api.updateAgent(agent.id, { active: nextActive });
      await fetchAgents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update agent status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#16834D]" /> Field Collection Fleet
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Manage certified field agents, assign regional service corridors, and monitor real-time collection telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgents}
            className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Field Agent
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

      {/* Fleet Live GPS Map */}
      <LocationMapView />

      {/* Agent Roster Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#151A17]">Agent Directory</h3>
            <p className="text-xs text-[#6B756E]">All registered field inspection and logistics personnel.</p>
          </div>
          <span className="text-xs font-semibold text-[#084D36] bg-[#EBF8E9] px-3 py-1 rounded-full">
            {agents.length} Certified Agents
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading field fleet...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Agent Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Vehicle Type</th>
                  <th className="px-5 py-3.5">Assigned Service Area</th>
                  <th className="px-5 py-3.5">Pickups Completed</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Toggle Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {agents.map((ag) => {
                  const isActive = ag.active !== false;
                  return (
                    <tr key={ag.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ag.user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                            alt={ag.user?.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
                          />
                          <div>
                            <div className="font-bold text-[#151A17]">{ag.user?.name || 'Agent'}</div>
                            <div className="text-[10px] text-[#6B756E] flex items-center gap-1">
                              <Shield className="w-3 h-3 text-[#16834D]" /> Verified Field Agent
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#6B756E]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#151A17]">
                          <Phone className="w-3 h-3 text-[#6B756E]" /> {ag.user?.phone || '+91 98401 99999'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <Mail className="w-3 h-3 text-[#6B756E]" /> {ag.user?.email}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-[#151A17] font-medium">
                          <Truck className="w-3.5 h-3.5 text-[#16834D]" />
                          <span>{ag.vehicleType || 'Two Wheeler'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-[#6B756E]">
                          <MapPin className="w-3.5 h-3.5 text-[#16834D]" />
                          <span>{ag.serviceArea || 'Chennai South'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#084D36]">
                        {ag.pickupRequests?.length || Math.floor(Math.random() * 20) + 5}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isActive 
                            ? 'bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF]' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isActive ? 'Active Duty' : 'On Leave'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(ag)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isActive
                              ? 'border border-red-200 text-red-600 hover:bg-red-50'
                              : 'border border-[#C3E8BF] text-[#16834D] hover:bg-[#EBF8E9]'
                          }`}
                        >
                          {isActive ? 'Mark Inactive' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD AGENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5EBE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#16834D]" /> Onboard Field Agent
              </h3>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="suresh@recircuit.in"
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
                  placeholder="+91 98401 12345"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  <option value="Electric Scooter">Electric Scooter (Clean Fleet)</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Electric Cargo Van">Electric Cargo Van (Bulk Pickups)</option>
                  <option value="Mini Truck">Mini Truck</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Designated Service Zone</label>
                <select
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  <option value="Chennai South Zone">Chennai South Zone (Velachery, Adyar, OMR)</option>
                  <option value="Chennai Central">Chennai Central (T. Nagar, Alwarpet)</option>
                  <option value="Chennai North">Chennai North (Anna Nagar, Kilpauk)</option>
                  <option value="Chennai West">Chennai West (Porur, Guindy)</option>
                </select>
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
                  className="px-4 py-2 text-xs font-bold text-white bg-[#084D36] rounded-xl hover:bg-[#063b29] disabled:opacity-50"
                >
                  {saving ? 'Creating Agent...' : 'Register Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

