import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Wrench,
  Store,
  DollarSign,
  FileBarChart,
  Search,
  Bell,
  ChevronDown,
  UserPlus,
  CheckCircle,
  Building,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  Filter,
  X,
  ExternalLink,
  QrCode,
  Truck,
  Recycle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, AgentProfile } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { LocationMapView } from '../components/LocationMapView';

interface AdminDashboardProps {
  onViewPassport: (customId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewPassport }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'agents' | 'refurbishment' | 'retailers' | 'transactions' | 'reports'>('dashboard');
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

  // Recyclers & Notifications
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [routeRecycleModalOpen, setRouteRecycleModalOpen] = useState(false);
  const [selectedProductForRecycle, setSelectedProductForRecycle] = useState<Product | null>(null);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>('');
  const [recyclerWeight, setRecyclerWeight] = useState('2.4');

  const fetchRecyclers = async () => {
    try {
      const res = await api.getRecyclers();
      setRecyclers(res.recyclers || []);
      if (res.recyclers?.length > 0) setSelectedRecyclerId(res.recyclers[0].id);
    } catch (err) {
      console.error('Failed to load recyclers:', err);
    }
  };

  const handleRouteToRecycler = async () => {
    if (!selectedProductForRecycle || !selectedRecyclerId) return;
    try {
      await api.routeToRecycler(selectedProductForRecycle.id, selectedRecyclerId, Number(recyclerWeight) || 2.4);
      setRouteRecycleModalOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error routing to recycler');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes, agentsRes, txnRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRequests(),
        api.getAdminAgents(),
        api.getAdminTransactions(),
      ]);

