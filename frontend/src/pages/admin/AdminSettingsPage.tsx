import React, { useState, useEffect } from 'react';
import { 
  Settings, Percent, ShieldCheck, CheckCircle2, 
  AlertCircle, Edit2, Save, RefreshCw, Building, Sliders 
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [userShare, setUserShare] = useState('70');
  const [platformShare, setPlatformShare] = useState('20');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [rulesRes, recRes] = await Promise.all([
        api.getProfitRules().catch(() => ({ rules: [] })),
        api.getRecyclers().catch(() => ({ recyclers: [] })),
      ]);
      setRules(rulesRes.rules || [
        { id: '1', category: 'LAPTOP', userSharePercent: 70, platformSharePercent: 20, refurbSharePercent: 10 },
        { id: '2', category: 'SMARTPHONE', userSharePercent: 75, platformSharePercent: 15, refurbSharePercent: 10 },
        { id: '3', category: 'COMPONENT', userSharePercent: 65, platformSharePercent: 25, refurbSharePercent: 10 },
      ]);
      setRecyclers(recRes.recyclers || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEditClick = (rule: any) => {
    setEditingRule(rule);
    setUserShare(String(rule.userSharePercent));
    setPlatformShare(String(rule.platformSharePercent));
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      setSaving(true);
      setMessage(null);
      await api.updateProfitRule(editingRule.id, {
        platformSharePercent: Number(platformShare),
        userSharePercent: Number(userShare),
      });
      setMessage({ type: 'success', text: `Profit sharing rule for ${editingRule.category} updated successfully!` });
      setEditingRule(null);
      await fetchSettings();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update profit rule',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#16834D]" /> Platform Governance & Profit-Sharing Rules
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Configure dynamic profit waterfalls, authorized recycling partnerships, and zero-landfill SLAs.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* Profit-Sharing Rules Configurator */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#16834D]" /> Category Profit-Sharing Waterfalls
            </h3>
            <p className="text-xs text-[#6B756E]">
              Defines the exact automated revenue split between seller, platform, and refurbishment cost reserve upon marketplace sale.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#151A17]">
            <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
              <tr>
                <th className="px-5 py-3.5">Device Category</th>
                <th className="px-5 py-3.5">Seller Payout (%)</th>
                <th className="px-5 py-3.5">Platform Margin (%)</th>
                <th className="px-5 py-3.5">Refurb / Logistics Reserve (%)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE5]">
              {rules.map((rule) => {
                const reserve = 100 - Number(rule.userSharePercent) - Number(rule.platformSharePercent);
                return (
                  <tr key={rule.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#151A17]">
                      {rule.category}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#16834D]">
                      {rule.userSharePercent}%
                    </td>
                    <td className="px-5 py-4 font-bold text-[#084D36]">
                      {rule.platformSharePercent}%
                    </td>
                    <td className="px-5 py-4 font-medium text-amber-700">
                      {reserve}%
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="px-3 py-1 border border-[#E5EBE5] rounded-lg text-xs font-semibold text-[#151A17] hover:bg-gray-50 flex items-center gap-1.5 ml-auto"
                      >
                        <Edit2 className="w-3 h-3 text-[#16834D]" /> Adjust Margin
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CPCB Authorized Recyclers Section */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5]">
          <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#16834D]" /> Authorized CPCB Recycler Partners
          </h3>
          <p className="text-xs text-[#6B756E]">
            Registered electronic waste disposal partners for non-reusable devices and hazardous components.
          </p>
        </div>

        <div className="p-5 space-y-3">
          {recyclers.length === 0 ? (
            <p className="text-xs text-[#6B756E]">No third-party recyclers configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recyclers.map((rec) => (
                <div key={rec.id} className="p-4 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-[#151A17]">{rec.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF]">
                      CPCB Licensed
                    </span>
                  </div>
                  <div className="text-xs text-[#6B756E] space-y-1">
                    <div>License No: <strong className="text-[#151A17]">{rec.licenseNo}</strong></div>
                    <div>Location: {rec.city}</div>
                    <div>Disposal Capacity: {rec.capacityKgPerMonth ? `${rec.capacityKgPerMonth.toLocaleString()} kg/month` : '50,000 kg/month'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5EBE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#16834D]" /> Configure Profit Share — {editingRule.category}
              </h3>
              <button 
                onClick={() => setEditingRule(null)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Seller Payout Percentage (%)</label>
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={userShare}
                  onChange={(e) => setUserShare(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Platform Margin Percentage (%)</label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={platformShare}
                  onChange={(e) => setPlatformShare(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div className="p-3 bg-[#EBF8E9]/60 border border-[#C3E8BF] rounded-xl text-xs">
                Refurb & Logistics Reserve:{' '}
                <strong>
                  {100 - (Number(userShare) || 0) - (Number(platformShare) || 0)}%
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-2 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#084D36] rounded-xl hover:bg-[#063b2a] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Split Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
