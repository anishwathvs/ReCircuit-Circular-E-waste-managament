import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export const UserRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [category, setCategory] = useState('Laptop');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [ageYears, setAgeYears] = useState('2.5');
  const [condition, setCondition] = useState('Functional with issue');
  const [problemDesc, setProblemDesc] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '42, 4th Seaward Road, Valmiki Nagar, Thiruvanmiyur');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [pincode, setPincode] = useState('600041');
  const [preferredDate, setPreferredDate] = useState('2026-11-20');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('4:00 PM - 6:00 PM');
  
  // Image upload
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Status
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    try {
      setUploadingImage(true);
      const res = await api.uploadProductImage(file);
      setUploadedImages(prev => [...prev, res.url]);
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !problemDesc || !pickupAddress) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitProduct({
        category,
        brand,
        model,
        ageYears,
        condition,
        problemDesc,
        pickupAddress,
        city,
        pincode,
        preferredDate,
        preferredTimeSlot,
        images: uploadedImages.length > 0 ? uploadedImages : [
          getProductImage({ category, brand, model })
        ]
      });

      setSuccessResult({
        product: res.product,
        pickup: res.pickup,
      });
    } catch (err: any) {
      alert(err.message || 'Error submitting e-waste request');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5EBE5] p-8 shadow-card text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#EBF8E9] text-[#16834D] flex items-center justify-center mx-auto border-2 border-[#16834D]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#084D36] bg-[#EBF8E9] px-3 py-1 rounded-full border border-[#084D36]/20">
            {successResult.product.customId}
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-[#151A17] mt-3">
            E-Waste Request Registered Successfully!
          </h2>
          <p className="text-xs text-[#6B756E] mt-1 max-w-md mx-auto">
            Your {successResult.product.brand} {successResult.product.model} is queued for doorstep collection.
            Request ID: <strong>{successResult.pickup.requestId}</strong>.
          </p>
        </div>

        <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5] text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-[#6B756E]">Pickup Address:</span>
            <span className="font-semibold text-[#151A17]">{successResult.pickup.pickupAddress}, {successResult.pickup.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B756E]">Scheduled Window:</span>
            <span className="font-semibold text-[#151A17]">{successResult.pickup.preferredTimeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B756E]">Initial Valuation Estimate:</span>
            <span className="font-bold text-[#084D36]">₹{successResult.product.estimatedValue?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard/user/requests')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2"
          >
            <span>View in My Requests</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSuccessResult(null);
              setModel('');
              setProblemDesc('');
              setUploadedImages([]);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#E5EBE5] text-[#151A17] font-semibold rounded-xl text-xs hover:bg-gray-50"
          >
            Register Another Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-[#151A17]">Register E-Waste Device</h1>
        <p className="text-xs text-[#6B756E] mt-0.5">
          Provide device specifications, condition, and arrange verified doorstep collection with fair profit sharing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E5EBE5] p-6 sm:p-8 shadow-card space-y-6 text-xs text-[#151A17]">
        {/* Device Info */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#084D36] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <Laptop className="w-4 h-4" />
            <span>Hardware Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Product Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              >
                <option value="Laptop">Laptop</option>
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Motherboard">Motherboard / PCB</option>
                <option value="Battery">Lithium Battery</option>
                <option value="GPU">Graphics Card (GPU)</option>
                <option value="RAM">RAM / Memory</option>
                <option value="CPU">CPU / Processor</option>
                <option value="Monitor">Monitor / Display</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Brand *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Dell, HP, Apple, Lenovo, Asus"
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Model Name / Number *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Latitude 5420 or Inspiron 5570"
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Approximate Age (Years)</label>
              <input
                type="number"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Physical Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            >
              <option value="Functional with issue">Functional with minor issues (Recommended for refurbish)</option>
              <option value="Working normally">Working normally (Like New)</option>
              <option value="Minor Damage">Minor physical/hinge damage</option>
              <option value="No Power / Dead">Will not power on / Dead</option>
              <option value="For Parts Only">For parts only / Heavy damage</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Problem Description *</label>
            <textarea
              required
              rows={2}
              value={problemDesc}
              onChange={(e) => setProblemDesc(e.target.value)}
              placeholder="e.g. Hinge broken, battery drains fast, keyboard keys sticking"
              className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            />
          </div>

          {/* Photograph Upload */}
          <div>
            <label className="block font-semibold mb-1">Product Photograph (Optional, Max 5MB)</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#084D36] bg-[#EBF8E9]/60 hover:bg-[#EBF8E9] text-[#084D36] font-semibold text-xs transition">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Uploading securely...' : 'Choose Photograph (JPEG/PNG/WebP)'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
              </label>

              {uploadedImages.map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-xl border border-[#E5EBE5] overflow-hidden relative">
                  <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {uploadedImages.length > 0 && (
              <p className="text-[11px] text-[#16834D] mt-1.5 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{uploadedImages.length} image attached to request</span>
              </p>
            )}
          </div>
        </div>

        {/* Pickup Logistics */}
        <div className="space-y-4 pt-4 border-t border-[#E5EBE5]">
          <h3 className="font-heading font-bold text-sm text-[#084D36] flex items-center gap-2 pb-2 border-b border-[#E5EBE5]">
            <MapPin className="w-4 h-4" />
            <span>Doorstep Pickup Logistics</span>
          </h3>

          <div>
            <label className="block font-semibold mb-1">Pickup Address *</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Door No, Street Name, Locality"
              className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Preferred Pickup Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Preferred Time Window</label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5EBE5] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
              >
                <option value="10:00 AM - 1:00 PM">Morning (10:00 AM - 1:00 PM)</option>
                <option value="2:00 PM - 4:00 PM">Afternoon (2:00 PM - 4:00 PM)</option>
                <option value="4:00 PM - 6:00 PM">Evening (4:00 PM - 6:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Commitment Badge */}
        <div className="p-3.5 bg-[#EBF8E9] rounded-2xl border border-[#084D36]/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#16834D] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#24422e] leading-relaxed">
            <strong>ReCircuit Fair-Share Guarantee:</strong> Once inspected, we share our transparent valuation breakdown.
            You choose whether to accept the fair payout or receive your device back.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/user')}
            className="px-5 py-2.5 border border-[#E5EBE5] text-[#6B756E] font-semibold rounded-xl text-xs hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#084D36] hover:bg-[#063b29] text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50"
          >
            {loading ? 'Submitting Registration...' : 'Confirm E-Waste Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