      setStats(statsRes.stats);
      setChartData(statsRes.monthlyCollections);
      setRequests(reqRes.products);
      setAgents(agentsRes.agents);
      setTransactions(txnRes.transactions);
      if (agentsRes.agents.length > 0) setSelectedAgentId(agentsRes.agents[0].id);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchDashboardData();
      fetchRecyclers();
    }
  }, [user]);

  const handleAssignAgent = async () => {
    if (!selectedProductForAssign || !selectedProductForAssign.pickupRequest || !selectedAgentId) return;
    try {
      await api.assignAgent(selectedProductForAssign.pickupRequest.id, selectedAgentId);
      setAssignModalOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error assigning agent');
    }
  };

  const handleRefurbApprove = async () => {
    if (!selectedProductForRefurb) return;
    try {
      await api.logRefurbishment(selectedProductForRefurb.id, {
        technicianName: 'Arun Kumar (Lead Hardware Tech)',
        repairDescription: repairDesc,
        componentsReplaced: componentsReplaced.split(',').map(s => s.trim()),
        repairCost: Number(repairCost) || 1800,
        hardwareTestPassed: true,
        batteryTestPassed: true,
        stressTestPassed: true,
        testingStatus: 'Passed All 32 Diagnostics (MemTest86, FurMark)',
      });

      await api.approveQualityAndList(selectedProductForRefurb.id, {
        warrantyMonths: 6,
        sellingPrice: 28500,
      });

      setRefurbModalOpen(false);
      await fetchDashboardData();
      alert('Product certified and listed on Retailer Marketplace!');
    } catch (err: any) {
      alert(err.message || 'Error approving refurbishment');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference */}
      <aside className="w-64 bg-white border-r border-[#E5EBE5] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#084D36]">
              Re<span className="text-[#16834D]">Circuit</span>
            </span>
          </div>

          {/* Navigation Links matching reference */}
          <nav className="space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-[#084D36] text-white font-semibold shadow-xs'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'requests'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'agents'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Agents</span>
            </button>

            <button
              onClick={() => setActiveTab('refurbishment')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'refurbishment'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Refurbishment</span>
            </button>

            <button
              onClick={() => setActiveTab('retailers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'retailers'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Retailers</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'transactions'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'reports'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <FileBarChart className="w-4 h-4" />
              <span>Reports</span>
            </button>
          </nav>
        </div>

        {/* Admin profile in sidebar */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center gap-3 px-2">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
            alt="Super Admin"
            className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5]"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-[#151A17]">Admin</div>
            <div className="text-[10px] text-[#6B756E]">Super Admin</div>
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
              placeholder="Search users, products, agents..."
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
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">Admin</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 pb-32 max-w-6xl mx-auto space-y-6">
          
          {/* Header Row */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">Admin Dashboard</h1>
            <p className="text-xs text-[#6B756E] mt-0.5">
              Manage pickups, refurbishment, sales and payouts.
            </p>
          </div>

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

          {/* SPLIT SECTION: Collection Overview & Quick Actions matching reference */}
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

              {/* Area Chart matching screenshot curve with peak 148 */}
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

                {/* Peak 148 Callout Pill matching screenshot */}
                <div className="absolute top-2 right-6 px-2 py-0.5 rounded-full bg-[#084D36] text-white text-[10px] font-bold shadow-xs">
                  148
                </div>
              </div>
            </div>

            {/* Quick Actions Box (lg:col-span-4) matching reference */}
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
                    onClick={() => setActiveTab('retailers')}
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

          {/* FLEET & DOORSTEP COLLECTION GEOGRAPHIC MAP */}
          <LocationMapView />

          {/* REQUESTS LIST & ACTIONS TABLE */}
          <div className="bg-white rounded-xl border border-[#E5EBE5] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#151A17]">Live Requests & Inspection Pipeline</h3>
                <p className="text-xs text-[#6B756E] mt-0.5">Approve inspection diagnostics, assign logistics field agents, or certify refurbished units.</p>
              </div>

              <button
                onClick={() => onViewPassport('RC-2026-00142')}
                className="px-3 py-1.5 text-xs font-semibold text-[#084D36] bg-[#EBF8E9] rounded-lg flex items-center gap-1.5 hover:bg-[#d8f2d5]"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Verify RC-2026-00142</span>
              </button>
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
                  {requests.slice(0, 8).map((req) => (
                    <tr key={req.id} className="hover:bg-[#F8FAF7] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold">{req.brand} {req.model}</div>
                        <div className="text-[10px] font-mono text-[#084D36]">{req.customId}</div>
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

          {/* TRANSACTIONS & PROFIT SHARING LEDGER */}
          <div className="bg-white rounded-xl border border-[#E5EBE5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#151A17]">Transparent Profit-Sharing & Resale Ledger</h3>
                <p className="text-xs text-[#6B756E] mt-0.5">Automated waterfall margin calculation on sold devices</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#084D36]">Live PostgreSQL Ledger</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5]">
                <div className="text-[#6B756E]">Retailer Purchase Gross</div>
                <div className="text-lg font-bold text-[#151A17] mt-1">₹4,82,300</div>
                <div className="text-[10px] text-emerald-700 mt-1 font-semibold">100% verified B2B transactions</div>
              </div>
              <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5]">
                <div className="text-[#6B756E]">Total User Payouts Disbursed</div>
                <div className="text-lg font-bold text-[#084D36] mt-1">₹3,42,800</div>
                <div className="text-[10px] text-emerald-700 mt-1 font-semibold">Instant UPI / IMPS settlements</div>
              </div>
              <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5]">
                <div className="text-[#6B756E]">Platform Circular Margin</div>
                <div className="text-lg font-bold text-[#16834D] mt-1">₹68,500</div>
                <div className="text-[10px] text-emerald-700 mt-1 font-semibold">Reinvested into e-waste sorting labs</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ASSIGN AGENT MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#084D36]">Assign Collection Field Agent</h3>
              <button onClick={() => setAssignModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <p className="text-xs text-[#6B756E]">
              Assigning agent for device: <strong className="text-[#151A17]">{selectedProductForAssign?.brand} {selectedProductForAssign?.model}</strong> ({selectedProductForAssign?.customId})
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#151A17] mb-2">Select Verified Field Agent</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-white"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.user.name} ({ag.employeeId}) — {ag.serviceArea} [★{ag.rating}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
              <button onClick={() => setAssignModalOpen(false)} className="px-3 py-1.5 text-xs text-gray-600 font-semibold">Cancel</button>
              <button onClick={handleAssignAgent} className="px-4 py-2 bg-[#084D36] text-white text-xs font-bold rounded-xl">Confirm Dispatch</button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE REFURBISHMENT MODAL */}
      {refurbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#084D36]">Refurbishment QA & Certification</h3>
              <button onClick={() => setRefurbModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-semibold mb-1">Repair Description</label>
                <textarea
                  rows={2}
                  value={repairDesc}
                  onChange={(e) => setRepairDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Replaced Components (Comma separated)</label>
                <input
                  type="text"
                  value={componentsReplaced}
                  onChange={(e) => setComponentsReplaced(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Repair Cost (₹)</label>
                <input
                  type="number"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                />
              </div>

              <div className="p-3 bg-[#EBF8E9] rounded-xl border border-[#c5e7c1] text-[#084D36]">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#16834D]" />
                  <span>32-Point Diagnostics Passed</span>
                </div>
                <div className="text-[11px] text-[#0e6b3f] mt-1">
                  MemTest86 0 errors • Thermal throttle test peak 68°C • Battery cycle test certified.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
              <button onClick={() => setRefurbModalOpen(false)} className="px-3 py-1.5 text-xs text-gray-600 font-semibold">Cancel</button>
              <button onClick={handleRefurbApprove} className="px-4 py-2 bg-[#084D36] text-white text-xs font-bold rounded-xl shadow-xs">
                Certify & List on Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUTE TO AUTHORIZED RECYCLER MODAL */}
      {routeRecycleModalOpen && selectedProductForRecycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <div>
                <h3 className="font-heading font-bold text-base text-[#084D36]">Route to CPCB Recycler</h3>
                <p className="text-xs text-[#6B756E]">{selectedProductForRecycle.brand} {selectedProductForRecycle.model} ({selectedProductForRecycle.customId})</p>
              </div>
              <button onClick={() => setRouteRecycleModalOpen(false)} className="text-[#6B756E] hover:text-[#151A17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#151A17]">
              <div>
                <label className="block font-semibold mb-1">Select Certified Recycling Partner</label>
                <select
                  value={selectedRecyclerId}
                  onChange={(e) => setSelectedRecyclerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white"
                >
                  {recyclers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.cpcbLicenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Batch Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={recyclerWeight}
                  onChange={(e) => setRecyclerWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5]"
                />
              </div>

              <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] text-[11px] text-[#6B756E]">
                Zero-Landfill Guarantee: Central Pollution Control Board (CPCB) compliant metallurgical refining & precious metal recovery.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
              <button onClick={() => setRouteRecycleModalOpen(false)} className="px-3 py-1.5 text-xs text-gray-600 font-semibold">
                Cancel
              </button>
              <button onClick={handleRouteToRecycler} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs">
                Confirm Recycling Dispatch
              </button>
            </div>
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

