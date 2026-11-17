import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, MapPin, Clock, ArrowRight, CheckCircle2, 
  RefreshCw, ClipboardCheck, AlertCircle, ShieldCheck 
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupRequest } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AgentOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'completed'>('assigned');

  // Inspection modal
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);

  // Form states
  const [physicalCondition, setPhysicalCondition] = useState('Scratched');
  const [powerOnStatus, setPowerOnStatus] = useState(true);
  const [hardwareCondition, setHardwareCondition] = useState('Operational');
  const [batteryHealth, setBatteryHealth] = useState(78);
  const [damagedParts, setDamagedParts] = useState<string[]>(['Display Hinge Play']);
  const [recommendation, setRecommendation] = useState<'REFURBISH' | 'RECYCLE'>('REFURBISH');
  const [inspectionNotes, setInspectionNotes] = useState('Device powers on successfully. Hinge screws need retightening and fresh thermal paste.');
  const [estimatedResaleValue, setEstimatedResaleValue] = useState('22000');
  const [submittingInspection, setSubmittingInspection] = useState(false);
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

  const handleStartPickup = async (pickupId: string) => {
    try {
      await api.startPickup(pickupId);
      setMessage({ type: 'success', text: 'Pickup transit started! Customer notified.' });
      setTimeout(() => setMessage(null), 3000);
      await fetchPickups();
      setActiveTab('in_progress');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error starting pickup');
    }
  };

  const handleCompleteAndInspect = (pickup: PickupRequest) => {
    setSelectedPickup(pickup);
    setInspectionModalOpen(true);
  };

  const submitInspectionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickup) return;
    try {
      setSubmittingInspection(true);

      // 1. Mark collected if not already
      if (selectedPickup.status !== 'COLLECTED') {
        await api.completePickup(selectedPickup.id, {
          collectionNotes: 'Collected in protective anti-static container.',
        });
      }

      // 2. Submit detailed physical inspection report
      await api.submitInspection({
        productId: selectedPickup.productId,
        physicalCondition,
        powerOnStatus,
        hardwareCondition,
        batteryHealth,
        damagedParts,
        missingParts: [],
        recommendation,
        inspectionNotes,
        estimatedResaleValue,
      });

      setInspectionModalOpen(false);
      setMessage({ type: 'success', text: 'Inspection report submitted to Admin for valuation review!' });
      setTimeout(() => setMessage(null), 4000);
      await fetchPickups();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error submitting inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const assignedList = pickups.filter((p) => p.status === 'ASSIGNED');
  const inProgressList = pickups.filter((p) => p.status === 'IN_PROGRESS');
  const completedList = pickups.filter((p) => p.status === 'COLLECTED');

  const displayedList =
    activeTab === 'assigned'
      ? assignedList
      : activeTab === 'in_progress'
      ? inProgressList
      : completedList;

  return (
    <div className="space-y-6">
      {/* Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">My Pickups</h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Collect and inspect assigned e-waste devices.
          </p>
        </div>
        <button
          onClick={fetchPickups}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Queue"
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

      {/* Status Tabs matching reference: Assigned (3), In Progress (1), Completed (12) */}
      <div className="flex items-center gap-2 border-b border-[#E5EBE5] pb-3 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'assigned'
              ? 'bg-[#084D36] text-white shadow-xs'
              : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
          }`}
        >
          Assigned ({assignedList.length})
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'in_progress'
              ? 'bg-[#084D36] text-white shadow-xs'
              : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
          }`}
        >
          In Progress ({inProgressList.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'completed'
              ? 'bg-[#084D36] text-white shadow-xs'
              : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
          }`}
        >
          Completed ({completedList.length})
        </button>
      </div>

      {/* Pickups List matching reference cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading assigned pickups...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Truck className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-sm text-[#151A17] mb-1">No pickups in this queue</h3>
          <p className="text-xs text-[#6B756E]">
            {activeTab === 'assigned'
              ? 'All new pickups have been initiated.'
              : activeTab === 'in_progress'
              ? 'No pickups currently in transit.'
              : 'No completed pickups yet today.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-xs hover:border-[#CCD7CE] hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Device Thumbnail */}
                <div className="w-20 h-16 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={getProductImage(pickup.product)}
                    alt={pickup.product?.model || 'Device'}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details matching screenshot */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#6B756E] font-bold">
                    {pickup.requestId || `REQ-${pickup.id.substring(0, 6).toUpperCase()}`}
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-[#151A17]">
                    {pickup.product?.brand} {pickup.product?.model}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B756E]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#084D36]" />
                      <span>Location: {pickup.address ? `${pickup.address}, ` : ''}{pickup.city}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#084D36]" />
                      <span>{pickup.preferredTimeSlot || 'Today, 4:00 PM'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons matching reference */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {pickup.status === 'ASSIGNED' ? (
                  <button
                    onClick={() => handleStartPickup(pickup.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                  >
                    <span>Start Pickup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : pickup.status === 'IN_PROGRESS' ? (
                  <button
                    onClick={() => handleCompleteAndInspect(pickup)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#16834D] hover:bg-[#084D36] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Inspect Device</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#16834D]" /> Physical E-Waste Inspection Report
              </h3>
              <button 
                onClick={() => setInspectionModalOpen(false)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitInspectionReport} className="space-y-4 text-xs">
              <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E5EBE5]">
                <div className="text-xs text-[#6B756E]">Device Under Test:</div>
                <div className="font-bold text-sm text-[#151A17]">
                  {selectedPickup?.product?.brand} {selectedPickup?.product?.model}
                </div>
                <div className="font-mono text-xs text-[#084D36]">{selectedPickup?.product?.customId}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Physical Condition</label>
                  <select
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  >
                    <option value="Flawless">Flawless / Like New</option>
                    <option value="Good">Good (Minor wear)</option>
                    <option value="Scratched">Scratched / Scuffed</option>
                    <option value="Cracked">Cracked / Heavily Dented</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Power On Status</label>
                  <select
                    value={powerOnStatus ? 'true' : 'false'}
                    onChange={(e) => setPowerOnStatus(e.target.value === 'true')}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  >
                    <option value="true">Powers On & Boots</option>
                    <option value="false">No Power / Dead Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Recommended Pathway</label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  >
                    <option value="REFURBISH">Refurbish & Resell</option>
                    <option value="RECYCLE">Zero-Landfill Recycling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Estimated Valuation Price (₹)</label>
                <input
                  type="number"
                  value={estimatedResaleValue}
                  onChange={(e) => setEstimatedResaleValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Inspection Notes & Findings</label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="px-3 py-2 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#084D36] rounded-xl hover:bg-[#063b29] disabled:opacity-50"
                >
                  {submittingInspection ? 'Submitting...' : 'Submit Inspection Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

