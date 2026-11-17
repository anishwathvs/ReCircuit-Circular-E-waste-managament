import React, { useState, useEffect } from 'react';
import { 
  Package, Download, CheckCircle2, Clock, 
  ExternalLink, Truck, FileText, RefreshCw, Printer 
} from 'lucide-react';
import { api } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export const RetailerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getRetailerOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load retailer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#16834D]" /> B2B Wholesale Procurement Orders
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Download certified GST tax invoices, track dispatch shipments, and review warranties.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#151A17]">Purchase Invoices & Consignments</h3>
            <p className="text-xs text-[#6B756E]">Instant invoicing, 18% GST input credit, and warranty certificates.</p>
          </div>
          <span className="text-xs font-semibold text-[#084D36] bg-[#EBF8E9] px-3 py-1 rounded-full">
            {orders.length} Verified Orders
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading orders list...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <h4 className="font-heading font-bold text-sm text-[#151A17] mb-1">No orders yet</h4>
            <p className="text-xs text-[#6B756E]">
              Browse the refurbished catalog and add devices to your wholesale cart.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5EBE5]">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#F8FAF7]/50 transition-colors">
                <div className="flex items-start gap-4">
                  {ord.items && ord.items.length > 0 && ord.items[0].product && (
                    <div className="w-14 h-14 rounded-xl bg-[#F8FAF7] border border-[#E5EBE5] overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={getProductImage(ord.items[0].product)}
                        alt={ord.items[0].product?.brand || 'Order item'}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#084D36] bg-[#EBF8E9] px-2.5 py-0.5 rounded-sm">
                        {ord.orderNumber || `ORD-${ord.id.substring(0, 8).toUpperCase()}`}
                      </span>
                      <span className="text-xs font-semibold text-[#151A17]">
                        {ord.items?.length || 1} Device(s)
                      </span>
                    </div>
                    {ord.items && ord.items.length > 0 && (
                      <div className="text-xs font-medium text-[#151A17]">
                        {ord.items.map((i: any) => `${i.product?.brand} ${i.product?.model}`).join(', ')}
                      </div>
                    )}
                    <div className="text-xs text-[#6B756E]">
                      Delivery: <strong className="text-[#151A17]">{ord.shippingAddress || 'Guindy Industrial Hub, Chennai'}</strong>
                    </div>
                    <div className="text-[11px] text-[#6B756E]">
                      Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E5EBE5]">
                  <div className="text-left md:text-right">
                    <div className="font-heading font-extrabold text-base text-[#151A17]">
                      ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF8E9] text-[#16834D] font-bold border border-[#C3E8BF]">
                      {ord.status || 'CONFIRMED'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoiceOrder(ord)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#084D36] hover:bg-[#063b2a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Tax Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TAX INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E5EBE5] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#084D36]" />
                <h3 className="font-heading font-bold text-base text-[#151A17]">
                  Tax Invoice — {selectedInvoiceOrder.orderNumber}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-[#6B756E] hover:text-[#151A17] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#E5EBE5] text-xs space-y-3">
              <div className="flex justify-between items-start border-b border-[#E5EBE5] pb-3">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#084D36]">ReCircuit Electronics Ltd.</h4>
                  <div className="text-[11px] text-[#6B756E]">GSTIN: 33AABCR1234F1Z8</div>
                  <div className="text-[11px] text-[#6B756E]">E-Waste Refurbishment Center, Guindy, Chennai</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#151A17]">Invoice: {selectedInvoiceOrder.invoiceNumber || 'INV-2026-4401'}</div>
                  <div className="text-[11px] text-[#6B756E]">Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#6B756E] font-semibold">BILLED TO (RETAILER):</div>
                <div className="font-bold text-[#151A17]">NextGen Tech Hub Private Limited</div>
                <div className="text-[11px] text-[#6B756E]">GSTIN: 33AAAAA0000A1Z5</div>
                <div className="text-[11px] text-[#6B756E]">{selectedInvoiceOrder.shippingAddress}</div>
              </div>

              <div className="border-t border-[#E5EBE5] pt-2">
                <div className="flex justify-between font-bold text-[#151A17] py-1">
                  <span>Total Wholesale Value</span>
                  <span>₹{Number(selectedInvoiceOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#6B756E] text-[11px]">
                  <span>Includes 18% CGST & SGST Input Tax Credit</span>
                  <span>Eligible</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-3 py-1.5 border border-[#E5EBE5] rounded-xl text-xs font-semibold text-[#6B756E]"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#084D36] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

