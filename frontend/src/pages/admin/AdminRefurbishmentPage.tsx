import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Clock, DollarSign, Cpu, Battery, 
  ShieldCheck, ArrowRight, Laptop 
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const AdminRefurbishmentPage: React.FC = () => {
  const [requests, setRequests] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refurbModalOpen, setRefurbModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [repairDesc, setRepairDesc] = useState('Deep ultrasonic cleaning, thermal paste re-application, replaced battery cells');
  const [componentsReplaced, setComponentsReplaced] = useState('54Wh OEM Battery, Thermal Grizzly Kryonaut, Rubber Feet');
  const [repairCost, setRepairCost] = useState('1850');
  const [listingPrice, setListingPrice] = useState('28500');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRefurbRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRequests();
      setRequests(res.products || []);
    } catch (err) {
      console.error('Failed to load refurb queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefurbRequests();
  }, []);

  const refurbQueue = requests.filter(
    (r) => r.currentStatus === 'IN_REFURBISHMENT' || r.currentStatus === 'INSPECTED'
  );
  const completedRefurbs = requests.filter(
    (r) => r.currentStatus === 'REFURBISHED' || r.currentStatus === 'SOLD_TO_RETAILER'
  );

  const handleOpenCertify = (product: Product) => {
    setSelectedProduct(product);
    const est = product.estimatedValue ? Math.round(Number(product.estimatedValue) * 1.3) : 24000;
    setListingPrice(String(est));
    setRefurbModalOpen(true);
  };

  const handleCertify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setSaving(true);
      setMessage(null);
      await api.certifyRefurbishment(selectedProduct.id, {
        repairDescription: repairDesc,
        componentsReplaced: componentsReplaced.split(',').map((s) => s.trim()),
        cost: Number(repairCost) || 0,
      });
      setMessage({
        type: 'success',
        text: `Device ${selectedProduct.brand} ${selectedProduct.model} certified & listed for sale at ₹${Number(listingPrice).toLocaleString()}!`,
      });
      setRefurbModalOpen(false);
      await fetchRefurbRequests();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to certify refurbishment',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#16834D]" /> Refurbishment & Quality Assurance Lab
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Log diagnostics, record replaced components, and grant certified circular product passports.
          </p>
        </div>
        <button
          onClick={fetchRefurbRequests}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Active in Lab</span>
            <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-600">{refurbQueue.length}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Awaiting repair & QA signoff</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Certified & Market-Ready</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16834D]">{completedRefurbs.length}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Listed on Retailer Marketplace</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Quality Verification SLA</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#084D36]">48 Hours</div>
          <span className="text-[11px] text-[#16834D] font-medium mt-1 block">
            100% Tested & Warranty Backed
          </span>
        </div>
      </div>

      {/* Lab Queue Section */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#151A17]">Pending Refurbishment Queue</h3>
            <p className="text-xs text-[#6B756E]">Inspect hardware integrity, conduct diagnostics, and clear units for resale.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading refurbishment queue...</p>
          </div>
        ) : refurbQueue.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No devices currently waiting in the refurbishment queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5EBE5]">
            {refurbQueue.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#F8FAF7]/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={getProductImage(item)}
                      alt={item.model}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-[#151A17]">
                        {item.brand} {item.model}
                      </h4>
                      <span className="font-mono text-xs font-bold text-[#084D36] bg-[#EBF8E9] px-2 py-0.5 rounded-sm">
                        {item.customId}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B756E] mt-1">
                      <span>Reported issue: <strong className="text-[#151A17]">{item.issueDescription || 'Hinged issue, slow performance'}</strong></span>
                    </div>
                    {item.inspections && item.inspections.length > 0 && (
                      <div className="text-xs text-[#16834D] mt-0.5 font-medium">
                        Inspection Finding: {item.inspections[0].physicalCondition} condition • Valuation: ₹{item.inspections[0].valuationPrice}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Link
                    to={`/passport/${item.customId}`}
                    target="_blank"
                    className="px-3 py-1.5 border border-[#E5EBE5] rounded-xl text-xs font-semibold text-[#6B756E] hover:bg-gray-50 flex items-center gap-1"
                  >
                    Passport <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleOpenCertify(item)}
                    className="px-4 py-2 bg-[#084D36] hover:bg-[#063b2a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Certify & List
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CERTIFY MODAL */}
      {refurbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16834D]" /> Issue ReCircuit Certification
              </h3>
              <button 
                onClick={() => setRefurbModalOpen(false)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCertify} className="space-y-4 text-xs">
              <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E5EBE5]">
                <div className="text-xs text-[#6B756E]">Device to be certified:</div>
                <div className="font-bold text-sm text-[#151A17]">{selectedProduct?.brand} {selectedProduct?.model}</div>
                <div className="font-mono text-xs text-[#084D36]">{selectedProduct?.customId}</div>
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Repair / Diagnostic Details</label>
                <textarea
                  rows={2}
                  value={repairDesc}
                  onChange={(e) => setRepairDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#151A17] mb-1">Replaced Components (comma-separated)</label>
                <input
                  type="text"
                  value={componentsReplaced}
                  onChange={(e) => setComponentsReplaced(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Refurbishment Cost (₹)</label>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#151A17] mb-1">Marketplace Resale Price (₹)</label>
                  <input
                    type="number"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5EBE5]">
                <button
                  type="button"
                  onClick={() => setRefurbModalOpen(false)}
                  className="px-3 py-2 text-xs text-[#6B756E] border border-[#E5EBE5] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#084D36] rounded-xl hover:bg-[#063b2a] disabled:opacity-50"
                >
                  {saving ? 'Certifying...' : 'Certify & List for Retailers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

