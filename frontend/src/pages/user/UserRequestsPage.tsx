import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Search, Eye, ExternalLink, CheckCircle2, 
  XCircle, Clock, ArrowRight, Laptop, Smartphone, 
  Cpu, HardDrive, Filter, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export const UserRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getMyProducts();
      setProducts(res.products || res.data || []);
    } catch (err) {
      console.error('Failed to load user products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleValuationResponse = async (productId: string, accept: boolean) => {
    try {
      setRespondingId(productId);
      await api.respondValuation(productId, accept);
      setActionSuccess(`Valuation ${accept ? 'accepted' : 'declined'} successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update valuation status');
    } finally {
      setRespondingId(null);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr?.toUpperCase() || '';
    if (s === 'SUBMITTED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pickup Pending</span>;
    }
    if (s === 'ASSIGNED' || s === 'AGENT_ASSIGNED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Agent Assigned</span>;
    }
    if (s === 'COLLECTED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Collected</span>;
    }
    if (s === 'INSPECTED' || s === 'VALUATION_PROPOSED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Inspected / Valuation</span>;
    }
    if (s === 'IN_REFURBISHMENT' || s === 'VALUATION_ACCEPTED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF]">Refurbishing</span>;
    }
    if (s === 'REFURBISHED' || s === 'LISTED_FOR_SALE') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Listed for Sale</span>;
    }
    if (s === 'SOLD' || s === 'SOLD_TO_RETAILER' || s === 'PAYMENT_COMPLETED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#084D36] text-white">Sold & Paid</span>;
    }
    if (s === 'SENT_FOR_RECYCLING' || s === 'RECYCLED' || s === 'RECYCLE_PENDING') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">Recycled</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">{statusStr}</span>;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const s = (p.currentStatus || p.status || '').toUpperCase();
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return ['SUBMITTED', 'ASSIGNED', 'AGENT_ASSIGNED', 'PICKUP_SCHEDULED'].includes(s);
    if (statusFilter === 'INSPECTION') return ['COLLECTED', 'INSPECTED', 'VALUATION_PROPOSED'].includes(s);
    if (statusFilter === 'REFURBISHING') return ['IN_REFURBISHMENT', 'VALUATION_ACCEPTED', 'REFURBISHED', 'LISTED_FOR_SALE'].includes(s);
    if (statusFilter === 'COMPLETED') return ['SOLD', 'SOLD_TO_RETAILER', 'PAYMENT_COMPLETED'].includes(s);
    if (statusFilter === 'RECYCLED') return ['SENT_FOR_RECYCLING', 'RECYCLED', 'RECYCLE_PENDING'].includes(s);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">My E-Waste Requests</h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Monitor real-time pickup status, agent reports, valuations, and payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/dashboard/user/register')}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            + Register New Device
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-[#EBF8E9] border border-[#C3E8BF] text-[#16834D] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by brand, model or Product ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'PENDING', label: 'Pickup Pending' },
            { id: 'INSPECTION', label: 'In Inspection' },
            { id: 'REFURBISHING', label: 'Refurbishing' },
            { id: 'COMPLETED', label: 'Paid & Closed' },
            { id: 'RECYCLED', label: 'Recycled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#084D36] text-white'
                  : 'bg-[#F8FAF7] text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading your registered devices...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Package className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-sm text-[#151A17] mb-1">No requests found</h3>
          <p className="text-xs text-[#6B756E] mb-4">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search query or filters.'
              : 'You have not submitted any e-waste yet.'}
          </p>
          <button
            onClick={() => navigate('/dashboard/user/register')}
            className="bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            Submit Your First Device <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const status = p.currentStatus || p.status || 'SUBMITTED';
            const valuationData = p.valuation || (p.inspections?.[0]?.valuationPrice ? { userPayoutProposed: p.inspections[0].valuationPrice } : null);
            const payoutAmount = p.userPayoutAmount || valuationData?.userPayoutProposed || p.estimatedValue || 0;
            const hasPendingOffer = status === 'VALUATION_PROPOSED' || (status === 'INSPECTED' && valuationData);

            return (
              <div 
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs hover:border-[#C3E8BF] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={getProductImage(p)} 
                      alt={p.model} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading font-bold text-sm text-[#151A17]">
                        {p.brand} {p.model}
                      </h4>
                      {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6B756E] mt-1">
                      <span>ID: <code className="text-[#084D36] font-mono font-medium">{p.customId}</code></span>
                      <span>•</span>
                      <span>Category: <strong className="text-[#151A17]">{p.category}</strong></span>
                      <span>•</span>
                      <span>Submitted: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {(p.problemDesc || p.issueDescription) && (
                      <p className="text-xs text-[#6B756E] line-clamp-1 mt-1">
                        Reported Issue: {p.problemDesc || p.issueDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Valuation, Action & Passport link */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#E5EBE5]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-[#6B756E] uppercase tracking-wider block">Estimated Payout</span>
                    <span className="font-heading font-bold text-base text-[#084D36]">
                      ₹{Number(payoutAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {hasPendingOffer && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleValuationResponse(p.id, true)}
                        disabled={respondingId === p.id}
                        className="px-2.5 py-1 bg-[#16834D] hover:bg-[#084D36] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleValuationResponse(p.id, false)}
                        disabled={respondingId === p.id}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="px-3 py-1.5 rounded-lg border border-[#E5EBE5] hover:bg-gray-50 text-xs font-medium text-[#151A17] flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <Link
                      to={`/passport/${p.customId}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-[#EBF8E9] hover:bg-[#daf2d8] text-xs font-semibold text-[#16834D] flex items-center gap-1.5 transition-colors"
                    >
                      Passport <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#084D36]" />
                <h3 className="font-heading font-bold text-base text-[#151A17]">Request Details</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#F8FAF7] p-3 rounded-xl">
                <div>
                  <div className="text-xs text-[#6B756E]">Device ID</div>
                  <div className="font-mono text-sm font-bold text-[#084D36]">{selectedProduct.customId}</div>
                </div>
                <div>{getStatusBadge(selectedProduct.currentStatus || selectedProduct.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Brand & Model:</span>
                  <strong className="text-[#151A17]">{selectedProduct.brand} {selectedProduct.model}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Category:</span>
                  <strong className="text-[#151A17]">{selectedProduct.category}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Age / Usage:</span>
                  <strong className="text-[#151A17]">{selectedProduct.ageYears ? `${selectedProduct.ageYears} Years` : '2 Years'}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[#6B756E] block">Estimated Value:</span>
                  <strong className="text-[#084D36]">₹{Number(selectedProduct.userPayoutAmount || selectedProduct.estimatedValue || 0).toLocaleString()}</strong>
                </div>
              </div>

              {(selectedProduct.problemDesc || selectedProduct.issueDescription) && (
                <div className="p-3 bg-gray-50 rounded-xl text-xs">
                  <span className="text-[#6B756E] block mb-1">Reported Issue:</span>
                  <p className="text-[#151A17]">{selectedProduct.problemDesc || selectedProduct.issueDescription}</p>
                </div>
              )}

              {/* Inspection Info if any */}
              {(selectedProduct.inspection || selectedProduct.inspections?.[0]) && (
                <div className="p-4 bg-[#EBF8E9]/50 border border-[#C3E8BF] rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-[#084D36] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16834D]" /> Agent Physical Inspection Report
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Condition: <strong>{(selectedProduct.inspection || selectedProduct.inspections[0]).physicalCondition}</strong></div>
                    <div>Power On: <strong>{(selectedProduct.inspection || selectedProduct.inspections[0]).powerOnStatus ? 'Yes' : 'No'}</strong></div>
                    <div>Battery Health: <strong>{(selectedProduct.inspection || selectedProduct.inspections[0]).batteryHealth || 'N/A'}%</strong></div>
                    <div>Recommendation: <strong className="text-[#084D36]">{(selectedProduct.inspection || selectedProduct.inspections[0]).recommendation}</strong></div>
                  </div>
                  {(selectedProduct.inspection || selectedProduct.inspections[0]).inspectionNotes && (
                    <p className="text-[#6B756E] italic mt-1">"{(selectedProduct.inspection || selectedProduct.inspections[0]).inspectionNotes}"</p>
                  )}
                </div>
              )}

              {/* Action link to passport */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-[#E5EBE5] rounded-xl text-xs font-semibold text-[#6B756E] hover:bg-gray-50"
                >
                  Close
                </button>
                <Link
                  to={`/passport/${selectedProduct.customId}`}
                  target="_blank"
                  className="px-4 py-2 bg-[#084D36] text-white rounded-xl text-xs font-semibold hover:bg-[#063b2a] flex items-center gap-1.5"
                >
                  View Digital Passport <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
