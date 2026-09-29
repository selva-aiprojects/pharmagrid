'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiDeliveryManifest,
  ApiDeliveryChallan,
  ApiLogisticsSummary
} from '@/services/apiClient';
import SmartPharmaTextArea from '@/components/SmartPharmaTextArea';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  DollarSign,
  Phone,
  User,
  ShieldCheck,
  Package,
  RefreshCw,
  Plus,
  Check,
  X,
  FileText
} from 'lucide-react';

export default function LogisticsDispatchView() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiLogisticsSummary | null>(null);
  const [manifests, setManifests] = useState<ApiDeliveryManifest[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<ApiDeliveryManifest | null>(null);

  // POD Update Modal
  const [podTarget, setPodTarget] = useState<{ manifestId: string; challan: ApiDeliveryChallan } | null>(null);
  const [podStatus, setPodStatus] = useState<'Delivered' | 'AttemptedFailed' | 'Returned'>('Delivered');
  const [receiverName, setReceiverName] = useState('');
  const [podRemarks, setPodRemarks] = useState('');
  
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, manRes] = await Promise.all([
        pharmaApi.getLogisticsSummary(),
        pharmaApi.getDeliveryManifests()
      ]);
      setSummary(sumRes);
      setManifests(manRes);
      if (manRes.length > 0) {
        setSelectedManifest(manRes[0]);
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

  const handleUpdatePod = async () => {
    if (!podTarget) return;
    try {
      await pharmaApi.updateChallanPod(podTarget.manifestId, podTarget.challan.id, {
        deliveryStatus: podStatus,
        podReceiverName: receiverName || 'Authorized Receiving Pharmacist',
        podRemarks: podRemarks || (podStatus === 'Delivered' ? 'Delivery verified with stamp & sign' : 'Pharmacy closed during visit')
      });
      showToast(`✅ Proof of Delivery (POD) recorded for ${podTarget.challan.customerName}!`);
      setPodTarget(null);
      setReceiverName('');
      setPodRemarks('');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update POD');
    }
  };

  const handleReconcileManifest = async (manId: string) => {
    try {
      const res = await pharmaApi.completeManifest(manId);
      showToast(`🎉 ${res.message || 'Manifest and Cash Collections reconciled!'}`);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to reconcile');
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              DISPATCH & FLEET
            </span>
            <span className="text-slate-500 text-xs">Van Routes • COD Reconciliation • Proof of Delivery</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Truck className="w-7 h-7 text-emerald-400" />
            Shipment, Logistics & Delivery Challans
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate van loading sheets, manage delivery challans, track driver Cash on Delivery (COD), and record electronic POD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => showToast('💡 New delivery manifests are automatically created during invoice batch packing.')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Route Manifest
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Van Routes</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.activeManifests}</div>
            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Scheduled & In-Transit
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Dispatched Parcels</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.dispatchedParcels}</div>
            <div className="text-xs text-slate-500 mt-1">Total Delivery Challans</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Delivered Today</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.deliveredToday}</div>
            <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Electronic POD Signed
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pending COD Collection</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">₹{summary.pendingCodCollections.toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-500/80 mt-1">With Drivers on Field</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Reconciled COD Today</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">₹{summary.reconciledCodToday.toLocaleString('en-IN')}</div>
            <div className="text-xs text-purple-400/80 mt-1">Deposited into Cash Counter</div>
          </div>
        </div>
      )}

      {/* Manifest Selector and Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Manifests List */}
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-300 flex items-center justify-between">
            <span>Route Trip Sheets ({manifests.length})</span>
            <span className="text-xs text-slate-500">Select to inspect challans</span>
          </div>

          <div className="space-y-3">
            {manifests.map(man => {
              const isSelected = selectedManifest?.id === man.id;
              return (
                <div
                  key={man.id}
                  onClick={() => setSelectedManifest(man)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{man.manifestNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      man.status === 'Reconciled' || man.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {man.status}
                    </span>
                  </div>

                  <div className="font-medium text-slate-200 text-sm mt-2">{man.routeName}</div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{man.vehicleNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{man.driverName}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{man.challans.length} Challans • {man.totalCartons} Cartons</span>
                    <span className="font-semibold text-emerald-400">COD: ₹{man.totalCodAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Manifest Details & Challans */}
        {selectedManifest ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-emerald-400">{selectedManifest.manifestNumber}</span>
                    <span className="text-xs text-slate-500">• {new Date(selectedManifest.dispatchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">{selectedManifest.routeName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Vehicle: <span className="text-slate-200">{selectedManifest.vehicleNumber}</span> | Driver: <span className="text-slate-200">{selectedManifest.driverName} ({selectedManifest.driverPhone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedManifest.status !== 'Reconciled' && (
                    <button
                      onClick={() => handleReconcileManifest(selectedManifest.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Reconcile Cash & Close Trip
                    </button>
                  )}
                </div>
              </div>

              {/* Challans List */}
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Delivery Challans ({selectedManifest.challans.length})
                </div>

                <div className="space-y-2.5">
                  {selectedManifest.challans.map(challan => (
                    <div
                      key={challan.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">{challan.challanNumber}</span>
                          <span className="text-xs text-slate-500">Ref: {challan.invoiceNumber}</span>
                          <span className={`px-2 py-0.2 rounded-full text-xs font-semibold ${
                            challan.deliveryStatus === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : challan.deliveryStatus === 'OutForDelivery'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {challan.deliveryStatus}
                          </span>
                        </div>
                        <div className="font-medium text-slate-200 text-sm">{challan.customerName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-md">{challan.deliveryAddress}</span>
                        </div>
                        {challan.podReceiverName && (
                          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>POD Signed by: {challan.podReceiverName} ({challan.podRemarks || 'Verified'})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{challan.cartonCount} Cartons</div>
                          <div className="font-semibold text-emerald-400 text-sm">
                            {challan.codAmount > 0 ? `COD: ₹${challan.codAmount.toLocaleString('en-IN')}` : 'Credit Invoice'}
                          </div>
                          <div className="text-xs text-slate-500">{challan.paymentMode}</div>
                        </div>

                        {challan.deliveryStatus !== 'Delivered' ? (
                          <button
                            onClick={() => {
                              setPodTarget({ manifestId: selectedManifest.id, challan });
                              setReceiverName('');
                              setPodRemarks('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Record POD
                          </button>
                        ) : (
                          <div className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
            Select a delivery manifest to view route dispatch details and challans.
          </div>
        )}
      </div>

      {/* Modal: Record Proof of Delivery (POD) */}
      {podTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Electronic Proof of Delivery (POD)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{podTarget.challan.challanNumber} • {podTarget.challan.customerName}</p>
              </div>
              <button onClick={() => setPodTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Delivery Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPodStatus('Delivered')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                      podStatus === 'Delivered'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Delivered & Handed Over
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodStatus('AttemptedFailed')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                      podStatus === 'AttemptedFailed'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Attempted / Failed
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Receiving Pharmacist / Store In-Charge Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  placeholder="e.g. Dr. K. Murugan (Reg. Pharmacist)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {podTarget.challan.codAmount > 0 && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/50 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">COD Collection Amount:</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{podTarget.challan.codAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <SmartPharmaTextArea
                label="Inspection Remarks / Seal Condition"
                context="pod"
                value={podRemarks}
                onChange={setPodRemarks}
                placeholder="e.g. Tamper tape intact, cold-chain temperature verified upon handover."
                rows={2}
              />
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setPodTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePod}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Commit POD Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
