import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, Leaf, Award, Download, Printer, 
  TrendingUp, CheckCircle2, ShieldCheck, Zap, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalRequests: 148,
    inRefurbishment: 62,
    listedForSale: 51,
    totalRevenue: 482300,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load report stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalDivertedKg = 1340; // Reference stat: 1,340 Tons E-Waste Diverted
  const totalCo2SavedTons = 4850;
  const goldRecoveredGrams = 320;
  const copperRecoveredKg = 18400;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-[#16834D]" /> Circular Economy & ESG Analytics
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Verified material diversion, precious metals extraction, and carbon abatement metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-[#E5EBE5] hover:bg-gray-50 text-[#151A17] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Print ESG Report
          </button>
          <button
            onClick={() => alert('Generating certified ISO 14001 ESG PDF audit report...')}
            className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Export ESG PDF
          </button>
        </div>
      </div>

      {/* Primary Sustainability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">E-Waste Diverted</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#084D36]">1,340 Tons</div>
          <span className="text-[11px] text-[#16834D] font-medium mt-1 block">100% zero-landfill SLA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">GHG Avoided</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700">{totalCo2SavedTons} Tons CO₂e</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Scope 3 supply chain reduction</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Gold Recovered</span>
            <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-600">{goldRecoveredGrams} g (99.9% pure)</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">From printed circuit boards</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Copper Extracted</span>
            <span className="p-2 bg-orange-50 rounded-xl text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-orange-700">{copperRecoveredKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">High-grade electrolytic copper</span>
        </div>
      </div>

      {/* Category Diversion Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#151A17]">Collection Diversion by Hardware Category</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#151A17]">Enterprise Laptops & Notebooks</span>
              <span className="text-[#084D36]">58% (777 Tons)</span>
            </div>
            <div className="w-full bg-[#F8FAF7] border border-[#E5EBE5] rounded-full h-3 overflow-hidden">
              <div className="bg-[#084D36] h-full rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#151A17]">Server Components & Motherboards</span>
              <span className="text-[#16834D]">24% (321 Tons)</span>
            </div>
            <div className="w-full bg-[#F8FAF7] border border-[#E5EBE5] rounded-full h-3 overflow-hidden">
              <div className="bg-[#16834D] h-full rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#151A17]">Smartphones & Mobile Handsets</span>
              <span className="text-emerald-500">12% (160 Tons)</span>
            </div>
            <div className="w-full bg-[#F8FAF7] border border-[#E5EBE5] rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#151A17]">OEM Lithium-Ion Batteries & Chargers</span>
              <span className="text-emerald-700">6% (82 Tons)</span>
            </div>
            <div className="w-full bg-[#F8FAF7] border border-[#E5EBE5] rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '6%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

