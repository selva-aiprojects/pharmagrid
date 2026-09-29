'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiVendorPo,
  ApiCustomerOrder,
  ApiOrdersSummary,
  ApiProduct,
  ApiSupplier,
  ApiCustomer
} from '@/services/apiClient';
import SmartPharmaTextArea from '@/components/SmartPharmaTextArea';
import {
  ShoppingCart,
  FileCheck,
  Send,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Eye,
  FileText,
  Building,
  User,
  Package,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';

export default function OrdersManagementView() {
  const [activeTab, setActiveTab] = useState<'vendor' | 'customer'>('vendor');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiOrdersSummary | null>(null);
  const [vendorPos, setVendorPos] = useState<ApiVendorPo[]>([]);
  const [customerOrders, setCustomerOrders] = useState<ApiCustomerOrder[]>([]);
  
  // Selected order for item inspection
  const [inspectPo, setInspectPo] = useState<ApiVendorPo | null>(null);
  const [inspectOrder, setInspectOrder] = useState<ApiCustomerOrder | null>(null);

  // New Vendor PO Modal
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poLines, setPoLines] = useState<Array<{
    productId: string;
    productName: string;
    productCode: string;
    qty: number;
    price: number;
    gstRate: number;
  }>>([]);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, poRes, ordRes, supRes, prodRes] = await Promise.all([
        pharmaApi.getOrdersSummary(),
        pharmaApi.getVendorPos(),
        pharmaApi.getCustomerOrders(),
        pharmaApi.getSuppliers(),
        pharmaApi.getProducts()
      ]);
      setSummary(sumRes);
      setVendorPos(poRes);
      setCustomerOrders(ordRes);
      setSuppliers(supRes);
      setProducts(prodRes);

      if (supRes.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supRes[0].supplierId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConvertToGrn = async (po: ApiVendorPo) => {
    try {
      const res = await pharmaApi.convertPoToGrn(po.id);
      showToast(`✅ ${res.message || 'PO converted to Inward GRN draft!'}`);
      loadData();
    } catch (e: any) {
      showToast(`❌ ${e.message || 'Failed to convert PO'}`);
    }
  };

  const handleConvertToInvoice = async (ord: ApiCustomerOrder) => {
    try {
      const res = await pharmaApi.convertOrderToInvoice(ord.id);
      showToast(`✅ ${res.message || 'Order converted to Sales Invoice!'}`);
      loadData();
    } catch (e: any) {
      showToast(`❌ ${e.message || 'Failed to convert order'}`);
    }
  };

  const addPoLine = (prod: ApiProduct) => {
    const existing = poLines.find(l => l.productId === prod.productId);
    if (existing) {
      setPoLines(poLines.map(l => l.productId === prod.productId ? { ...l, qty: l.qty + 100 } : l));
    } else {
      setPoLines([
        ...poLines,
        {
          productId: prod.productId,
          productName: prod.productName,
          productCode: prod.code,
          qty: 200,
          price: prod.ptr || 90,
          gstRate: prod.gstPercentage || 12
        }
      ]);
    }
  };

  const handleCreateVendorPo = async () => {
    if (poLines.length === 0) {
      alert('Please add at least one product line.');
      return;
    }
    const sup = suppliers.find(s => s.supplierId === selectedSupplierId);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        supplierName: sup ? sup.supplierName : 'Primary Pharma Distributor',
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        paymentTerms: '30 Days Net',
        notes: poNotes || 'Regular stock indent replenishment',
        items: poLines.map(l => ({
          productId: l.productId,
          productName: l.productName,
          productCode: l.productCode,
          quantityOrdered: l.qty,
          unitPrice: l.price,
          gstRate: l.gstRate,
          lineTotal: l.qty * l.price * (1 + l.gstRate / 100)
        }))
      };

      await pharmaApi.createVendorPo(payload);
      showToast('🎉 Vendor Purchase Order committed and dispatched to supplier!');
      setShowNewPoModal(false);
      setPoLines([]);
      setPoNotes('');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to create PO');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              SUPPLY CHAIN ENGINE
            </span>
            <span className="text-slate-500 text-xs">CDSCO Form 20B/21B Compliant</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-400" />
            Orders & Indent Lifecycle
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage manufacturer indents (Vendor POs) and chemist field bookings (Customer Pre-Orders) with 1-click execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium flex items-center gap-2 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            Refresh
          </button>

          {activeTab === 'vendor' ? (
            <button
              onClick={() => setShowNewPoModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              New Vendor PO
            </button>
          ) : (
            <button
              onClick={() => showToast('💡 Chemist bookings arrive directly from field reps or the B2B chemist mobile app.')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Book Chemist Order
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Vendor POs</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalVendorPos}</div>
            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Building className="w-3 h-3" /> Manufacturer Indents
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Vendor PO Value</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{summary.totalPoValue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 mt-1">Committed Procurement</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">In-Transit Indents</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{summary.pendingPoDeliveries}</div>
            <div className="text-xs text-amber-500/80 mt-1 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Awaiting Inward GRN
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Customer Orders</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalCustomerOrders}</div>
            <div className="text-xs text-purple-400 mt-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Chemist Pre-Bookings
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Order Value</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">₹{summary.totalOrderValue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 mt-1">B2B Sales Pipeline</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Priority / Cold-Chain</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{summary.urgentBookings}</div>
            <div className="text-xs text-rose-500/80 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expedited Dispatch
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('vendor')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'vendor'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Vendor Purchase Orders ({vendorPos.length})
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'customer'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Chemist Sales Pre-Orders ({customerOrders.length})
        </button>
      </div>

      {/* Tab 1: Vendor Purchase Orders */}
      {activeTab === 'vendor' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">Active Manufacturer Procurement Indents</div>
            <div className="text-xs text-slate-500">Auto-links to Goods Receipt Notes (GRN) upon arrival</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Manufacturer / Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected By</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">PO Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vendorPos.map(po => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-400">
                      {po.poNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{po.supplierName}</div>
                      <div className="text-xs text-slate-500">{po.paymentTerms}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(po.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setInspectPo(po)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
                      >
                        <Package className="w-3 h-3 text-blue-400" />
                        {po.items.length} SKUs
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      ₹{po.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        po.status === 'Fulfilled'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : po.status === 'PartiallyReceived'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {po.status === 'Fulfilled' && <CheckCircle2 className="w-3 h-3" />}
                        {po.status === 'PartiallyReceived' && <Truck className="w-3 h-3" />}
                        {po.status === 'Submitted' && <Send className="w-3 h-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {po.status !== 'Fulfilled' ? (
                        <button
                          onClick={() => handleConvertToGrn(po)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow transition"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Receive to GRN
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">GRN Ingested</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Sales Orders */}
      {activeTab === 'customer' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">Chemist Booking Pre-Orders</div>
            <div className="text-xs text-slate-500">Field sales bookings ready for warehouse picking & invoicing</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Chemist Pharmacy</th>
                  <th className="py-3 px-4">Sales Rep</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Order Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{ord.customerName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{ord.deliveryAddress}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {ord.salesRepName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ord.priority === 'ColdChain'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : ord.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {ord.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setInspectOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
                      >
                        <Package className="w-3 h-3 text-purple-400" />
                        {ord.items.length} SKUs
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-400">
                      ₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ord.status === 'Invoiced'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ord.status === 'Dispatched'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ord.status !== 'Invoiced' ? (
                        <button
                          onClick={() => handleConvertToInvoice(ord)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Generate Invoice
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Invoiced</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Inspect PO Line Items */}
      {inspectPo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Vendor PO Items: {inspectPo.poNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{inspectPo.supplierName} • {inspectPo.paymentTerms}</p>
              </div>
              <button onClick={() => setInspectPo(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">GST %</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inspectPo.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-100">{it.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{it.productCode}</td>
                      <td className="py-2.5 px-3 font-semibold">{it.quantityOrdered}</td>
                      <td className="py-2.5 px-3">₹{it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3">{it.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">₹{it.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inspectPo.notes && (
                <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">PO Notes: </span>
                  {inspectPo.notes}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="text-sm font-semibold text-slate-300">
                Total PO Value: <span className="text-emerald-400">₹{inspectPo.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={() => setInspectPo(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect Customer Order Line Items */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                  Chemist Pre-Order: {inspectOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{inspectOrder.customerName} • Rep: {inspectOrder.salesRepName}</p>
              </div>
              <button onClick={() => setInspectOrder(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">GST %</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inspectOrder.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-100">{it.productName}</td>
                      <td className="py-2.5 px-3 font-semibold">{it.quantityOrdered}</td>
                      <td className="py-2.5 px-3">₹{it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3">{it.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-purple-400">₹{it.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div><span className="font-semibold text-slate-300">Delivery Address: </span>{inspectOrder.deliveryAddress}</div>
                {inspectOrder.notes && <div><span className="font-semibold text-slate-300">Instructions: </span>{inspectOrder.notes}</div>}
              </div>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="text-sm font-semibold text-slate-300">
                Order Value: <span className="text-purple-400">₹{inspectOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Vendor PO */}
      {showNewPoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  Generate Manufacturer Purchase Order
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Formal statutory indent dispatch to pharmaceutical supplier</p>
              </div>
              <button onClick={() => setShowNewPoModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Select Manufacturer / Supplier
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {suppliers.map(s => (
                      <option key={s.supplierId} value={s.supplierId}>
                        {s.supplierName} ({s.gstinNumber || 'Tax Registered'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    defaultValue="30 Days Net"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200"
                  />
                </div>
              </div>

              {/* Add SKUs to PO */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Add Catalog SKUs
                </label>
                <div className="flex flex-wrap gap-2">
                  {products.slice(0, 6).map(prod => (
                    <button
                      key={prod.productId}
                      onClick={() => addPoLine(prod)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-xs text-slate-300 border border-slate-700 hover:border-blue-500/50 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3 h-3 text-blue-400" />
                      {prod.productName}
                    </button>
                  ))}
                </div>
              </div>

              {/* PO Line Items Table */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Indent Line Items ({poLines.length})
                </div>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Est. Rate</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {poLines.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500">
                            No items added yet. Click items above to add to this indent.
                          </td>
                        </tr>
                      ) : (
                        poLines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-medium text-slate-200">{line.productName}</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={line.qty}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setPoLines(poLines.map((l, i) => i === idx ? { ...l, qty: val } : l));
                                }}
                                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">₹{line.price.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-semibold text-emerald-400">
                              ₹{(line.qty * line.price * (1 + line.gstRate / 100)).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => setPoLines(poLines.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <SmartPharmaTextArea
                label="Special Logistics / Cold Chain Instructions"
                context="logistics"
                value={poNotes}
                onChange={setPoNotes}
                placeholder="e.g. Maintain cold-chain at 2°C to 8°C. Include calibrated digital temperature data logger."
                rows={2}
              />
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="text-sm font-semibold text-slate-300">
                Total Est. Indent: <span className="text-emerald-400 font-bold">
                  ₹{poLines.reduce((acc, l) => acc + (l.qty * l.price * (1 + l.gstRate / 100)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewPoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVendorPo}
                  disabled={poLines.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Commit & Dispatch Indent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
