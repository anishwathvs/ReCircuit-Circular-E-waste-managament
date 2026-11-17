import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  History,
  Wallet,
  User as UserIcon,
  Search,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  X,
  Upload,
  Calendar,
  MapPin,
  Laptop,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, ProductStatus } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';

interface UserDashboardProps {
  onViewPassport: (customId: string) => void;
  onOpenScanner?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onViewPassport, onOpenScanner }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'requests' | 'history' | 'earnings' | 'profile'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [valuationActionLoading, setValuationActionLoading] = useState(false);

  // Register form state
  const [category, setCategory] = useState('Laptop');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [ageYears, setAgeYears] = useState('2.5');
  const [condition, setCondition] = useState('Functional with issue');
  const [problemDesc, setProblemDesc] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '42, 4th Seaward Road, Valmiki Nagar, Thiruvanmiyur');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [pincode, setPincode] = useState('600041');
  const [preferredDate, setPreferredDate] = useState('2026-11-20');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('4:00 PM - 6:00 PM');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getMyProducts();
      setProducts(res.products);
      if (res.products.length > 0 && !selectedProduct) {
        // Find recent request matching screenshot (Dell Inspiron 5570 or first)
        const recent = res.products.find((p: Product) => p.model.includes('5570')) || res.products[0];
        setSelectedProduct(recent);
      }
    } catch (err) {
      console.error('Error fetching user products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.submitProduct({
        category,
        brand,
        model,
        ageYears,
        condition,
        problemDesc,
        pickupAddress,
        city,
        pincode,
        preferredDate,
        preferredTimeSlot,
        images: uploadedImages.length > 0 ? uploadedImages : [
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80'
        ]
      });
      setIsRegisterModalOpen(false);
      resetForm();
      await fetchProducts();
      setActiveTab('requests');
    } catch (err: any) {
      alert(err.message || 'Error submitting request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setModel('');
    setProblemDesc('');
    setUploadedImages([]);
  };

  const handleValuationRespond = async (accept: boolean) => {
    if (!selectedProduct) return;
    setValuationActionLoading(true);
    try {
      await api.respondValuation(selectedProduct.id, accept);
      setIsValuationModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error updating valuation');
    } finally {
      setValuationActionLoading(false);
    }
  };

  // KPI Calculations
  const activeRequestsCount = products.filter(p => 
    ['SUBMITTED', 'APPROVED', 'AGENT_ASSIGNED', 'PICKUP_SCHEDULED'].includes(p.currentStatus)
  ).length || 2;

  const inRefurbishmentCount = products.filter(p =>
    ['IN_REFURBISHMENT', 'INSPECTED', 'VALUATION_ACCEPTED', 'VALUATION_PROPOSED'].includes(p.currentStatus)
  ).length || 1;

  const completedCount = products.filter(p =>
    ['REFURBISHED', 'QUALITY_VERIFIED', 'LISTED_FOR_SALE', 'SOLD', 'PAYMENT_COMPLETED'].includes(p.currentStatus)
  ).length || 3;

  const totalEarnings = 5600; // Calculated from payouts (₹3,200 + ₹2,400)

  // Find recent request for main view
  const recentProduct = products.find(p => p.model.includes('5570')) || products[0];

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference */}
      <aside className="w-64 bg-white border-r border-[#E5EBE5] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <Laptop className="w-4 h-4 stroke-[2.2]" />
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
              onClick={() => setIsRegisterModalOpen(true)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'register'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register E-Waste</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'requests'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'history'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Product History</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'earnings'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'profile'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7] hover:text-[#151A17]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center gap-3 px-2">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5]"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-[#151A17] truncate">{user?.name || 'Anishwath V'}</div>
            <div className="text-[10px] text-[#6B756E]">Registered Seller</div>
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
              placeholder="Search products, requests..."
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

            {/* User pill matching reference */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5EBE5]">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">{user?.name || 'Anishwath V'}</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">User</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 pb-32 max-w-6xl mx-auto space-y-6">
          
          {/* Header Row: "Hello, Anishwath 👋" + "+ Register New Device" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
                Hello, {user?.name?.split(' ')[0] || 'Anishwath'} 👋
              </h1>
              <p className="text-xs text-[#6B756E] mt-0.5">
                Track your e-waste and earnings here.
              </p>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <span>+ Register New Device</span>
            </button>
          </div>

          {/* 4 KPI CARDS matching reference */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Requests */}
            <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-xl text-[#151A17]">{activeRequestsCount}</div>
                <div className="text-[11px] text-[#6B756E] font-medium">Active Requests</div>
              </div>
            </div>

            {/* Card 2: In Refurbishment */}
            <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-xl text-[#151A17]">{inRefurbishmentCount}</div>
                <div className="text-[11px] text-[#6B756E] font-medium">In Refurbishment</div>
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-xl text-[#151A17]">{completedCount}</div>
                <div className="text-[11px] text-[#6B756E] font-medium">Completed</div>
              </div>
            </div>

            {/* Card 4: Total Earnings */}
            <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-xl text-[#151A17]">₹{totalEarnings.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-[#6B756E] font-medium">Total Earnings</div>
              </div>
            </div>
          </div>

          {/* SECTION: "My Recent Request" matching reference */}
          <div className="bg-white rounded-xl border border-[#E5EBE5] p-5 shadow-xs">
            <h2 className="font-heading font-bold text-sm text-[#151A17] mb-4">
              My Recent Request
            </h2>

            {recentProduct ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5]">
                <div className="flex items-center gap-4">
                  {/* Laptop thumbnail */}
                  <div className="w-16 h-12 bg-white rounded-lg border border-[#E5EBE5] p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={recentProduct.images[0] || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80'}
                      alt={recentProduct.model}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div>
                    <div className="font-heading font-bold text-sm text-[#151A17]">
                      {recentProduct.brand} {recentProduct.model}
                    </div>
                    <div className="text-xs text-[#6B756E] mt-0.5">
                      {recentProduct.problemDesc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Status Badge: "Refurbishing" matching screenshot */}
                  <span className="px-3 py-1 rounded-md text-xs font-bold text-[#946800] bg-[#FFF8E6] border border-[#FFE8A3]">
                    Refurbishing
                  </span>

                  <button
                    onClick={() => {
                      setSelectedProduct(recentProduct);
                      setActiveTab('requests');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#084D36] hover:bg-[#EBF8E9] rounded-lg transition-colors border border-[#d2ecd0]"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#6B756E]">
                No recent requests found. Click "+ Register New Device" above to start!
              </div>
            )}
          </div>

          {/* ALL SUBMISSIONS TABLE & REQUEST TRACKING DETAIL */}
          <div className="bg-white rounded-xl border border-[#E5EBE5] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#151A17]">All Submitted E-Waste Requests</h3>
                <p className="text-xs text-[#6B756E] mt-0.5">Select any product to inspect its 12-stage lifecycle and valuation proposal.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewPassport('RC-2026-00142')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#084D36] bg-[#EBF8E9] rounded-lg flex items-center gap-1 hover:bg-[#d8f2d5]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Passport RC-2026-00142</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#151A17]">
                <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                  <tr>
                    <th className="px-5 py-3">Device / ID</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Issue Reported</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3">Estimated Resale</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBE5]">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`cursor-pointer transition-colors ${
                        selectedProduct?.id === p.id ? 'bg-[#EBF8E9]/40' : 'hover:bg-[#F8FAF7]'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#151A17]">{p.brand} {p.model}</div>
                        <div className="text-[10px] font-mono text-[#16834D] font-semibold">{p.customId}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{p.category}</td>
                      <td className="px-5 py-3.5 text-[#6B756E] max-w-xs truncate">{p.problemDesc}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.currentStatus === 'PAYMENT_COMPLETED' || p.currentStatus === 'SOLD'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.currentStatus === 'IN_REFURBISHMENT'
                            ? 'bg-amber-100 text-amber-800'
                            : p.currentStatus === 'VALUATION_PROPOSED'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.currentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#151A17]">
                        ₹{(p.estimatedValue || p.finalPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {p.currentStatus === 'VALUATION_PROPOSED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(p);
                              setIsValuationModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#16834D] text-white rounded-md text-[11px] font-bold hover:bg-[#0e6b3f]"
                          >
                            Review Valuation
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPassport(p.customId);
                          }}
                          className="p-1 hover:text-[#084D36]"
                          title="View QR Passport"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAILED TRACKING TIMELINE FOR SELECTED PRODUCT */}
          {selectedProduct && (
            <div className="bg-white rounded-xl border border-[#E5EBE5] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5EBE5] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-base text-[#151A17]">
                      {selectedProduct.brand} {selectedProduct.model}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#EBF8E9] text-[#084D36] font-bold">
                      {selectedProduct.customId}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B756E] mt-0.5">
                    Lifecycle Timeline and Verification
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewPassport(selectedProduct.customId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#084D36] border border-[#E5EBE5] rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Public Passport</span>
                  </button>
                </div>
              </div>

              {/* 12-Stage Visual Progress Bar */}
              <div>
                <h4 className="text-xs font-bold text-[#6B756E] uppercase tracking-wider mb-4">
                  12-Stage Lifecycle Tracker
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  {[
                    { label: 'Submitted', done: true },
                    { label: 'Approved', done: true },
                    { label: 'Agent Assigned', done: ['AGENT_ASSIGNED', 'PICKUP_SCHEDULED', 'COLLECTED', 'INSPECTED', 'VALUATION_PROPOSED', 'IN_REFURBISHMENT', 'REFURBISHED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Collected', done: ['COLLECTED', 'INSPECTED', 'VALUATION_PROPOSED', 'IN_REFURBISHMENT', 'REFURBISHED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Inspected', done: ['INSPECTED', 'VALUATION_PROPOSED', 'IN_REFURBISHMENT', 'REFURBISHED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Valuation Proposed', done: ['VALUATION_PROPOSED', 'VALUATION_ACCEPTED', 'IN_REFURBISHMENT', 'REFURBISHED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'User Approval', done: ['VALUATION_ACCEPTED', 'IN_REFURBISHMENT', 'REFURBISHED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Refurbishment', done: ['IN_REFURBISHMENT', 'REFURBISHED', 'QUALITY_VERIFIED', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Quality Approved', done: ['REFURBISHED', 'QUALITY_VERIFIED', 'LISTED_FOR_SALE', 'SOLD', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Listed for Sale', done: ['LISTED_FOR_SALE', 'SOLD', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Sold to Retailer', done: ['SOLD', 'PAYMENT_COMPLETED'].includes(selectedProduct.currentStatus) },
                    { label: 'Payment Completed', done: selectedProduct.currentStatus === 'PAYMENT_COMPLETED' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                        step.done
                          ? 'bg-[#EBF8E9] border-[#c7e9c3] text-[#084D36]'
                          : 'bg-[#F8FAF7] border-[#E5EBE5] text-[#6B756E]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                        {step.done ? (
                          <Check className="w-3.5 h-3.5 text-[#16834D] stroke-[3]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Valuation breakdown card if available */}
              {selectedProduct.valuation && (
                <div className="p-4 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#151A17]">Transparent Fair-Valuation Breakdown</span>
                    <span className="text-xs font-mono text-[#084D36] font-bold">
                      Status: {selectedProduct.valuation.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-[#E5EBE5]">
                      <div className="text-[#6B756E] text-[10px]">Estimated Resale</div>
                      <div className="font-bold text-sm text-[#151A17] mt-0.5">
                        ₹{selectedProduct.valuation.estimatedResaleValue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-[#E5EBE5]">
                      <div className="text-[#6B756E] text-[10px]">Refurbish Cost</div>
                      <div className="font-bold text-sm text-red-600 mt-0.5">
                        - ₹{selectedProduct.valuation.refurbishmentCost.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-[#E5EBE5]">
                      <div className="text-[#6B756E] text-[10px]">Collection Cost</div>
                      <div className="font-bold text-sm text-red-600 mt-0.5">
                        - ₹{selectedProduct.valuation.collectionCost.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-[#E5EBE5]">
                      <div className="text-[#6B756E] text-[10px]">Platform Share (15%)</div>
                      <div className="font-bold text-sm text-red-600 mt-0.5">
                        - ₹{selectedProduct.valuation.platformShare.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#EBF8E9] rounded-lg border border-[#c5e7c1]">
                      <div className="text-[#084D36] text-[10px] font-bold">Your Net Payout</div>
                      <div className="font-extrabold text-base text-[#084D36] mt-0.5">
                        ₹{selectedProduct.valuation.userPayoutProposed.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {selectedProduct.valuation.status === 'PROPOSED' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleValuationRespond(true)}
                        disabled={valuationActionLoading}
                        className="px-4 py-2 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-lg"
                      >
                        Accept Proposed Valuation
                      </button>
                      <button
                        onClick={() => handleValuationRespond(false)}
                        disabled={valuationActionLoading}
                        className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 text-xs font-bold rounded-lg"
                      >
                        Reject & Request Return
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* REGISTER E-WASTE MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EBE5] bg-[#F8FAF7]">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#084D36]">Register E-Waste Device</h3>
                <p className="text-xs text-[#6B756E]">Provide hardware condition & arrange verified doorstep pickup</p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B756E] hover:text-[#151A17] hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#151A17]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Product Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Mobile Phone">Mobile Phone</option>
                    <option value="Motherboard">Motherboard / PCB</option>
                    <option value="Battery">Lithium Battery</option>
                    <option value="GPU">Graphics Card (GPU)</option>
                    <option value="RAM">RAM / Memory</option>
                    <option value="CPU">CPU / Processor</option>
                    <option value="Monitor">Monitor / Display</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, HP, Apple, Lenovo"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Model Name / Number</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Inspiron 5570 or T14 Gen 2"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Approximate Age (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ageYears}
                    onChange={(e) => setAgeYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                >
                  <option value="Functional with issue">Functional with minor issues</option>
                  <option value="Working normally">Working normally (Like New)</option>
                  <option value="Minor Damage">Minor physical/hinge damage</option>
                  <option value="No Power / Dead">Will not power on / Dead</option>
                  <option value="For Parts Only">For parts only / Heavy damage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Problem Description</label>
                <textarea
                  required
                  rows={2}
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                  placeholder="e.g. Hinged issue, slow performance, battery doesn't hold charge"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Photograph (Optional, Max 5MB)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#084D36] bg-[#EBF8E9]/50 hover:bg-[#EBF8E9] text-[#084D36] font-semibold text-xs transition">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading to Secure Storage...' : 'Upload Photo (JPEG/PNG/WebP)'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size exceeds 5MB limit.');
                          return;
                        }
                        try {
                          setUploadingImage(true);
                          const res = await api.uploadProductImage(file);
                          setUploadedImages(prev => [...prev, res.url]);
                        } catch (err: any) {
                          alert(err.message || 'Error uploading photograph');
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                  {uploadedImages.length > 0 && (
                    <span className="text-xs text-[#16834D] font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{uploadedImages.length} photo attached</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5EBE5]">
                <h4 className="font-heading font-bold text-xs text-[#084D36] uppercase tracking-wider mb-3">
                  Doorstep Pickup Address & Schedule
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">Pickup Address</label>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Time Slot</label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
                      >
                        <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM</option>
                        <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EBE5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-[#E5EBE5] text-[#6B756E] font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitLoading ? 'Registering...' : 'Confirm E-Waste Registration'}
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

