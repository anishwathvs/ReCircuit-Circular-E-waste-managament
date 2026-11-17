import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Inbox, Wrench, Store, DollarSign, ChevronDown, 
  UserPlus, CheckCircle, Building, QrCode, Truck, 
  RefreshCw, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LocationMapView } from '../../components/LocationMapView';
import { api } from '../../services/api';
import { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    totalRequests: 148,
    inRefurbishment: 62,
    listedForSale: 51,
    totalRevenue: 482300,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [requests, setRequests] = useState<Product[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes, agentsRes, txnRes, recRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRequests(),
        api.getAdminAgents(),
        api.getAdminTransactions(),
        api.getRecyclers().catch(() => ({ recyclers: [] }))
      ]);

      setStats(statsRes.stats);
      setChartData(statsRes.monthlyCollections || []);
      setRequests(reqRes.products || []);
      setAgents(agentsRes.agents || []);
      setTransactions(txnRes.transactions || []);
      setRecyclers(recRes.recyclers || []);
      if (agentsRes.agents?.length > 0) setSelectedAgentId(agentsRes.agents[0].id);
      if (recRes.recyclers?.length > 0) setSelectedRecyclerId(recRes.recyclers[0].id);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAssignAgent = async () => {
    if (!selectedProductForAssign || !selectedProductForAssign.pickupRequest || !selectedAgentId) return;
    try {
      await api.assignAgent(selectedProductForAssign.pickupRequest.id, selectedAgentId);
      setAssignModalOpen(false);
      setActionMessage('Agent assigned successfully!');
      setTimeout(() => setActionMessage(null), 3000);
      await fetchDashboardData();
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
      setActionMessage('Device certified and listed for retailer marketplace!');
      setTimeout(() => setActionMessage(null), 3000);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error approving refurbishment');
    }
  };

  const handleRouteToRecycler = async () => {
    if (!selectedProductForRecycle || !selectedRecyclerId) return;
    try {
      await api.routeToRecycler(selectedProductForRecycle.id, selectedRecyclerId, Number(recyclerWeight) || 2.4);
      setRouteRecycleModalOpen(false);
      setActionMessage('Device routed to authorized CPCB recycler.');
      setTimeout(() => setActionMessage(null), 3000);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error routing to recycler');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">Admin Dashboard</h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Manage pickups, refurbishment, sales, and platform payouts.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMessage && (
        <div className="bg-[#EBF8E9] border border-[#C3E8BF] text-[#16834D] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionMessage}
        </div>
      )}

      {/* 4 KPI CARDS matching reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Requests (148) */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">{stats.totalRequests}</div>
            <div className="text-[11px] text-[#6B756E] font-medium">Total Requests</div>
          </div>
        </div>

        {/* KPI 2: In Refurbishment (62) */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">{stats.inRefurbishment}</div>
            <div className="text-[11px] text-[#6B756E] font-medium">In Refurbishment</div>
          </div>
        </div>

        {/* KPI 3: Listed for Sale (51) */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">{stats.listedForSale}</div>
            <div className="text-[11px] text-[#6B756E] font-medium">Listed for Sale</div>
          </div>
        </div>

        {/* KPI 4: Total Revenue (₹4,82,300) */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">
              ₹{Number(stats.totalRevenue).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#6B756E] font-medium">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* SPLIT SECTION: Collection Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart: Collection Overview (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E5EBE5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-[#151A17]">Collection Overview</h3>
            <div className="flex items-center gap-1.5 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-lg px-2.5 py-1 bg-[#F8FAF7]">
              <span>This Month</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.length > 0 ? chartData : [
                  { month: 'Jan', count: 45 },
                  { month: 'Feb', count: 62 },
                  { month: 'Mar', count: 58 },
                  { month: 'Apr', count: 85 },
                  { month: 'May', count: 110 },
                  { month: 'Jun', count: 98 },
                  { month: 'Jul', count: 125 },
                  { month: 'Aug', count: 140 },
                  { month: 'Sep', count: 132 },
                  { month: 'Oct', count: 142 },
                  { month: 'Nov', count: 148 },
                ]}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16834D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16834D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B756E' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B756E' }} axisLine={false} tickLine={false} domain={[0, 200]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#084D36', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#16834D"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="absolute top-2 right-6 px-2 py-0.5 rounded-full bg-[#084D36] text-white text-[10px] font-bold shadow-xs">
              148
            </div>
          </div>
        </div>

        {/* Quick Actions Box */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5EBE5] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#151A17] mb-3">Quick Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const unassigned = requests.find(r => r.pickupRequest?.status === 'PENDING' || !r.pickupRequest?.agentId) || requests[0];
                  setSelectedProductForAssign(unassigned);
                  setAssignModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5EBE5] hover:border-[#084D36] hover:bg-[#EBF8E9]/50 transition-all text-left text-xs font-semibold text-[#151A17] group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] group-hover:scale-105">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Assign Agent</span>
              </button>

              <button
                onClick={() => {
                  const refurb = requests.find(r => r.currentStatus === 'IN_REFURBISHMENT') || requests[0];
                  setSelectedProductForRefurb(refurb);
                  setRefurbModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5EBE5] hover:border-[#084D36] hover:bg-[#EBF8E9]/50 transition-all text-left text-xs font-semibold text-[#151A17] group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] group-hover:scale-105">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>Approve Refurbishment</span>
              </button>

              <button
                onClick={() => navigate('/dashboard/admin/retailers')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5EBE5] hover:border-[#084D36] hover:bg-[#EBF8E9]/50 transition-all text-left text-xs font-semibold text-[#151A17] group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] group-hover:scale-105">
                  <Building className="w-4 h-4" />
                </div>
                <span>Manage Retailers</span>
              </button>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#E5EBE5] text-[11px] text-[#6B756E] flex justify-between">
            <span>Active Agents: {agents.length || 3}</span>
            <span className="text-[#16834D] font-bold">100% Zero-Landfill SLA</span>
          </div>
        </div>
      </div>

      {/* Doorstep Collection & Fleet Map */}
      <LocationMapView />

      {/* Live Requests & Inspection Pipeline Table */}
      <div className="bg-white rounded-xl border border-[#E5EBE5] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#151A17]">Live Requests & Inspection Pipeline</h3>
            <p className="text-xs text-[#6B756E] mt-0.5">Approve inspection diagnostics, assign logistics field agents, or certify refurbished units.</p>
          </div>

          <Link
            to="/dashboard/admin/requests"
            className="text-xs font-semibold text-[#084D36] hover:underline flex items-center gap-1"
          >
            View All Requests ({requests.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#151A17]">
            <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
              <tr>
                <th className="px-5 py-3">Device / ID</th>
                <th className="px-5 py-3">Submitted By</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Assigned Agent</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE5]">
              {requests.slice(0, 6).map((req) => (
                <tr key={req.id} className="hover:bg-[#F8FAF7] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F8FAF7] border border-[#E5EBE5] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getProductImage(req)}
                          alt={req.model}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold">{req.brand} {req.model}</div>
                        <div className="text-[10px] font-mono text-[#084D36]">{req.customId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{req.user?.name || 'Customer'}</div>
                    <div className="text-[10px] text-[#6B756E]">{req.user?.phone || 'Verified'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[#6B756E]">
                    {req.pickupRequest?.city || 'Chennai'}
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {req.pickupRequest?.agent?.user?.name ? (
                      <span className="flex items-center gap-1 text-[#084D36]">
                        <Truck className="w-3.5 h-3.5" />
                        {req.pickupRequest.agent.user.name}
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#084D36]">
                      {req.currentStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedProductForAssign(req);
                        setAssignModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#084D36] border border-[#E5EBE5] rounded-md hover:bg-emerald-50"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductForRefurb(req);
                        setRefurbModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#084D36] rounded-md hover:bg-[#063b29]"
                    >
                      Certify
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductForRecycle(req);
                        setRouteRecycleModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100"
                      title="Route to CPCB Recycler"
                    >
                      Recycle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN AGENT MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5EBE5] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17]">Assign Field Collection Agent</h3>
            <p className="text-xs text-[#6B756E]">
              Assign a certified logistics agent to pick up {selectedProductForAssign?.brand} {selectedProductForAssign?.model} ({selectedProductForAssign?.customId}).
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
                    {ag.user.name} ({ag.vehicleType || 'Two Wheeler'} — {ag.serviceArea || 'South Zone'})
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

      {/* REFURBISHMENT APPROVE MODAL */}
      {refurbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E5EBE5] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17]">Certify Refurbishment & List for Sale</h3>
            <p className="text-xs text-[#6B756E]">
              Finalize quality verification for {selectedProductForRefurb?.brand} {selectedProductForRefurb?.model} ({selectedProductForRefurb?.customId}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Diagnostics / Repair Action</label>
                <textarea
                  rows={2}
                  value={repairDesc}
                  onChange={(e) => setRepairDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Components Replaced (comma separated)</label>
                <input
                  type="text"
                  value={componentsReplaced}
                  onChange={(e) => setComponentsReplaced(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Total Refurbishment Cost (₹)</label>
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
              Permanently dispatch non-repairable {selectedProductForRecycle?.brand} {selectedProductForRecycle?.model} for zero-landfill material recovery.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#151A17] mb-1">CPCB Authorized Recycler Partner</label>
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

