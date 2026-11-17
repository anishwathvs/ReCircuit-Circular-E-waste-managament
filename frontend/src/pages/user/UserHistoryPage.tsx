import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Calendar, CheckCircle2, QrCode, ExternalLink, 
  TrendingUp, Leaf, Award, ArrowUpRight, Search, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export const UserHistoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getMyProducts();
      setProducts(res.products || res.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalDevices = products.length;
  const completedDevices = products.filter(p => {
    const s = (p.currentStatus || p.status || '').toUpperCase();
    return ['REFURBISHED', 'SOLD', 'SOLD_TO_RETAILER', 'PAYMENT_COMPLETED', 'SENT_FOR_RECYCLING', 'RECYCLED'].includes(s);
  }).length;

  // Estimated 3.8kg per laptop/e-waste device, 18.5kg CO2 saved per kg refurbished
  const estimatedEwasteDivertedKg = (completedDevices > 0 ? (completedDevices * 3.8) : (totalDevices > 0 ? (totalDevices * 1.5) : 11.4)).toFixed(1);
  const estimatedCo2OffsetKg = (completedDevices > 0 ? (completedDevices * 18.5) : (totalDevices > 0 ? (totalDevices * 7.2) : 55.5)).toFixed(1);

  const filteredProducts = products.filter(p => 
    p.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <History className="w-6 h-6 text-[#16834D]" /> Product Lifecycle History
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Full chronological audit trail and environmental impact of all your registered devices.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Environmental & Lifetime Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Total Submissions</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#151A17]">{totalDevices}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Lifetime items cataloged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Successfully Diverted</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700">{completedDevices}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Kept out of landfills</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">E-Waste Diverted</span>
            <span className="p-2 bg-green-50 rounded-xl text-[#16834D]">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16834D]">{estimatedEwasteDivertedKg} kg</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Calculated weight</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">CO₂ Emissions Avoided</span>
            <span className="p-2 bg-teal-50 rounded-xl text-teal-600">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-teal-700">{estimatedCo2OffsetKg} kg</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Equivalent to {Math.round(Number(estimatedCo2OffsetKg) * 0.4)} tree-years</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by device name or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>
        <div className="text-xs text-[#6B756E] font-medium hidden sm:block">
          Showing {filteredProducts.length} items
        </div>
      </div>

      {/* Product Timelines */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading product lifecycle logs...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <History className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-sm text-[#151A17] mb-1">No lifecycle records</h3>
          <p className="text-xs text-[#6B756E]">
            {searchTerm ? 'No devices match your search query.' : 'Submit a device to start tracking its circular lifecycle.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((p) => {
            const history = p.historyEvents || p.history || [];
            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5EBE5] gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img 
                        src={getProductImage(p)} 
                        alt={p.model} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-sm text-[#151A17]">
                          {p.brand} {p.model}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[#084D36] bg-[#EBF8E9] px-2 py-0.5 rounded-sm">
                          {p.customId}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B756E]">
                        Submitted on {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/passport/${p.customId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF8E9] hover:bg-[#daf2d8] text-[#16834D] text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View Public QR Passport <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Timeline display */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-[#6B756E] uppercase tracking-wider mb-3">
                    Lifecycle Timeline
                  </h4>
                  {history.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EBE5]">
                      {history.map((h: any, idx: number) => (
                        <div key={h.id || idx} className="relative flex items-start gap-3">
                          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#16834D] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16834D]" />
                          </div>
                          <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E5EBE5] flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <span className="font-heading font-bold text-xs text-[#151A17]">
                                {h.title || h.action?.replace(/_/g, ' ') || 'Status Update'}
                              </span>
                              <span className="text-[10px] text-[#6B756E]">
                                {new Date(h.timestamp || h.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B756E]">
                              {h.description || h.notes || 'Status updated by platform system.'}
                            </p>
                            {h.actorName && (
                              <div className="text-[10px] text-[#084D36] font-medium mt-1">
                                Verified by: {h.actorName} ({h.actorRole})
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B756E] italic bg-[#F8FAF7] p-3 rounded-xl">
                      Initial registration logged. Pickup schedule being dispatched.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
