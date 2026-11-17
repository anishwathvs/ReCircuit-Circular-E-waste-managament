import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  History,
  User as UserIcon,
  Search,
  Bell,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Camera,
  X,
  AlertTriangle,
  Upload,
  Battery,
  Power,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PickupRequest } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { getProductImage, handleImageFallback } from '../utils/productImages';

interface AgentDashboardProps {
  onViewPassport: (customId: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onViewPassport }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'completed'>('assigned');
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Modal states
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);

  // Inspection form states
  const [physicalCondition, setPhysicalCondition] = useState('Scratched');
  const [powerOnStatus, setPowerOnStatus] = useState(true);
  const [hardwareCondition, setHardwareCondition] = useState('Operational');
  const [batteryHealth, setBatteryHealth] = useState(78);
  const [damagedParts, setDamagedParts] = useState<string[]>(['Display Hinge Play']);
  const [recommendation, setRecommendation] = useState<'REFURBISH' | 'RECYCLE'>('REFURBISH');
  const [inspectionNotes, setInspectionNotes] = useState('Device powers on successfully. Hinge screws need retightening and fresh thermal paste.');
  const [estimatedResaleValue, setEstimatedResaleValue] = useState('22000');
  const [submittingInspection, setSubmittingInspection] = useState(false);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.getAgentPickups();
      setPickups(res.pickups);
    } catch (err) {
      console.error('Error fetching agent pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'AGENT') {
      fetchPickups();
    }
  }, [user]);

  const handleStartPickup = async (pickupId: string) => {
    try {
      await api.startPickup(pickupId);
      await fetchPickups();
      setActiveTab('in_progress');
    } catch (err: any) {
      alert(err.message || 'Error starting pickup');
    }
  };

  const handleCompleteAndInspect = (pickup: PickupRequest) => {
    setSelectedPickup(pickup);
    setInspectionModalOpen(true);
  };

  const submitInspectionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickup) return;
    setSubmittingInspection(true);

    try {
      // 1. Mark collected if not already
      if (selectedPickup.status !== 'COLLECTED') {
        await api.completePickup(selectedPickup.id, {
          collectionNotes: 'Collected in protective anti-static e-waste container.',
        });
      }

      // 2. Submit detailed inspection report
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
      await fetchPickups();
      alert('Inspection report submitted to Admin for valuation review!');
    } catch (err: any) {
      alert(err.message || 'Error submitting inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Filtered by status tabs
  const assignedList = pickups.filter(p => p.status === 'ASSIGNED');
  const inProgressList = pickups.filter(p => p.status === 'IN_PROGRESS');
  const completedList = pickups.filter(p => p.status === 'COLLECTED');

  const displayedList =
    activeTab === 'assigned'
      ? assignedList
      : activeTab === 'in_progress'
      ? inProgressList
      : completedList;

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference */}
      <aside className="w-64 bg-white border-r border-[#E5EBE5] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#084D36]">
              Re<span className="text-[#16834D]">Circuit</span>
            </span>
          </div>

          {/* Navigation Links matching reference */}
          <nav className="space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('assigned')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left bg-[#084D36] text-white font-semibold shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]"
            >
              <Truck className="w-4 h-4" />
              <span>My Pickups</span>
            </button>

            <button
              onClick={() => {
                if (pickups.length > 0) handleCompleteAndInspect(pickups[0]);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Inspections</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Agent Profile in sidebar */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center gap-3 px-2">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
            alt="Field Agent"
            className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5]"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-[#151A17]">Rakesh K</div>
            <div className="text-[10px] text-[#6B756E]">Field Agent • RC-AGT-042</div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar matching reference */}
        <header className="h-16 bg-white border-b border-[#E5EBE5] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-80 max-w-full">
            <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pickups, agents..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100 rounded-lg relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#16834D] absolute top-1.5 right-1.5" />
            </button>

            {/* Profile Pill matching reference */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5EBE5]">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                alt="Agent"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">Rakesh K</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">Field Agent</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 pb-32 max-w-5xl mx-auto space-y-6">
          {/* Header Row */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">My Pickups</h1>
            <p className="text-xs text-[#6B756E] mt-0.5">
              Collect and inspect assigned e-waste devices.
            </p>
          </div>

          {/* Status Tabs matching reference */}
          <div className="flex items-center gap-2 border-b border-[#E5EBE5] pb-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'assigned'
                  ? 'bg-[#084D36] text-white shadow-xs'
                  : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
              }`}
            >
              Assigned (3)
            </button>

            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'in_progress'
                  ? 'bg-[#084D36] text-white shadow-xs'
                  : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
              }`}
            >
              In Progress (1)
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#084D36] text-white shadow-xs'
                  : 'bg-white text-[#6B756E] hover:bg-gray-100 border border-[#E5EBE5]'
              }`}
            >
              Completed (12)
            </button>
          </div>

          {/* PICKUPS LIST matching reference */}
          <div className="space-y-4">
            {displayedList.length > 0 ? (
              displayedList.map((pickup) => (
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
                        onError={(e) => handleImageFallback(e, pickup.product?.category)}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details matching screenshot */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-[#6B756E] font-bold">
                        {pickup.requestId}
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-[#151A17]">
                        {pickup.product?.brand} {pickup.product?.model}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B756E]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#084D36]" />
                          <span>Location: {pickup.city}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#084D36]" />
                          <span>{pickup.preferredTimeSlot}</span>
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
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#16834D] hover:bg-[#0e6b3f] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Perform Inspection</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#084D36] bg-[#EBF8E9] px-3.5 py-1.5 rounded-lg border border-[#c4e4c0]">
                        <CheckCircle className="w-4 h-4 text-[#16834D]" />
                        <span>Collected & Inspected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center text-xs text-[#6B756E]">
                No pickups currently in this tab.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* INSPECTION MODAL */}
      {inspectionModalOpen && selectedPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EBE5] bg-[#F8FAF7]">
              <div>
                <h3 className="font-heading font-bold text-base text-[#084D36]">Field Physical Inspection</h3>
                <p className="text-xs text-[#6B756E]">
                  Inspection for {selectedPickup.product?.brand} {selectedPickup.product?.model} ({selectedPickup.requestId})
                </p>
              </div>
              <button onClick={() => setInspectionModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={submitInspectionReport} className="p-6 overflow-y-auto space-y-4 text-xs text-[#151A17]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Physical Condition</label>
                  <select
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white"
                  >
                    <option value="Good">Good (Minor Scratches)</option>
                    <option value="Scratched">Moderate Scratches</option>
                    <option value="Cracked">Cracked Body / Glass</option>
                    <option value="Heavy Wear">Heavy Wear / Warped</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Power-On Diagnostic</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPowerOnStatus(true)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        powerOnStatus
                          ? 'bg-[#EBF8E9] border-[#16834D] text-[#084D36]'
                          : 'bg-white border-[#E5EBE5] text-gray-500'
                      }`}
                    >
                      Powers On
                    </button>
                    <button
                      type="button"
                      onClick={() => setPowerOnStatus(false)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        !powerOnStatus
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-[#E5EBE5] text-gray-500'
                      }`}
                    >
                      No Power
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Estimated Value Baseline (₹)</label>
                  <input
                    type="number"
                    value={estimatedResaleValue}
                    onChange={(e) => setEstimatedResaleValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                  />
                </div>
              </div>

              {/* Recommendation: Refurbish vs Recycle */}
              <div className="pt-2">
                <label className="block font-semibold mb-2">Reusability Recommendation</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRecommendation('REFURBISH')}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${
                      recommendation === 'REFURBISH'
                        ? 'bg-[#EBF8E9] border-[#16834D] text-[#084D36]'
                        : 'bg-white border-[#E5EBE5] text-gray-600'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#16834D]" />
                      <span>Refurbish & Resell</span>
                    </div>
                    <p className="text-[10px] mt-1 text-gray-500">
                      Components intact; suitable for Grade A/B restoration and marketplace resale.
                    </p>
                  </div>

                  <div
                    onClick={() => setRecommendation('RECYCLE')}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${
                      recommendation === 'RECYCLE'
                        ? 'bg-amber-50 border-amber-600 text-amber-900'
                        : 'bg-white border-[#E5EBE5] text-gray-600'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Authorized Recycling</span>
                    </div>
                    <p className="text-[10px] mt-1 text-gray-500">
                      Beyond economical repair; route to zero-landfill smelting for material recovery.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Agent Inspection Notes</label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5EBE5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="px-4 py-2 border border-[#E5EBE5] rounded-xl font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="px-5 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white font-bold rounded-xl shadow-xs"
                >
                  {submittingInspection ? 'Submitting...' : 'Submit Inspection Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
};

