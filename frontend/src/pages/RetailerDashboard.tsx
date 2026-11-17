import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  CreditCard,
  Heart,
  User as UserIcon,
  Search,
  Bell,
  Filter,
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  ChevronDown,
  X,
  FileText,
  QrCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { MarketplaceListing, Order } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';

interface RetailerDashboardProps {
  onViewPassport: (customId: string) => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ onViewPassport }) => {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();

  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'transactions'>('browse');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Filters matching screenshot
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [searchQuery, setSearchQuery] = useState('');

  // Product detail inspection modal
  const [inspectModalListing, setInspectModalListing] = useState<MarketplaceListing | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketplace();
      setListings(res.listings);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.getRetailerOrders();
      setOrders(res.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (user && user.role === 'RETAILER') {
      fetchOrders();
    }
  }, [user]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const listingIds = cart.map(item => item.id);
      const res = await api.placeOrder(listingIds, 'Retail Hub, Plot 44 Guindy Industrial Estate, Chennai');
      setOrderSuccess(res.order);
      clearCart();
      setIsCartOpen(false);
      await fetchCatalog();
      await fetchOrders();
      setActiveTab('orders');
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* 1. SIDEBAR matching reference */}
      <aside className="w-64 bg-white border-r border-[#E5EBE5] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <Store className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#084D36]">
              Re<span className="text-[#16834D]">Circuit</span>
            </span>
          </div>

          {/* Navigation Links matching reference */}
          <nav className="space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'browse'
                  ? 'text-[#6B756E] hover:bg-[#F8FAF7]'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* "Browse Products" is active in reference screenshot */}
            <button
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'browse'
                  ? 'bg-[#084D36] text-white font-semibold shadow-xs'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Browse Products</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'orders'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'transactions'
                  ? 'bg-[#084D36] text-white font-semibold'
                  : 'text-[#6B756E] hover:bg-[#F8FAF7]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Transactions</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7]"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlists</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-[#6B756E] hover:bg-[#F8FAF7]"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Retailer Profile in sidebar */}
        <div className="pt-4 border-t border-[#E5EBE5] flex items-center gap-3 px-2">
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
            alt="Retailer"
            className="w-9 h-9 rounded-full object-cover border border-[#E5EBE5]"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-[#151A17]">Apex IT Hub</div>
            <div className="text-[10px] text-[#6B756E]">Verified Retail Partner</div>
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
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#084D36] hover:bg-[#EBF8E9] rounded-lg transition-colors border border-[#E5EBE5]"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#16834D] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              )}
            </button>

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
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
                alt="Retailer"
                className="w-8 h-8 rounded-full object-cover border border-[#E5EBE5]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#151A17] leading-tight">Retailer</div>
                <div className="text-[10px] text-[#6B756E] leading-tight">Retail Partner</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 pb-32 max-w-6xl mx-auto space-y-6">
          {/* Header Row matching reference */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">
              Refurbished Devices for Retailers
            </h1>
            <p className="text-xs text-[#6B756E] mt-0.5">
              High-quality, tested and certified pre-owned electronics.
            </p>
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
                  <option value="Battery">Batteries</option>
                  <option value="GPU">GPUs</option>
                  <option value="RAM">RAM</option>
                  <option value="Motherboard">Motherboards</option>
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

          {/* PRODUCT CATALOG GRID matching reference */}
          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden hover:border-[#CCD7CE] hover:shadow-card-hover transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Area with Refurbished Badge matching screenshot */}
                    <div className="relative aspect-[16/11] bg-[#F8FAF7] p-5 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold text-[#084D36] bg-[#EBF8E9] rounded-md border border-[#d2ecd0]">
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
                      <h3 className="font-heading font-bold text-sm text-[#151A17] line-clamp-1 group-hover:text-[#084D36] transition-colors">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-[#6B756E] font-mono">
                        {item.warranty}
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart button matching screenshot */}
                  <div className="p-4 pt-2 border-t border-[#F0F4F0] space-y-3">
                    <div className="font-heading font-extrabold text-lg text-[#151A17]">
                      ₹{item.sellingPrice.toLocaleString('en-IN')}
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

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden shadow-xs">
              <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#151A17]">B2B Procurement Orders</h3>
                  <p className="text-xs text-[#6B756E]">Instant invoicing, GST credits, and certified warranties</p>
                </div>
              </div>

              {orders.length > 0 ? (
                <div className="divide-y divide-[#E5EBE5]">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-[#084D36]">{ord.orderNumber}</div>
                        <div className="text-xs text-[#151A17] font-semibold">
                          {ord.items?.length || 1} Item(s) Purchased
                        </div>
                        <div className="text-[11px] text-[#6B756E]">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-extrabold text-[#151A17]">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {ord.status}
                          </span>
                        </div>

                        <button
                          onClick={() => alert(`Invoice ${ord.invoiceNumber || 'INV-2026'} downloaded with GST compliant format.`)}
                          className="px-3 py-1.5 text-xs font-bold text-[#084D36] bg-[#EBF8E9] rounded-lg border border-[#c5e6c1] hover:bg-[#d8f2d5]"
                        >
                          Download Tax Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#6B756E]">
                  No orders placed yet. Add refurbished devices to your cart and checkout!
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-xs">
              <h3 className="font-heading font-bold text-sm text-[#151A17] mb-3">Retailer Settlement Ledger</h3>
              <p className="text-xs text-[#6B756E] mb-4">View verified payment receipts, tax breakdowns, and warranty registrations.</p>
              <div className="text-xs text-gray-500">
                All B2B purchases are backed by the ReCircuit 6-Month Comprehensive Hardware Replacement Guarantee.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SHOPPING CART SLIDEOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between bg-[#F8FAF7]">
              <div className="flex items-center gap-2 text-[#084D36]">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-[#151A17]">
                  Procurement Cart ({cart.length})
                </h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg hover:bg-gray-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={item.images[0]} alt={item.title} className="w-12 h-10 object-contain rounded-md bg-white border p-0.5" />
                      <div>
                        <div className="font-bold text-[#151A17] line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-[#084D36] font-bold">₹{item.sellingPrice.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800 text-[11px] font-semibold">
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[#6B756E]">Your cart is empty.</div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#E5EBE5] bg-white space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B756E]">Total Invoice Amount:</span>
                  <span className="font-heading font-extrabold text-lg text-[#151A17]">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[10px] text-emerald-800 bg-[#EBF8E9] p-2.5 rounded-lg border border-[#c4e4c0]">
                  Includes GST, CPCB compliance certificate, and doorstep insured freight.
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                  className="w-full py-3 bg-[#084D36] hover:bg-[#063b29] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 text-xs"
                >
                  {isPlacingOrder ? 'Processing Order...' : 'Confirm Order & Issue Payouts'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QC & SPECIFICATION DETAILS MODAL */}
      {inspectModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5EBE5] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <div>
                <h3 className="font-heading font-bold text-base text-[#084D36]">{inspectModalListing.title}</h3>
                <span className="text-xs font-mono text-[#6B756E]">Product Passport Ref: {inspectModalListing.product?.customId || 'RC-CERT-01'}</span>
              </div>
              <button onClick={() => setInspectModalListing(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#EBF8E9] rounded-xl border border-[#c4e4c0] text-[#084D36]">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#16834D]" />
                  <span>32-Point Quality Certification Verified</span>
                </div>
                <p className="text-[11px] text-[#0e6b3f] mt-1">
                  Bench diagnostic tests passed: CPU FurMark stress test (max temp 68°C), MemTest86 0 errors, battery cycle capacity {'>'}88% OEM spec.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#151A17] mb-1">Specifications:</h4>
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5]">
                  <div><span className="text-gray-500">Category:</span> <span className="font-semibold">{inspectModalListing.category}</span></div>
                  <div><span className="text-gray-500">Brand:</span> <span className="font-semibold">{inspectModalListing.brand}</span></div>
                  <div><span className="text-gray-500">Condition:</span> <span className="font-semibold">{inspectModalListing.conditionGrade}</span></div>
                  <div><span className="text-gray-500">Warranty:</span> <span className="font-semibold">{inspectModalListing.warranty}</span></div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    const id = inspectModalListing.product?.customId || 'RC-2026-00142';
                    setInspectModalListing(null);
                    onViewPassport(id);
                  }}
                  className="flex items-center gap-1 text-xs text-[#084D36] font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public QR Passport</span>
                </button>

                <button
                  onClick={() => {
                    addToCart(inspectModalListing);
                    setInspectModalListing(null);
                  }}
                  className="px-4 py-2 bg-[#084D36] text-white font-bold rounded-xl text-xs"
                >
                  Add to Cart
                </button>
              </div>
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

