import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, ShoppingCart, ChevronDown, Search, FileText, 
  ExternalLink, CheckCircle2, ShieldCheck, RefreshCw, Filter 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { MarketplaceListing } from '../../types';
import { getProductImage, handleImageFallback } from '../../utils/productImages';

export const RetailerBrowsePage: React.FC = () => {
  const { addToCart } = useCart();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [inspectModalListing, setInspectModalListing] = useState<MarketplaceListing | null>(null);

  // Sync with URL query parameter changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [window.location.search]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketplace();
      setListings(res.listings || []);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const categories = [
    'All', 'Laptop', 'Motherboard', 'Battery', 'RAM', 
    'CPU', 'GPU', 'Smartphone', 'Monitor', 'Charger'
  ];

  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Store className="w-6 h-6 text-[#16834D]" /> Wholesale Marketplace Catalog
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Verified, stress-tested pre-owned electronics with 6-month B2B hardware replacement warranty.
          </p>
        </div>
        <button
          onClick={fetchCatalog}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Catalog"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'bg-[#F8FAF7] text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100'
              }`}
            >
              {cat === 'All' ? 'All Devices' : cat === 'Battery' ? 'Batteries' : cat === 'RAM' ? 'RAM' : `${cat}s`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by brand, specs or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading verified inventory...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Store className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <p className="text-xs text-[#6B756E]">No devices matching this category or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden hover:border-[#CCD7CE] hover:shadow-card-hover transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="relative aspect-[4/3] bg-[#F8FAF7] p-5 flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductImage(item)}
                    alt={item.title}
                    onError={(e) => handleImageFallback(e, item.category)}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold text-[#084D36] bg-[#EBF8E9] rounded-md border border-[#d2ecd0]">
                    Refurbished
                  </span>

                  <button
                    onClick={() => setInspectModalListing(item)}
                    className="absolute bottom-3 left-3 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white/90 backdrop-blur-xs rounded-md border border-[#E5EBE5] hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-2xs"
                  >
                    <FileText className="w-3 h-3 text-[#084D36]" />
                    <span>Specs & QC</span>
                  </button>
                </div>

                <div className="p-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#16834D]">
                    {item.category}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#151A17] line-clamp-1 group-hover:text-[#084D36] transition-colors" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-[#6B756E] font-mono line-clamp-1">
                    {item.warranty || '6 Months Replacement Warranty'}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-[#F0F4F0] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="font-heading font-extrabold text-lg text-[#151A17]">
                    ₹{Number(item.sellingPrice).toLocaleString('en-IN')}
                  </div>
                  {item.originalPrice && item.originalPrice > item.sellingPrice && (
                    <div className="text-xs text-[#6B756E] line-through">
                      ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPECS & QC MODAL */}
      {inspectModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EBE5] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <h3 className="font-heading font-bold text-base text-[#151A17]">Hardware Specifications & QC</h3>
              <button 
                onClick={() => setInspectModalListing(null)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 bg-[#F8FAF7] p-4 rounded-2xl">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#E5EBE5] p-2 flex items-center justify-center shrink-0">
                  <img
                    src={getProductImage(inspectModalListing)}
                    alt={inspectModalListing.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#151A17]">{inspectModalListing.title}</h4>
                  <div className="font-heading font-extrabold text-base text-[#084D36] mt-0.5">
                    ₹{Number(inspectModalListing.sellingPrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#EBF8E9]/60 border border-[#C3E8BF] rounded-2xl space-y-2">
                <div className="font-bold text-[#084D36] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16834D]" /> ReCircuit Certified Refurbished
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Condition: <strong>Grade A Certified</strong></div>
                  <div>Warranty: <strong>{inspectModalListing.warranty}</strong></div>
                  <div>Display: <strong>100% Tested No Dead Pixels</strong></div>
                  <div>Battery: <strong>OEM Spec Battery</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5EBE5]">
                <Link
                  to={`/passport/${inspectModalListing.product?.customId || 'RC-2026-00142'}`}
                  target="_blank"
                  className="text-xs text-[#084D36] font-semibold flex items-center gap-1 hover:underline"
                >
                  View Digital Product Passport <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInspectModalListing(null)}
                    className="px-3 py-1.5 border border-[#E5EBE5] rounded-xl font-semibold text-[#6B756E]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      addToCart(inspectModalListing);
                      setInspectModalListing(null);
                    }}
                    className="px-4 py-1.5 bg-[#084D36] text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

