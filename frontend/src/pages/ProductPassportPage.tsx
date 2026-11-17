import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Cpu,
  Leaf,
  Scale,
  Sparkles,
  Download,
  Share2,
  ArrowLeft,
  QrCode,
  MapPin,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { getProductImage } from '../utils/productImages';

interface ProductPassportPageProps {
  customId?: string;
  onBack?: () => void;
}

export const ProductPassportPage: React.FC<ProductPassportPageProps> = ({ customId: propCustomId, onBack: propOnBack }) => {
  const { customId: routeCustomId } = useParams<{ customId?: string }>();
  const navigate = useNavigate();
  const effectiveCustomId = routeCustomId || propCustomId || 'RC-2026-00142';
  const handleBack = propOnBack || (() => navigate('/'));

  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        setLoading(true);
        const res = await api.getProductPassport(effectiveCustomId);
        setPassport(res.passport);
      } catch (err: any) {
        setError(err.message || 'Passport not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [effectiveCustomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-6 text-sm text-[#084D36]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#084D36] border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">Loading Cryptographic Product Passport...</span>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#E5EBE5] max-w-md text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[#151A17]">Passport Record Not Found</h2>
          <p className="text-xs text-[#6B756E]">
            No circular lifecycle history found for identifier: <strong className="font-mono">{effectiveCustomId}</strong>.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#084D36] text-white text-xs font-bold rounded-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-bold text-[#084D36] hover:text-[#16834D] bg-white px-3 py-1.5 rounded-lg border border-[#E5EBE5] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#EBF8E9] text-[#084D36] rounded-full text-xs font-bold border border-[#c4e4c0] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16834D]" />
              <span>CPCB Verified Digital Passport</span>
            </span>
          </div>
        </div>

        {/* Hero Passport Card */}
        <div className="bg-white rounded-3xl border border-[#E5EBE5] p-6 sm:p-8 shadow-card relative overflow-hidden">
          {/* Subtle eco watermarks */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8E9] to-transparent rounded-bl-full pointer-events-none -z-0 opacity-60" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5EBE5]">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F8FAF7] border border-[#E5EBE5] p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                <img
                  src={getProductImage({
                    category: passport.category,
                    brand: passport.brand,
                    model: passport.model,
                  })}
                  alt={`${passport.brand} ${passport.model}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#084D36] text-white rounded-md">
                    {passport.customId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#EBF8E9] text-[#084D36] rounded-md">
                    {passport.currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#151A17]">
                  {passport.brand} {passport.model}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B756E]">
                  <span>Category: <strong className="text-[#151A17]">{passport.category}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#084D36]" />
                    <span>Origin: {passport.region}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-800 font-medium">
                    <Lock className="w-3 h-3 text-[#16834D]" />
                    <span>Seller Privacy Protected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col items-center p-3 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5] shrink-0">
              <div
                className="w-28 h-28 bg-white p-1 rounded-xl shadow-xs border border-[#CCD7CE] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: passport.qrSvg || '' }}
              />
              <span className="text-[10px] font-mono text-[#084D36] font-bold mt-1.5">Official Product Passport</span>
            </div>
          </div>

          {/* Environmental Savings Metrics */}
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-[#E5EBE5] text-center">
            <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5]">
              <Leaf className="w-5 h-5 text-[#16834D] mx-auto mb-1" />
              <div className="font-heading font-extrabold text-xl text-[#084D36]">{passport.carbonOffsetKg} kg</div>
              <div className="text-[10px] text-[#6B756E] font-medium">CO₂ Emissions Avoided</div>
            </div>

            <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5]">
              <Scale className="w-5 h-5 text-[#16834D] mx-auto mb-1" />
              <div className="font-heading font-extrabold text-xl text-[#084D36]">{passport.eWasteDivertedKg} kg</div>
              <div className="text-[10px] text-[#6B756E] font-medium">E-Waste Diverted From Landfill</div>
            </div>

            <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5]">
              <Sparkles className="w-5 h-5 text-[#16834D] mx-auto mb-1" />
              <div className="font-heading font-extrabold text-xl text-[#084D36]">{passport.preciousMetalsRecoveredMg} mg</div>
              <div className="text-[10px] text-[#6B756E] font-medium">Precious Metals Reclaimed</div>
            </div>
          </div>

          {/* Chronological Append-Only History Timeline */}
          <div className="pt-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center justify-between">
              <span>Complete Lifecycle Audit Trail</span>
              <span className="text-xs font-mono text-[#16834D] font-normal">Immutable Blockchain-Grade Record</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EBE5]">
              {passport.timeline && passport.timeline.map((event: any, idx: number) => (
                <div key={idx} className="relative group">
                  {/* Timeline circle badge */}
                  <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-white border-2 border-[#16834D] flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-[#16834D]" />
                  </div>

                  <div className="p-4 bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] group-hover:border-[#CCD7CE] transition-colors space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-heading font-bold text-sm text-[#151A17]">{event.title}</span>
                      <span className="text-[#6B756E] font-mono text-[11px]">
                        {new Date(event.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B756E] leading-relaxed">
                      {event.description}
                    </p>

                    <div className="text-[10px] font-medium text-[#084D36] pt-1">
                      Verified by: {event.actorRole}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Diagnostics & Replaced Components */}
          {passport.refurbishment && (
            <div className="mt-8 pt-6 border-t border-[#E5EBE5] space-y-3">
              <h3 className="font-heading font-bold text-base text-[#151A17]">Refurbishment & Testing Certificate</h3>
              <div className="p-4 bg-[#EBF8E9] rounded-2xl border border-[#c4e4c0] text-xs text-[#084D36] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Certificate No: {passport.refurbishment.certificateNumber || 'CERT-RC-98124'}</span>
                  <span className="font-semibold">{passport.refurbishment.warrantyMonths} Months Warranty Certified</span>
                </div>
                <p className="text-[#151A17]">
                  <strong>Hardware Service Details:</strong> {passport.refurbishment.repairDescription}
                </p>
                <div>
                  <strong>Components Replaced: </strong>
                  {passport.refurbishment.componentsReplaced?.join(', ') || 'Internal components inspected and tested'}
                </div>
                <div className="font-mono text-[11px] text-[#0e6b3f]">
                  Diagnostics Status: {passport.refurbishment.testingStatus}
                </div>
              </div>
            </div>
          )}

          {/* Authorized Recycling Certificate if Recycled */}
          {passport.recycling && (
            <div className="mt-8 pt-6 border-t border-[#E5EBE5] space-y-3">
              <h3 className="font-heading font-bold text-base text-[#151A17] flex items-center justify-between">
                <span>Authorized Circular Recycling Certificate</span>
                <span className="text-xs bg-[#EBF8E9] text-[#084D36] font-bold px-2.5 py-0.5 rounded-full border border-[#084D36]/20">
                  CPCB Certified Zero-Landfill
                </span>
              </h3>
              <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#084D36]/30 text-xs text-[#151A17] space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Partner: {passport.recycling.partnerName}</span>
                  <span className="font-mono text-[#084D36]">{passport.recycling.cpcbLicenseNumber}</span>
                </div>
                <p className="text-[#6B756E]">
                  <strong>Manifest / Certificate No:</strong> {passport.recycling.certificateNumber}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span>Weight Processed: <strong>{passport.recycling.weightKg} kg</strong></span>
                  <span>•</span>
                  <span>Precious Metals Yield: <strong>{passport.recycling.preciousMetalsRecoveredMg} mg</strong></span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E5EBE5] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B756E] gap-4">
            <span>ReCircuit Circular Registry Engine v2.4 • Zero-Landfill Verified</span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EBE5] text-[#151A17] font-semibold hover:bg-gray-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

