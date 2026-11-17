import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  QrCode,
  Laptop,
  Recycle,
  Scale,
  Users,
  Truck,
  Wrench,
  Coins,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Leaf,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { HeroGraphic } from '../components/HeroGraphic';
import { useCart } from '../context/CartContext';
import { MarketplaceListing } from '../types';
import { getProductImage, handleImageFallback } from '../utils/productImages';

interface LandingPageProps {
  onRegisterClick: () => void;
  onTrackClick: () => void;
  onViewPassport: (id?: string) => void;
  onViewMarketplace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRegisterClick,
  onTrackClick,
  onViewPassport,
  onViewMarketplace,
}) => {
  const { addToCart } = useCart();

  // Featured sample products matching reference image bottom row
  const featuredProducts = [
    {
      id: 'feat-1',
      productId: 'p-1',
      title: 'Dell Latitude 5420',
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      conditionGrade: 'Refurbished',
      sellingPrice: 28500,
      originalPrice: 62000,
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'],
      warranty: '6 Months Warranty',
      isAvailable: true,
      listedAt: '2026-11-15',
    },
    {
      id: 'feat-2',
      productId: 'p-2',
      title: 'HP ProBook 440 G7',
      category: 'Laptop',
      brand: 'HP',
      model: 'ProBook 440 G7',
      conditionGrade: 'Refurbished',
      sellingPrice: 24000,
      originalPrice: 48000,
      images: ['https://images.unsplash.com/photo-1663354027456-ce6a7e07d212?w=600&auto=format&fit=crop&q=80'],
      warranty: '6 Months Warranty',
      isAvailable: true,
      listedAt: '2026-11-14',
    },
    {
      id: 'feat-3',
      productId: 'p-3',
      title: 'Lenovo ThinkPad T14',
      category: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      conditionGrade: 'Refurbished',
      sellingPrice: 32999,
      originalPrice: 70000,
      images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80'],
      warranty: '12 Months Warranty',
      isAvailable: true,
      listedAt: '2026-11-13',
    },
    {
      id: 'feat-4',
      productId: 'p-4',
      title: 'Laptop Battery (Original)',
      category: 'Battery',
      brand: 'Dell OEM',
      model: '54Wh Type 4GVGH',
      conditionGrade: 'Refurbished',
      sellingPrice: 2800,
      originalPrice: 4500,
      images: ['/images/products/laptop-battery.svg'],
      warranty: '3 Months Warranty',
      isAvailable: true,
      listedAt: '2026-11-12',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#E5EBE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Pill badge matching reference */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF8E9] border border-[#d2ecd0] text-[#084D36] text-[13px] font-semibold">
                <Leaf className="w-4 h-4 text-[#16834D]" />
                <span>Smart E-Waste Management</span>
              </div>

              {/* Main Headline matching reference */}
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[56px] leading-[1.12] text-[#151A17] tracking-tight">
                Give Your Electronics <br className="hidden sm:inline" />
                <span className="text-[#16834D]">a Second Life</span>
              </h1>

              {/* Description matching reference */}
              <p className="text-base sm:text-lg text-[#6B756E] leading-relaxed max-w-xl mx-auto lg:mx-0">
                A circular e-waste platform to collect, refurbish and resell electronics with full transparency and fair profit sharing.
              </p>

              {/* Action Buttons matching reference */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#084D36] hover:bg-[#063b29] text-white text-[15px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <span>Register E-Waste</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  onClick={onTrackClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-gray-50 text-[#151A17] text-[15px] font-semibold rounded-xl border border-[#E5EBE5] shadow-xs hover:border-[#CCD7CE] transition-all"
                >
                  <QrCode className="w-4 h-4 text-[#084D36]" />
                  <span>Track Your Product</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual matching reference */}
            <div className="lg:col-span-6 flex justify-center">
              <HeroGraphic onQrClick={() => onViewPassport('RC-2026-00142')} />
            </div>

          </div>
        </div>
      </section>

      {/* 2. IMPACT STATISTICS BAR matching reference */}
      <section id="impact" className="py-8 bg-white border-b border-[#E5EBE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Stat 1 */}
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8FAF7] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Laptop className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl lg:text-3xl text-[#151A17]">12,580+</div>
                <div className="text-xs text-[#6B756E] font-medium mt-0.5">Devices Collected</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8FAF7] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Recycle className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl lg:text-3xl text-[#151A17]">7,920+</div>
                <div className="text-xs text-[#6B756E] font-medium mt-0.5">Devices Refurbished</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8FAF7] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Scale className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl lg:text-3xl text-[#151A17]">1,340 Tons</div>
                <div className="text-xs text-[#6B756E] font-medium mt-0.5">E-Waste Diverted</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8FAF7] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36] shrink-0">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl lg:text-3xl text-[#151A17]">₹2.8 Cr+</div>
                <div className="text-xs text-[#6B756E] font-medium mt-0.5">Paid to Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW RECIRCUIT WORKS SECTION matching reference */}
      <section id="how-it-works" className="py-20 bg-[#F8FAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#151A17] tracking-tight">
              How <span className="text-[#16834D]">ReCircuit</span> Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B756E]">
              From your doorstep to certified refurbishment and fair payout in 4 transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#E5EBE5] shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36] mb-5 group-hover:scale-110 transition-transform">
                <Laptop className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#151A17] mb-2">1. Register</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                List your old or unused electronics with issue details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#E5EBE5] shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36] mb-5 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#151A17] mb-2">2. Collect</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                Our verified agent picks it up from your location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#E5EBE5] shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36] mb-5 group-hover:scale-110 transition-transform">
                <Wrench className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#151A17] mb-2">3. Refurbish</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                We inspect, repair and restore reusable devices.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#E5EBE5] shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36] mb-5 group-hover:scale-110 transition-transform">
                <Coins className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#151A17] mb-2">4. Reuse & Earn</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                Sold to retailers and you receive your share of the profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRACK EVERY DEVICE WITH A QR SECTION matching reference */}
      <section id="qr-tracking" className="py-12 bg-[#F8FAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Deep Forest Green Banner Card */}
          <div className="bg-[#084D36] rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-2xl relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-40 top-0 w-64 h-64 rounded-full bg-[#22C55E]/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">
                  Track Every Device <br className="hidden sm:inline" />
                  with a QR
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                  Scan the product QR to view its complete lifecycle — from collection to refurbishment and final sale.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onViewPassport('RC-2026-00142')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#084D36] hover:bg-emerald-50 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <span>See Sample</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center: Smartphone Scanning Mockup */}
              <div className="lg:col-span-3 flex justify-center">
                <div className="relative w-48 sm:w-56 aspect-[9/18] bg-[#151A17] rounded-[36px] p-3 shadow-2xl border-4 border-gray-800">
                  {/* Phone Notch */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />
                  
                  {/* Phone Screen */}
                  <div className="w-full h-full bg-[#0d2a1f] rounded-[28px] overflow-hidden flex flex-col items-center justify-center p-4 relative">
                    {/* Viewfinder Target */}
                    <div className="relative w-28 h-28 border-2 border-dashed border-[#22C55E]/60 rounded-xl flex items-center justify-center p-2">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#22C55E]" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#22C55E]" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#22C55E]" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#22C55E]" />

                      {/* QR inside phone */}
                      <QrCode className="w-16 h-16 text-emerald-300" />
                    </div>

                    <div className="mt-4 text-center">
                      <div className="text-[11px] font-bold text-white tracking-wide">Scan Product QR</div>
                      <div className="text-[9px] text-emerald-300/80 font-mono mt-0.5">RC-2026-00142</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Floating White Product History Card matching reference */}
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-[#151A17] shadow-xl border border-white/20">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5EBE5] mb-4">
                    <span className="font-heading font-bold text-sm text-[#151A17]">Product History</span>
                    <ChevronRight className="w-4 h-4 text-[#6B756E]" />
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Step 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16834D] shrink-0" />
                        <span className="font-medium text-[#151A17]">Registered by User</span>
                      </div>
                      <span className="text-[#6B756E] font-medium">12 Nov 2026</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16834D] shrink-0" />
                        <span className="font-medium text-[#151A17]">Collected by Agent</span>
                      </div>
                      <span className="text-[#6B756E] font-medium">13 Nov 2026</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16834D] shrink-0" />
                        <span className="font-medium text-[#151A17]">Inspected & Tested</span>
                      </div>
                      <span className="text-[#6B756E] font-medium">14 Nov 2026</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16834D] shrink-0" />
                        <span className="font-medium text-[#151A17]">Refurbished</span>
                      </div>
                      <span className="text-[#6B756E] font-medium">18 Nov 2026</span>
                    </div>

                    {/* Step 5 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16834D] shrink-0" />
                        <span className="font-medium text-[#151A17]">Sold to Retailer</span>
                      </div>
                      <span className="text-[#6B756E] font-medium">20 Nov 2026</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. BROWSE REFURBISHED PRODUCTS matching reference */}
      <section id="marketplace" className="py-16 bg-white border-t border-[#E5EBE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#151A17]">
              Browse Refurbished Products
            </h2>
            <button
              onClick={onViewMarketplace}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#084D36] hover:text-[#16834D] transition-colors"
            >
              <span>View Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden hover:border-[#CCD7CE] hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image container with badge */}
                  <div className="relative aspect-[4/3] bg-[#F8FAF7] p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      onError={(e) => handleImageFallback(e, product.category)}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold text-[#084D36] bg-[#EBF8E9] rounded-md border border-[#d2ecd0]">
                      {product.conditionGrade}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1">
                    <h3 className="font-heading font-bold text-sm text-[#151A17] line-clamp-1 group-hover:text-[#084D36] transition-colors">
                      {product.title}
                    </h3>
                  </div>
                </div>

                {/* Price and Cart */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#F0F4F0] mt-3">
                  <div>
                    <div className="font-heading font-extrabold text-base text-[#151A17]">
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-[#6B756E] line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product as any)}
                    className="p-2.5 bg-[#084D36] hover:bg-[#063b29] text-white rounded-xl shadow-xs active:scale-95 transition-all"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ENVIRONMENTAL IMPACT DETAILS & CIRCULARITY COMMITMENT */}
      <section className="py-16 bg-[#F8FAF7] border-t border-[#E5EBE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-[#E5EBE5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#151A17]">Zero-Landfill Guarantee</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                Non-reusable components are routed to government-authorized e-waste recyclers for chemical neutralization and high-purity rare-earth metals extraction.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5EBE5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#151A17]">NIST 800-88 Data Wipe</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                Every storage drive undergoes multi-pass forensic data sanitization before resale, with a cryptographically signed Data Destruction Certificate.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5EBE5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#151A17]">Transparent Profit Sharing</h3>
              <p className="text-xs text-[#6B756E] leading-relaxed">
                Users receive up to 75% of the net margin upon device resale. Track exact refurbishment expenses and logistics fees on the public ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 bg-white border-t border-[#E5EBE5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-extrabold text-3xl text-[#151A17]">Frequently Asked Questions</h2>
            <p className="text-sm text-[#6B756E] mt-2">Everything you need to know about recycling with ReCircuit.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-[#E5EBE5] bg-[#F8FAF7]">
              <h4 className="font-heading font-bold text-sm text-[#151A17]">How does ReCircuit calculate my device valuation?</h4>
              <p className="text-xs text-[#6B756E] mt-2 leading-relaxed">
                Valuation is determined by our 32-point physical inspection, component health diagnostic, and real-time secondary market demand. We transparently subtract only repair and pickup costs, passing the rest directly to you.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5EBE5] bg-[#F8FAF7]">
              <h4 className="font-heading font-bold text-sm text-[#151A17]">What happens if my device cannot be repaired?</h4>
              <p className="text-xs text-[#6B756E] mt-2 leading-relaxed">
                If our technician determines the device is beyond economical repair, you can either request it back or authorize certified recycling where materials like copper, aluminum, and gold are reclaimed responsibly.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5EBE5] bg-[#F8FAF7]">
              <h4 className="font-heading font-bold text-sm text-[#151A17]">How does the QR Product Passport work?</h4>
              <p className="text-xs text-[#6B756E] mt-2 leading-relaxed">
                Each product receives an tamper-evident QR code linked to an immutable lifecycle ledger. Anyone can scan it to review its origin city, diagnostic results, replaced parts, and carbon offset, while your personal information remains strictly protected.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

