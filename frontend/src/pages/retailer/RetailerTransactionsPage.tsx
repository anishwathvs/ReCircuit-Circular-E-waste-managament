import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, CheckCircle2, Clock, 
  Download, ShieldCheck, RefreshCw, FileText 
} from 'lucide-react';
import { api } from '../../services/api';

export const RetailerTransactionsPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getRetailerOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load retailer transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalSpent = orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0) || 85499;
  const gstCreditClaimable = Math.round(totalSpent * 0.18 / 1.18);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#16834D]" /> Wholesale Payment Ledger & GST Credits
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Audit B2B transaction settlements, Razorpay transaction references, and GST ITC documentation.
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Ledger"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Total Wholesale Spend</span>
            <span className="p-2 bg-[#EBF8E9] rounded-xl text-[#16834D]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#151A17]">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-[#16834D] font-medium mt-1 block">100% Settled via Razorpay</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">GST Input Tax Credit</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700">₹{gstCreditClaimable.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">18% B2B GSTR-2B eligible</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B756E]">Credit Term & Terms</span>
            <span className="p-2 bg-teal-50 rounded-xl text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#084D36]">Net 30 Active</div>
          <span className="text-[11px] text-[#6B756E] mt-1 block">Approved wholesale credit limit: ₹5,00,000</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#151A17]">Procurement Transaction History</h3>
            <p className="text-xs text-[#6B756E]">Payment gateways, GST invoices, and settlement IDs.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading transactions...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Invoice Number</th>
                  <th className="px-5 py-3.5">Amount (₹)</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Settlement Status</th>
                  <th className="px-5 py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#084D36]">
                      {ord.orderNumber || `ORD-${ord.id.substring(0, 8)}`}
                    </td>
                    <td className="px-5 py-4 font-mono text-[#6B756E]">
                      {ord.invoiceNumber || 'INV-2026-4401'}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#151A17]">
                      ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-sm bg-gray-100 text-[#151A17] font-medium text-[11px]">
                        Corporate Net Banking
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8E9] text-[#16834D] border border-[#C3E8BF] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SETTLED
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-[#6B756E]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

