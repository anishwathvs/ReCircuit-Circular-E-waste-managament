import React from 'react';
import { Recycle, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5EBE5] pt-16 pb-24 text-sm text-[#6B756E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
                <Recycle className="w-5 h-5 text-[#084D36] stroke-[2.2]" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-[#084D36]">
                Re<span className="text-[#16834D]">Circuit</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#6B756E]">
              India's premier circular e-waste platform. Empowering sustainable electronics lifecycle management with transparent valuation, QR passports, and fair profit-sharing.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#084D36] bg-[#EBF8E9] px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-[#16834D]" />
              <span>CPCB Authorized E-Waste Partner</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#151A17] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-[#084D36] transition-colors">How It Works</a></li>
              <li><a href="#marketplace" className="hover:text-[#084D36] transition-colors">B2B Refurbished Hub</a></li>
              <li><a href="#qr-tracking" className="hover:text-[#084D36] transition-colors">QR Lifecycle Passports</a></li>
              <li><a href="#impact" className="hover:text-[#084D36] transition-colors">Environmental Impact Audit</a></li>
              <li><a href="#" className="hover:text-[#084D36] transition-colors">Valuation Calculator</a></li>
            </ul>
          </div>

          {/* Col 3: Compliance & Sustainability */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#151A17] uppercase tracking-wider">Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#084D36] transition-colors">E-Waste Management Rules 2022</a></li>
              <li><a href="#" className="hover:text-[#084D36] transition-colors">EPR Credits Verification</a></li>
              <li><a href="#" className="hover:text-[#084D36] transition-colors">Zero-Landfill Guarantee</a></li>
              <li><a href="#" className="hover:text-[#084D36] transition-colors">Hazardous Toxins Neutralization</a></li>
              <li><a href="#" className="hover:text-[#084D36] transition-colors">Data Sanitization (NIST 800-88)</a></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#151A17] uppercase tracking-wider">Contact & Headquarters</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#084D36] shrink-0 mt-0.5" />
                <span>ReCircuit Hub, Guindy Industrial Estate, Chennai, TN 600032</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#084D36] shrink-0" />
                <span>+91 44 2820 4400 / 1800-RECIRCUIT</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#084D36] shrink-0" />
                <span>support@recircuit.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E5EBE5] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B756E] gap-4">
          <p>© {new Date().getFullYear()} ReCircuit Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#084D36]">Privacy Policy</a>
            <a href="#" className="hover:text-[#084D36]">Terms of Service</a>
            <a href="#" className="hover:text-[#084D36]">Security & Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

