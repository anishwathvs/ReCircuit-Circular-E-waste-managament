import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Cpu, Sparkles } from 'lucide-react';

interface HeroGraphicProps {
  onQrClick?: () => void;
}

export const HeroGraphic: React.FC<HeroGraphicProps> = ({ onQrClick }) => {
  return (
    <div className="relative w-full max-w-[620px] aspect-[1.12/1] mx-auto select-none">
      {/* Background Soft Glow & Circular Wave */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#EBF8E9] via-transparent to-[#d3f4cf]/40 rounded-full blur-3xl -z-10 scale-90" />

      {/* Sweeping Green Circular Recycling Loop Graphics */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="circGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#62B735" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#16834D" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#084D36" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="circGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16834D" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Circular Recycling Flow Arrow 1 */}
        <path
          d="M 120,280 C 100,160 210,70 340,75 C 440,80 520,160 515,260"
          stroke="url(#circGrad1)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="16 8"
          className="opacity-70 animate-pulse"
        />

        {/* Inner Curved Arrow 2 */}
        <path
          d="M 490,290 C 470,390 360,450 250,430 C 160,410 110,340 125,270"
          stroke="url(#circGrad2)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Recycling Arrowheads */}
        <polygon points="505,250 535,275 495,285" fill="#16834D" />
        <polygon points="120,285 100,250 140,255" fill="#62B735" />
      </svg>

      {/* Floating Fresh Leaves */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 right-4 z-20 pointer-events-none drop-shadow-md"
      >
        <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
          <path
            d="M20,80 C30,40 60,20 85,15 C80,45 60,75 20,80 Z"
            fill="#62B735"
          />
          <path
            d="M20,80 C40,55 60,35 85,15"
            stroke="#084D36"
            strokeWidth="3"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-16 left-6 z-20 pointer-events-none drop-shadow-sm"
      >
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
          <path
            d="M15,85 C25,50 55,30 80,25 C75,55 55,80 15,85 Z"
            fill="#16834D"
            opacity="0.9"
          />
          <path
            d="M15,85 C35,60 55,45 80,25"
            stroke="#053726"
            strokeWidth="2.5"
          />
        </svg>
      </motion.div>

      {/* Main Hardware Composite */}
      <div className="relative w-full h-full flex items-center justify-center pt-8">
        
        {/* Modern Laptop with Lush Nature Wallpaper */}
        <div
          className="relative z-10 w-[78%] max-w-[460px] drop-shadow-2xl"
        >
          {/* Laptop Screen Bezel */}
          <div className="bg-[#1a1e1b] p-2.5 rounded-t-2xl shadow-inner border border-gray-700/50">
            {/* Screen Display */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#0e2a1e] group">
              <img
                src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop&q=80"
                alt="Green forest renewal"
                className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              {/* Screen overlay with circular ReCircuit badge watermark */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span className="text-[11px] font-medium text-white tracking-wide">ReCircuit OS • Certified Eco-Life</span>
                </div>
              </div>
            </div>
          </div>
          {/* Laptop Lower Chassis / Keyboard Deck */}
          <div className="relative bg-gradient-to-b from-[#2b302c] to-[#1a1c1a] h-7 rounded-b-xl border-t border-gray-600/40 shadow-xl flex items-center justify-center">
            <div className="w-24 h-1 bg-gray-500/40 rounded-full" />
            <div className="absolute bottom-0 w-[105%] -left-[2.5%] h-2.5 bg-[#0f1110] rounded-b-2xl shadow-2xl" />
          </div>
        </div>

        {/* Detailed Motherboard / PCB Circuit Board Component (Left-Foreground) */}
        <div
          className="absolute left-2 bottom-6 z-15 w-44 sm:w-52 aspect-[1.2/1] rounded-xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-[#0d2a1f] transform -rotate-6 hover:rotate-0 transition-transform duration-300"
        >
          {/* Circuit pattern & microchip */}
          <div className="relative w-full h-full p-3 bg-gradient-to-br from-[#0c3121] via-[#082217] to-[#04160f]">
            {/* Gold pin lines */}
            <div className="absolute top-0 left-4 right-4 h-2 flex justify-between">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1 h-2 bg-amber-400/80 rounded-b-xs" />
              ))}
            </div>

            {/* Central CPU socket */}
            <div className="mt-4 mx-auto w-16 h-16 rounded-md bg-[#1a2e24] border border-amber-400/60 p-1.5 flex flex-col items-center justify-center shadow-inner">
              <Cpu className="w-7 h-7 text-amber-300" />
              <span className="text-[7px] font-mono text-emerald-300 font-bold mt-1">ARM / SILICON</span>
            </div>

            {/* Integrated Circuit traces */}
            <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-emerald-400/80 px-1">
              <span>PCB-REV-04</span>
              <span className="text-amber-400 font-semibold">ECO-CERT</span>
            </div>

            {/* Capacitors & chips */}
            <div className="mt-1 flex gap-1.5">
              <div className="w-4 h-3 bg-gray-800 border border-gray-600 rounded-xs" />
              <div className="w-4 h-3 bg-gray-800 border border-gray-600 rounded-xs" />
              <div className="w-8 h-3 bg-[#114b32] border border-emerald-400/40 rounded-xs flex items-center justify-center text-[6px] text-white">REUSE</div>
            </div>
          </div>
        </div>

        {/* RAM Stick / Component Module (Bottom-Center) */}
        <div
          className="absolute bottom-0 left-[28%] z-20 w-44 h-8 bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-sm border border-gray-700 shadow-xl flex items-center px-3 justify-between transform rotate-3"
        >
          <div className="flex gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-5 h-4 bg-gray-950 border border-gray-700 rounded-xs" />
            ))}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-mono text-emerald-400 font-bold">DDR4 16GB</span>
            <div className="w-12 h-1 bg-amber-400 rounded-xs mt-0.5" />
          </div>
        </div>

        {/* Floating White Card: "Scan & Trace Product History" matching screenshot! */}
        <div
          onClick={onQrClick}
          className="absolute right-0 bottom-8 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-card hover:shadow-card-hover border border-[#E5EBE5] cursor-pointer transform hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group w-36 sm:w-40"
        >
          {/* QR Box with Scan Icon */}
          <div className="relative w-20 h-20 bg-[#F8FAF7] rounded-xl p-2 border border-[#E5EBE5] flex items-center justify-center group-hover:border-[#084D36] transition-colors">
            <div className="w-full h-full flex flex-col items-center justify-center text-[#084D36]">
              {/* Simulated high-quality QR graphic matching screenshot */}
              <svg className="w-full h-full text-[#084D36]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm0 4h2v4h-2v-4zm4 0h2v2h-2v-2zm-6-4h2v2h-2v-2zm4-6h2v2h-2V8zm-2 2h2v2h-2v-2zm0 2h2v2h-2v-2zm4-4h2v2h-2V6zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z"/>
              </svg>
            </div>
            {/* Viewfinder corner accents */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#16834D]" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#16834D]" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#16834D]" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#16834D]" />
          </div>

          <div className="text-center">
            <p className="text-[12px] font-bold text-[#151A17] group-hover:text-[#084D36] transition-colors leading-tight">
              Scan & Trace
            </p>
            <p className="text-[10px] text-[#6B756E] mt-0.5 font-medium">
              Product History
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

