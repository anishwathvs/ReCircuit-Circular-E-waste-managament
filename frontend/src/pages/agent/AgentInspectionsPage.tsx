import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Laptop, ShieldCheck, Battery, Power, Wrench 
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupRequest } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AgentInspectionsPage: React.FC = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickupId, setSelectedPickupId] = useState<string>('');

  // Form states
  const [physicalCondition, setPhysicalCondition] = useState('Good');
  const [powerOnStatus, setPowerOnStatus] = useState(true);
  const [batteryHealth, setBatteryHealth] = useState(82);
  const [hardwareCondition, setHardwareCondition] = useState('Operational');
  const [damagedParts, setDamagedParts] = useState('Minor keyboard scuffs');
  const [recommendation, setRecommendation] = useState<'REFURBISH' | 'RECYCLE'>('REFURBISH');
  const [estimatedResaleValue, setEstimatedResaleValue] = useState('24500');
  const [inspectionNotes, setInspectionNotes] = useState('Display panel clear, ports responsive, motherboard free of corrosion.');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.getAgentPickups();
      const list = res.pickups || [];
      setPickups(list);
      // Select first collected or in progress
      const eligible = list.find((p: any) => p.status === 'COLLECTED' || p.status === 'IN_PROGRESS');
      if (eligible) setSelectedPickupId(eligible.id);
      else if (list.length > 0) setSelectedPickupId(list[0].id);
    } catch (err) {
      console.error('Error fetching pickups for inspection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const currentPickup = pickups.find((p) => p.id === selectedPickupId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPickup) return;
    try {
      setSubmitting(true);
      setMessage(null);

      // If in progress, complete first
      if (currentPickup.status !== 'COLLECTED') {
        await api.completePickup(currentPickup.id, {
          collectionNotes: 'Collected in anti-static foam container.',
        });
      }

      await api.submitInspection({
        productId: currentPickup.productId,
        physicalCondition,
        powerOnStatus,
        hardwareCondition,
        batteryHealth,
        damagedParts: damagedParts.split(',').map((s) => s.trim()),
        missingParts: [],
        recommendation,
        inspectionNotes,
        estimatedResaleValue,
      });

      setMessage({
        type: 'success',
        text: `Inspection submitted successfully for ${currentPickup.product?.brand} ${currentPickup.product?.model}! Dispatched to Admin for valuation.`,
      });
      await fetchPickups();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to submit inspection report',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#16834D]" /> Physical Inspection Workbench
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Conduct 12-point hardware integrity inspection and submit verified device valuations.
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading inspection queue...</p>
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <p className="text-xs text-[#6B756E]">No pickups assigned to you yet.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unit Selector */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
              <Laptop className="w-4 h-4 text-[#16834D]" /> Select Device for Physical Diagnostics
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">
                Assigned Unit in Your Possession
              </label>
              <select
                value={selectedPickupId}
                onChange={(e) => setSelectedPickupId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
              >
                {pickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product?.brand} {p.product?.model} ({p.requestId || p.id.substring(0, 8)}) — Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            {currentPickup && (
              <div className="p-4 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white border border-[#E5EBE5] overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getProductImage(currentPickup.product)}
                    alt={currentPickup.product?.brand || 'Device'}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs flex-1 w-full">
                  <div>
                    <span className="text-[#6B756E] block">Product ID:</span>
                    <strong className="font-mono text-[#084D36]">{currentPickup.product?.customId}</strong>
                  </div>
                  <div>
                    <span className="text-[#6B756E] block">Device:</span>
                    <strong className="text-[#151A17]">{currentPickup.product?.brand} {currentPickup.product?.model}</strong>
                  </div>
                  <div>
                    <span className="text-[#6B756E] block">Pickup City:</span>
                    <strong className="text-[#151A17]">{currentPickup.city}</strong>
                  </div>
                  <div>
                    <span className="text-[#6B756E] block">Pickup Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D]">
                      {currentPickup.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostics Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EBE5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#151A17] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
              <ShieldCheck className="w-4 h-4 text-[#16834D]" /> 12-Point Technical Inspection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Physical Chassis Condition</label>
                <select
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  <option value="Flawless">Flawless (Grade A+)</option>
                  <option value="Good">Good (Grade A - Minor hairline scratches)</option>
                  <option value="Scratched">Scratched (Grade B - Noticeable exterior wear)</option>
                  <option value="Cracked">Cracked / Dented (Grade C - Heavy cosmetic wear)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Power On & Boot Test</label>
                <select
                  value={powerOnStatus ? 'true' : 'false'}
                  onChange={(e) => setPowerOnStatus(e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  <option value="true">Powers on normally & boots to BIOS / OS</option>
                  <option value="false">Fails to boot / No display or power</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Battery Health Cycle Score (%)</label>
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
                <label className="block font-semibold text-[#151A17] mb-1">Recommended Disposition</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  <option value="REFURBISH">Refurbish & Market for B2B Resale</option>
                  <option value="RECYCLE">Dispatch for Hazardous E-Waste Recycling</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Estimated Customer Payout (₹)</label>
                <input
                  type="number"
                  value={estimatedResaleValue}
                  onChange={(e) => setEstimatedResaleValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Identified Cosmetic / Damaged Parts</label>
                <input
                  type="text"
                  value={damagedParts}
                  onChange={(e) => setDamagedParts(e.target.value)}
                  placeholder="e.g. Scratched lid, missing screws"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[#151A17] mb-1">Inspector Notes & Diagnostic Summary</label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <ClipboardCheck className="w-4 h-4" />
              {submitting ? 'Submitting Report...' : 'Submit Physical Inspection Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

