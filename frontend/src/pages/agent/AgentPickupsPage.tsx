import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Phone, ArrowRight, 
  CheckCircle2, AlertCircle, RefreshCw, ClipboardCheck 
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupRequest } from '../../types';
import { getProductImage } from '../../utils/productImages';
import { LocationMapView } from '../../components/LocationMapView';

export const AgentPickupsPage: React.FC = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED'>('ALL');
  const [showMap, setShowMap] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.getAgentPickups();
      setPickups(res.pickups || []);
    } catch (err) {
      console.error('Error fetching pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleStart = async (id: string) => {
    try {
      await api.startPickup(id);
      setMessage({ type: 'success', text: 'Transit initiated! GPS waypoint logged.' });
      setTimeout(() => setMessage(null), 3000);
      await fetchPickups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error starting pickup');
    }
  };

  const handleMarkCollected = async (id: string) => {
    try {
      await api.completePickup(id, {
        collectionNotes: 'Collected from doorstep in anti-static ESD bag.',
      });
      setMessage({ type: 'success', text: 'Device marked collected! Ready for inspection.' });
      setTimeout(() => setMessage(null), 3000);
      await fetchPickups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing pickup');
    }
  };

  const filteredPickups = pickups.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#16834D]" /> Field Pickup Roster
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Active doorstep pickup dispatches, navigation directions, and customer handoffs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showMap 
                ? 'bg-[#084D36] text-white border-[#084D36]' 
                : 'border-[#E5EBE5] bg-white text-[#6B756E] hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide GPS Map' : 'Show GPS Map'}</span>
          </button>
          <button
            onClick={fetchPickups}
            className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Real Interactive Leaflet GPS Routing Map */}
      {showMap && (
        <LocationMapView title="Doorstep Pickup Navigation & Dispatch Routing" />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EBE5] pb-3 text-xs font-bold overflow-x-auto">
        {[
          { id: 'ALL', label: `All Pickups (${pickups.length})` },
          { id: 'ASSIGNED', label: `Assigned (${pickups.filter(p => p.status === 'ASSIGNED').length})` },
          { id: 'IN_PROGRESS', label: `In Transit (${pickups.filter(p => p.status === 'IN_PROGRESS').length})` },
          { id: 'COLLECTED', label: `Collected (${pickups.filter(p => p.status === 'COLLECTED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-full transition-all ${
              filter === tab.id
                ? 'bg-[#084D36] text-white shadow-xs'
                : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pickups Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading assigned dispatches...</p>
        </div>
      ) : filteredPickups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Truck className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <p className="text-xs text-[#6B756E]">No pickups match this status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={getProductImage(p.product)}
                    alt={p.product?.model || 'Device'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#084D36] bg-[#EBF8E9] px-2 py-0.5 rounded-sm">
                      {p.requestId || `REQ-${p.id.substring(0, 6).toUpperCase()}`}
                    </span>
                    <h3 className="font-heading font-bold text-sm text-[#151A17]">
                      {p.product?.brand} {p.product?.model}
                    </h3>
                  </div>
                  <div className="text-xs text-[#6B756E] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#084D36]" />
                    <span>{p.address ? `${p.address}, ` : ''}{p.city}</span>
                  </div>
                  <div className="text-xs text-[#6B756E] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#084D36]" />
                    <span>Preferred Window: {p.preferredTimeSlot || 'Today, 4:00 PM'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E5EBE5]">
                {p.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStart(p.id)}
                    className="px-4 py-2 bg-[#084D36] hover:bg-[#063b2a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    Start Pickup <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {p.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleMarkCollected(p.id)}
                    className="px-4 py-2 bg-[#16834D] hover:bg-[#084D36] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Collected
                  </button>
                )}

                {p.status === 'COLLECTED' && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Inspection
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

