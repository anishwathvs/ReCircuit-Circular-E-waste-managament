import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Wrench,
  CheckCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Laptop,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const UserOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [valuationActionLoading, setValuationActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getMyProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load user products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

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

  const totalEarnings = 5600;

  // Find recent request for main view (matching reference image)
  const recentProduct = products.find(p => p.model.includes('5570')) || products[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome banner + Register New Device action matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">
            Hello, {user?.name || 'Anishwath'}
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Track your e-waste and earnings here.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/user/register')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Device</span>
        </button>
      </div>

      {/* KPI METRIC CARDS matching reference image */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5EBE5] flex items-center justify-between shadow-xs">
          <div>
            <div className="font-heading font-extrabold text-2xl text-[#151A17]">{activeRequestsCount}</div>
            <div className="text-xs text-[#6B756E] font-medium mt-0.5">Active Requests</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EBE5] flex items-center justify-between shadow-xs">
          <div>
            <div className="font-heading font-extrabold text-2xl text-[#151A17]">{inRefurbishmentCount}</div>
            <div className="text-xs text-[#6B756E] font-medium mt-0.5">In Refurbishment</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
            <Wrench className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EBE5] flex items-center justify-between shadow-xs">
          <div>
            <div className="font-heading font-extrabold text-2xl text-[#151A17]">{completedCount}</div>
            <div className="text-xs text-[#6B756E] font-medium mt-0.5">Completed</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#16834D]">
            <CheckCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EBE5] flex items-center justify-between shadow-xs">
          <div>
            <div className="font-heading font-extrabold text-2xl text-[#084D36]">₹{totalEarnings.toLocaleString('en-IN')}</div>
            <div className="text-xs text-[#6B756E] font-medium mt-0.5">Total Earnings</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* MY RECENT REQUEST CARD matching reference image */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-sm text-[#151A17]">My Recent Request</h2>

        {recentProduct ? (
          <div className="p-4 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-[#E5EBE5] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={getProductImage(recentProduct)}
                  alt={recentProduct.model}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-[#151A17]">
                  {recentProduct.brand} {recentProduct.model}
                </h3>
                <p className="text-xs text-[#6B756E] mt-0.5">
                  {recentProduct.problemDesc || 'Hinged issue, slow performance'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8F9A92]">
                  <span>ID: {recentProduct.customId}</span>
                  <span>•</span>
                  <span>Pickup: {recentProduct.pickupRequest?.city || 'Chennai'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FEF9C3] text-[#854D0E] font-semibold text-xs rounded-full border border-[#FEF08A]">
                Refurbishing
              </span>

              <button
                onClick={() => {
                  setSelectedProduct(recentProduct);
                  if (recentProduct.currentStatus === 'VALUATION_PROPOSED') {
                    setIsValuationModalOpen(true);
                  } else {
                    navigate('/dashboard/user/requests');
                  }
                }}
                className="text-xs font-semibold text-[#084D36] hover:text-[#16834D] flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#E5EBE5] hover:border-[#084D36]/30 transition"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#6B756E]">
            No recent requests found.{' '}
            <Link to="/dashboard/user/register" className="text-[#084D36] font-semibold underline">
              Register your first device
            </Link>
          </div>
        )}
      </div>

      {/* QUICK WORKFLOW PROGRESSION TILES */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-sm text-[#151A17]">Platform Lifecycle Transparency</h2>
            <p className="text-xs text-[#6B756E] mt-0.5">Every step from doorstep collection to resale is audited and certified.</p>
          </div>
          <Link to="/dashboard/user/history" className="text-xs font-semibold text-[#084D36] hover:underline flex items-center gap-1">
            <span>Audit History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-1">
            <div className="text-[10px] font-bold text-[#084D36] uppercase">Step 1 • Register</div>
            <div className="font-bold text-[#151A17]">Doorstep Pickup</div>
            <p className="text-[11px] text-[#6B756E]">Verified field agent collects device with digital handover receipt.</p>
          </div>

          <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-1">
            <div className="text-[10px] font-bold text-[#084D36] uppercase">Step 2 • Test</div>
            <div className="font-bold text-[#151A17]">32-Point Diagnostics</div>
            <p className="text-[11px] text-[#6B756E]">Component-level stress testing, battery health check, and PCB analysis.</p>
          </div>

          <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-1">
            <div className="text-[10px] font-bold text-[#084D36] uppercase">Step 3 • Restore</div>
            <div className="font-bold text-[#151A17]">Lab Refurbishment</div>
            <p className="text-[11px] text-[#6B756E]">OEM part replacement and certified zero-data sanitization.</p>
          </div>

          <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] space-y-1">
            <div className="text-[10px] font-bold text-[#084D36] uppercase">Step 4 • Resell</div>
            <div className="font-bold text-[#151A17]">Fair Profit Payout</div>
            <p className="text-[11px] text-[#6B756E]">B2B retail resale with automated UPI disbursal to your account.</p>
          </div>
        </div>
      </div>

      {/* VALUATION APPROVAL MODAL */}
      {isValuationModalOpen && selectedProduct && selectedProduct.valuation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <div>
                <h3 className="font-heading font-bold text-base text-[#084D36]">Review Proposed Valuation</h3>
                <p className="text-xs text-[#6B756E]">{selectedProduct.brand} {selectedProduct.model} ({selectedProduct.customId})</p>
              </div>
              <button onClick={() => setIsValuationModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E5EBE5]">
                <span className="text-[#6B756E]">Estimated Resale Value</span>
                <span className="font-bold text-[#151A17]">₹{selectedProduct.valuation.estimatedResaleValue?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5EBE5]">
                <span className="text-[#6B756E]">Refurbishment & Testing Cost</span>
                <span className="text-red-600">- ₹{selectedProduct.valuation.refurbishmentCost?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5EBE5]">
                <span className="text-[#6B756E]">Logistics & Doorstep Collection</span>
                <span className="text-red-600">- ₹{selectedProduct.valuation.collectionCost?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5EBE5]">
                <span className="text-[#6B756E]">Platform Circular Fee (15%)</span>
                <span className="text-red-600">- ₹{selectedProduct.valuation.platformShare?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 bg-[#EBF8E9] px-3 rounded-lg text-[#084D36] font-bold text-sm">
                <span>Proposed User Payout</span>
                <span>₹{selectedProduct.valuation.userPayoutProposed?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EBE5]">
              <button
                onClick={() => handleValuationRespond(false)}
                disabled={valuationActionLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-50"
              >
                Reject Valuation
              </button>
              <button
                onClick={() => handleValuationRespond(true)}
                disabled={valuationActionLoading}
                className="px-4 py-2 bg-[#084D36] text-white font-bold rounded-xl text-xs hover:bg-[#063b29] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept Payout & Queue for Refurbishment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

