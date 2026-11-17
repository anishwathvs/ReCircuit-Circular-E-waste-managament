import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, Search, Filter, RefreshCw, Truck, CheckCircle2, 
  ExternalLink, UserPlus, Wrench, AlertTriangle, Eye, ShieldCheck 
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Product[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProductForAssign, setSelectedProductForAssign] = useState<Product | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const [refurbModalOpen, setRefurbModalOpen] = useState(false);
  const [selectedProductForRefurb, setSelectedProductForRefurb] = useState<Product | null>(null);
  const [repairDesc, setRepairDesc] = useState('Replaced display hinge brackets and installed fresh 54Wh OEM battery');
  const [componentsReplaced, setComponentsReplaced] = useState('Hinge Kit, 54Wh Battery, Thermal Paste');
  const [repairCost, setRepairCost] = useState('2200');

  const [routeRecycleModalOpen, setRouteRecycleModalOpen] = useState(false);
  const [selectedProductForRecycle, setSelectedProductForRecycle] = useState<Product | null>(null);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>('');
  const [recyclerWeight, setRecyclerWeight] = useState('2.4');

  const [selectedRequestDetails, setSelectedRequestDetails] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqRes, agRes, recRes] = await Promise.all([
        api.getAdminRequests(),
        api.getAdminAgents(),
        api.getRecyclers().catch(() => ({ recyclers: [] })),
      ]);
      setRequests(reqRes.products || []);
      setAgents(agRes.agents || []);
      setRecyclers(recRes.recyclers || []);
      if (agRes.agents?.length > 0) setSelectedAgentId(agRes.agents[0].id);
      if (recRes.recyclers?.length > 0) setSelectedRecyclerId(recRes.recyclers[0].id);
    } catch (err) {
      console.error('Failed to load admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAssignAgent = async () => {
    if (!selectedProductForAssign || !selectedProductForAssign.pickupRequest || !selectedAgentId) return;
    try {
      await api.assignAgent(selectedProductForAssign.pickupRequest.id, selectedAgentId);
      setAssignModalOpen(false);
      setToastMessage('Field Agent successfully assigned!');
      setTimeout(() => setToastMessage(null), 3500);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error assigning agent');
    }
  };

  const handleRefurbApprove = async () => {
    if (!selectedProductForRefurb) return;
    try {
      await api.certifyRefurbishment(selectedProductForRefurb.id, {
        repairDescription: repairDesc,
        componentsReplaced: componentsReplaced.split(',').map((s) => s.trim()),
        cost: Number(repairCost) || 0,
      });
      setRefurbModalOpen(false);
      setToastMessage('Device certified & listed for retailer marketplace!');
      setTimeout(() => setToastMessage(null), 3500);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error certifying device');
    }
  };

  const handleRouteToRecycler = async () => {
    if (!selectedProductForRecycle || !selectedRecyclerId) return;
    try {
      await api.routeToRecycler(selectedProductForRecycle.id, selectedRecyclerId, Number(recyclerWeight) || 2.4);
      setRouteRecycleModalOpen(false);
      setToastMessage('Device routed to authorized CPCB recycler.');
      setTimeout(() => setToastMessage(null), 3500);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error routing to recycler');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pickupRequest?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return r.currentStatus === 'SUBMITTED' || r.currentStatus === 'ASSIGNED';
    if (statusFilter === 'INSPECTION') return r.currentStatus === 'COLLECTED' || r.currentStatus === 'INSPECTED';
    if (statusFilter === 'REFURBISHMENT') return r.currentStatus === 'IN_REFURBISHMENT';
    if (statusFilter === 'FOR_SALE') return r.currentStatus === 'REFURBISHED';
    if (statusFilter === 'SOLD') return r.currentStatus === 'SOLD_TO_RETAILER' || r.currentStatus === 'PAYMENT_COMPLETED';
    if (statusFilter === 'RECYCLED') return r.currentStatus === 'SENT_FOR_RECYCLING';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#16834D]" /> E-Waste Request Management
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Oversee all incoming pickup requests, assign collection agents, and monitor inspection decisions.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Requests"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {toastMessage && (
        <div className="bg-[#EBF8E9] border border-[#C3E8BF] text-[#16834D] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, device or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'PENDING', label: 'Pickup Pending' },
            { id: 'INSPECTION', label: 'In Inspection' },
            { id: 'REFURBISHMENT', label: 'Refurbishing' },
            { id: 'FOR_SALE', label: 'For Sale' },
            { id: 'SOLD', label: 'Sold & Paid' },
            { id: 'RECYCLED', label: 'Recycled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'bg-[#F8FAF7] text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading requests pipeline...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No requests match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Device & ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Pickup Location</th>
                  <th className="px-5 py-3.5">Assigned Agent</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F8FAF7] border border-[#E5EBE5] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getProductImage(req)}
                            alt={req.model}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#151A17]">{req.brand} {req.model}</div>
                          <div className="text-[11px] font-mono text-[#084D36] font-medium">{req.customId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#151A17]">{req.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-[#6B756E]">{req.user?.email || req.user?.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-[#6B756E]">
                      <div>{req.pickupRequest?.address || 'Doorstep Pickup'}</div>
                      <div className="text-[10px] text-[#151A17] font-medium">{req.pickupRequest?.city || 'Chennai'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {req.pickupRequest?.agent?.user?.name ? (
                        <div className="flex items-center gap-1.5 text-[#084D36] font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{req.pickupRequest.agent.user.name}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#084D36] border border-[#C3E8BF]">
                        {req.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRequestDetails(req)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#6B756E] border border-[#E5EBE5] rounded-lg hover:bg-gray-50"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProductForAssign(req);
                          setAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#084D36] border border-[#C3E8BF] bg-[#EBF8E9]/50 rounded-lg hover:bg-[#EBF8E9]"
                      >
                        Assign Agent
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProductForRefurb(req);
                          setRefurbModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#084D36] rounded-lg hover:bg-[#063b29]"
                      >
                        Certify Refurb
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProductForRecycle(req);
                          setRouteRecycleModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                      >
                        Recycle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17]">Request Full Overview</h3>
              <button 
                onClick={() => setSelectedRequestDetails(null)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#F8FAF7] p-3 rounded-xl">
                <div>
                  <span className="text-[#6B756E] block">Product ID</span>
                  <strong className="font-mono text-[#084D36] text-sm">{selectedRequestDetails.customId}</strong>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#084D36]">
                  {selectedRequestDetails.currentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Device</span>
                  <strong className="text-[#151A17]">{selectedRequestDetails.brand} {selectedRequestDetails.model}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Category</span>
                  <strong className="text-[#151A17]">{selectedRequestDetails.category}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Customer</span>
                  <strong className="text-[#151A17]">{selectedRequestDetails.user?.name}</strong>
                  <span className="text-[10px] text-[#6B756E] block">{selectedRequestDetails.user?.email}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Pickup City</span>
                  <strong className="text-[#151A17]">{selectedRequestDetails.pickupRequest?.city || 'Chennai'}</strong>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[#6B756E] block mb-1">Issue Description</span>
                <p className="text-[#151A17]">{selectedRequestDetails.issueDescription || 'No description provided'}</p>
              </div>

              {selectedRequestDetails.inspections && selectedRequestDetails.inspections.length > 0 && (
                <div className="p-3 bg-[#EBF8E9]/50 border border-[#C3E8BF] rounded-xl space-y-1">
                  <div className="font-bold text-[#084D36] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16834D]" /> Inspection Report
                  </div>
                  <div>Condition: <strong>{selectedRequestDetails.inspections[0].physicalCondition}</strong></div>
                  <div>Valuation: <strong>₹{selectedRequestDetails.inspections[0].valuationPrice}</strong></div>
                  <div>Recommendation: <strong>{selectedRequestDetails.inspections[0].recommendation}</strong></div>
                  {selectedRequestDetails.inspections[0].notes && (
                    <div className="text-[#6B756E] italic">"{selectedRequestDetails.inspections[0].notes}"</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE5]">
              <Link
                to={`/passport/${selectedRequestDetails.customId}`}
                target="_blank"
                className="px-3 py-1.5 bg-[#084D36] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                View QR Passport <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="px-3 py-1.5 border border-[#E5EBE5] rounded-lg text-xs font-semibold text-[#6B756E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN AGENT MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5EBE5] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17]">Assign Field Collection Agent</h3>
            <p className="text-xs text-[#6B756E]">
              Assign a certified logistics agent to pick up {selectedProductForAssign?.brand} {selectedProductForAssign?.model}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-1">Select Active Agent</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.user?.name || ag.id} ({ag.vehicleType || 'Two Wheeler'} — {ag.serviceArea || 'South Zone'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignAgent}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#084D36] rounded-lg hover:bg-[#063b29]"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFURBISHMENT MODAL */}
      {refurbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E5EBE5] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17]">Certify Refurbishment & List for Sale</h3>
            <p className="text-xs text-[#6B756E]">
              Complete technical refurbishment diagnostics and list for retailer wholesale.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Repair Description</label>
                <textarea
                  rows={2}
                  value={repairDesc}
                  onChange={(e) => setRepairDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Components Replaced</label>
                <input
                  type="text"
                  value={componentsReplaced}
                  onChange={(e) => setComponentsReplaced(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Total Repair Cost (₹)</label>
                <input
                  type="number"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRefurbModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefurbApprove}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#084D36] rounded-lg hover:bg-[#063b29]"
              >
                Issue Certificate & List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUTE TO RECYCLER MODAL */}
      {routeRecycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5EBE5] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17]">Route to CPCB Recycler</h3>
            <p className="text-xs text-[#6B756E]">
              Permanently dispatch non-repairable {selectedProductForRecycle?.brand} {selectedProductForRecycle?.model}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Authorized CPCB Partner</label>
                <select
                  value={selectedRecyclerId}
                  onChange={(e) => setSelectedRecyclerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                >
                  {recyclers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.city} • CPCB: {r.licenseNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Measured Unit Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={recyclerWeight}
                  onChange={(e) => setRecyclerWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRouteRecycleModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRouteToRecycler}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 rounded-lg hover:bg-amber-800"
              >
                Dispatch for Material Recovery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

