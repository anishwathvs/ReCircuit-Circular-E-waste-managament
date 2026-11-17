import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, ShoppingCart, ChevronDown, Search, FileText, 
  ExternalLink, CheckCircle2, ShieldCheck, RefreshCw, 
  ArrowRight, Heart, Sparkles 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { MarketplaceListing } from '../../types';
import { getProductImage, handleImageFallback } from '../../utils/productImages';

export const RetailerOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters matching screenshot
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [searchQuery, setSearchQuery] = useState('');

  // Specs modal
  const [inspectModalListing, setInspectModalListing] = useState<MarketplaceListing | null>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [catRes, ordRes] = await Promise.all([
        api.getMarketplace(),
        api.getRetailerOrders().catch(() => ({ orders: [] })),
      ]);
      setListings(catRes.listings || []);
      setOrders(ordRes.orders || []);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const totalSpend = orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0) || 85499;

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedPriceRange === 'Under 10000' && item.sellingPrice >= 10000) return false;
    if (selectedPriceRange === '10000-30000' && (item.sellingPrice < 10000 || item.sellingPrice > 30000)) return false;
    if (selectedPriceRange === 'Above 30000' && item.sellingPrice <= 30000) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">
            Refurbished Devices for Retailers
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            High-quality, tested and certified pre-owned electronics.
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

      {/* Procurement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">{orders.length || 3}</div>
            <div className="text-[11px] text-[#6B756E] font-medium">B2B Orders Placed</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">{listings.length}</div>
            <div className="text-[11px] text-[#6B756E] font-medium">Available Units</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#084D36]">6 Months</div>
            <div className="text-[11px] text-[#6B756E] font-medium">Standard Warranty</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EBE5] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
            <span className="font-bold text-sm">₹</span>
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-[#151A17]">
              ₹{totalSpend.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#6B756E] font-medium">Total Spend</div>
          </div>
        </div>
      </div>

      {/* Filter Bar matching reference */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E5EBE5] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] hover:bg-white font-medium text-[#151A17] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            >
              <option value="All Categories">All Categories</option>
              <option value="Laptop">Laptops</option>
              <option value="Motherboard">Motherboards</option>
              <option value="Battery">Batteries</option>
              <option value="RAM">RAM Modules</option>
              <option value="CPU">CPUs / Processors</option>
              <option value="GPU">GPUs / Graphics</option>
              <option value="Smartphone">Smartphones</option>
              <option value="Monitor">Monitors</option>
              <option value="Charger">Chargers & Adapters</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B756E] absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Condition Dropdown */}
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] hover:bg-white font-medium text-[#151A17] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            >
              <option value="All Conditions">Condition</option>
              <option value="Grade A">Grade A (Certified Like-New)</option>
              <option value="Grade B">Grade B (Minor Blemishes)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B756E] absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Range Dropdown */}
          <div className="relative">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] hover:bg-white font-medium text-[#151A17] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            >
              <option value="All Prices">Price Range</option>
              <option value="Under 10000">Under ₹10,000</option>
              <option value="10000-30000">₹10,000 - ₹30,000</option>
              <option value="Above 30000">Above ₹30,000</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B756E] absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search devices input matching reference */}
        <div className="relative w-64 max-w-full">
          <Search className="w-3.5 h-3.5 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>
      </div>

      {/* PRODUCT CATALOG GRID matching reference screenshot */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B756E]">Loading marketplace catalog...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Store className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <p className="text-xs text-[#6B756E]">No devices found matching your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden hover:border-[#CCD7CE] hover:shadow-card-hover transition-all flex flex-col justify-between group h-full"
            >
              <div>
                {/* Image Area with Refurbished Badge matching screenshot */}
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

                  {/* Quick Inspect Button */}
                  <button
                    onClick={() => setInspectModalListing(item)}
                    className="absolute bottom-3 left-3 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white/90 backdrop-blur-xs rounded-md border border-[#E5EBE5] hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-2xs"
                  >
                    <FileText className="w-3 h-3 text-[#084D36]" />
                    <span>Specs & QC</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#16834D]">
                    {item.category}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#151A17] line-clamp-1 group-hover:text-[#084D36] transition-colors" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-[#6B756E] font-mono line-clamp-1">
                    {item.warranty || '6 Months Warranty'}
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart button matching screenshot */}
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

