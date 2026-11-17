import React, { useState, useEffect } from 'react';
import { 
  History, Truck, CheckCircle2, Clock, 
  MapPin, ShieldCheck, RefreshCw, Award 
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupRequest } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AgentHistoryPage: React.FC = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.getAgentPickups();
      setPickups(res.pickups || []);
    } catch (err) {
      console.error('Failed to load agent history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const completed = pickups.filter((p) => p.status === 'COLLECTED');
  const totalWeightKg = (completed.length * 3.4).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <History className="w-6 h-6 text-[#16834D]" /> Field Collection History
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Log of completed doorstep collections and historical hardware inspections.
          </p>
        </div>
        <button
          onClick={fetchPickups}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Completed Collections</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#084D36]">{completed.length}</div>
          <span className="text-[11px] text-[#16834D] font-medium mt-1 block">Successfully handed over to sorting hub</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">E-Waste Collected</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700">{totalWeightKg} kg</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Diverted from unauthorized informal burning</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">On-Time SLA</span>
            <span className="p-2 bg-green-50 rounded-xl text-[#16834D]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16834D]">98.6%</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Timely customer doorstep arrivals</span>
        </div>
      </div>

      {/* Completed Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5]">
          <h3 className="font-heading font-bold text-base text-[#151A17]">Collection Log</h3>
          <p className="text-xs text-[#6B756E]">All devices inspected and transferred to ReCircuit processing facility.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading history...</p>
          </div>
        ) : completed.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No completed pickups in your history log yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Device & ID</th>
                  <th className="px-5 py-3.5">Pickup Location</th>
                  <th className="px-5 py-3.5">Inspection Status</th>
                  <th className="px-5 py-3.5">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {completed.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={getProductImage(p.product)}
                            alt={p.product?.brand || 'Device'}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#151A17]">{p.product?.brand} {p.product?.model}</div>
                          <div className="text-[11px] font-mono text-[#084D36] font-medium">
                            {p.product?.customId || p.requestId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#6B756E]">
                      <div>{p.address || 'Doorstep'}</div>
                      <div className="text-[10px] text-[#151A17] font-medium">{p.city}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Inspected & Transferred
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B756E]">
                      {new Date(p.updatedAt || p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

