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

  // Create Manifest Modal
  const [isCreateManifestOpen, setIsCreateManifestOpen] = useState(false);
  const [manifestForm, setManifestForm] = useState({
    routeName: 'Route 04 - Tambaram & Chromepet Loop',
    vehicleNumber: 'TN-09-CB-1044',
    driverName: 'V. Murugan',
    driverPhone: '+91 98401 23456',
    customerName: 'Apollo Pharmacy Chromepet',
    invoiceNumber: 'INV-2026-904',
    deliveryAddress: 'GST Road, Chromepet, Chennai - 600044',
    cartonCount: 3,
    codAmount: 18500,
  });

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

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        routeName: manifestForm.routeName,
        vehicleNumber: manifestForm.vehicleNumber,
        driverName: manifestForm.driverName,
        driverPhone: manifestForm.driverPhone,
        challans: [
          {
            invoiceNumber: manifestForm.invoiceNumber,
            customerName: manifestForm.customerName,
            deliveryAddress: manifestForm.deliveryAddress,
            cartonCount: Number(manifestForm.cartonCount) || 1,
            codAmount: Number(manifestForm.codAmount) || 0,
          }
        ]
      };
      const newManifest = await pharmaApi.createDeliveryManifest(payload);
      setManifests(prev => [newManifest, ...prev]);
      setSelectedManifest(newManifest);
      setIsCreateManifestOpen(false);
      showToast(`✅ Dispatch manifest ${newManifest.manifestNumber} created with ${newManifest.vehicleNumber}!`);
      loadData();
    } catch (err: any) {
      showToast('⚠️ Could not create manifest: ' + err.message);
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              DISPATCH & FLEET
            </span>
            <span className="text-slate-500 text-xs">Van Routes • COD Reconciliation • Proof of Delivery</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Shipment, Logistics & Delivery Challans
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Generate van loading sheets, manage delivery challans, track driver Cash on Delivery (COD), and record electronic POD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateManifestOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Route Manifest
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Van Routes</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.activeManifests}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5" /> Scheduled & In-Transit
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Dispatched Parcels</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.dispatchedParcels}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Total Delivery Challans</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Delivered Today</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.deliveredToday}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Electronic POD Signed
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Pending COD Collection</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{summary.pendingCodCollections.toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 font-medium">With Drivers on Field</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Reconciled COD Today</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{summary.reconciledCodToday.toLocaleString('en-IN')}</div>
            <div className="text-xs text-purple-700 dark:text-purple-400/90 mt-1 font-medium">Deposited into Cash Counter</div>
          </div>
        </div>
      )}

      {/* Manifest Selector and Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Manifests List */}
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Route Trip Sheets ({manifests.length})</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Select to inspect challans</span>
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
                      ? 'bg-emerald-50 dark:bg-slate-800/90 border-emerald-500 dark:border-emerald-500/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{man.manifestNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      man.status === 'Reconciled' || man.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                    }`}>
                      {man.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-slate-200 text-sm mt-2">{man.routeName}</div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{man.vehicleNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{man.driverName}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{man.challans.length} Challans • {man.totalCartons} Cartons</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">COD: ₹{man.totalCodAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Manifest Details & Challans */}
        {selectedManifest ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">{selectedManifest.manifestNumber}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• {new Date(selectedManifest.dispatchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">{selectedManifest.routeName}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Vehicle: <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedManifest.vehicleNumber}</span> | Driver: <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedManifest.driverName} ({selectedManifest.driverPhone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedManifest.status !== 'Reconciled' && (
                    <button
                      onClick={() => handleReconcileManifest(selectedManifest.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Reconcile Cash & Close Trip
                    </button>
                  )}
                </div>
              </div>

              {/* Challans List */}
              <div className="mt-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Assigned Delivery Challans ({selectedManifest.challans.length})
                </div>

                <div className="space-y-2.5">
                  {selectedManifest.challans.map(challan => (
                    <div
                      key={challan.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-400 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">{challan.challanNumber}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Ref: {challan.invoiceNumber}</span>
                          <span className={`px-2 py-0.2 rounded-full text-xs font-semibold ${
                            challan.deliveryStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                              : challan.deliveryStatus === 'OutForDelivery'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}>
                            {challan.deliveryStatus}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{challan.customerName}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-md">{challan.deliveryAddress}</span>
                        </div>
                        {challan.podReceiverName && (
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>POD Signed by: {challan.podReceiverName} ({challan.podRemarks || 'Verified'})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{challan.cartonCount} Cartons</div>
                          <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                            {challan.codAmount > 0 ? `COD: ₹${challan.codAmount.toLocaleString('en-IN')}` : 'Credit Invoice'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{challan.paymentMode}</div>
                        </div>

                        {challan.deliveryStatus !== 'Delivered' ? (
                          <button
                            onClick={() => {
                              setPodTarget({ manifestId: selectedManifest.id, challan });
                              setReceiverName('');
                              setPodRemarks('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Record POD
                          </button>
                        ) : (
                          <div className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
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
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
            Select a delivery manifest to view route dispatch details and challans.
          </div>
        )}
      </div>

      {/* Modal: Record Proof of Delivery (POD) */}
      {podTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Electronic Proof of Delivery (POD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{podTarget.challan.challanNumber} • {podTarget.challan.customerName}</p>
              </div>
              <button onClick={() => setPodTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Delivery Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPodStatus('Delivered')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                      podStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Delivered & Handed Over
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodStatus('AttemptedFailed')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                      podStatus === 'AttemptedFailed'
                        ? 'bg-rose-100 text-rose-800 border-rose-400 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Attempted / Failed
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Receiving Pharmacist / Store In-Charge Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  placeholder="e.g. Dr. K. Murugan (Reg. Pharmacist)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {podTarget.challan.codAmount > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold">COD Collection Amount:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">₹{podTarget.challan.codAmount.toLocaleString('en-IN')}</span>
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

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setPodTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePod}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Commit POD Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CREATE NEW ROUTE MANIFEST */}
      {isCreateManifestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Create Van Dispatch Route Manifest
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign delivery driver, dispatch vehicle, retail chemist stops, and target COD reconciliation.
                </p>
              </div>
              <button
                onClick={() => setIsCreateManifestOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManifest} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Delivery Corridor / Route Name *
                </label>
                <input
                  type="text"
                  required
                  value={manifestForm.routeName}
                  onChange={e => setManifestForm({ ...manifestForm, routeName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Assigned Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN-09-CB-1044"
                    value={manifestForm.vehicleNumber}
                    onChange={e => setManifestForm({ ...manifestForm, vehicleNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Designated Van Driver *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. V. Murugan"
                    value={manifestForm.driverName}
                    onChange={e => setManifestForm({ ...manifestForm, driverName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Driver Mobile Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={manifestForm.driverPhone}
                    onChange={e => setManifestForm({ ...manifestForm, driverPhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Invoice Number Allocated
                  </label>
                  <input
                    type="text"
                    required
                    value={manifestForm.invoiceNumber}
                    onChange={e => setManifestForm({ ...manifestForm, invoiceNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold uppercase focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Delivery Stop Detail */}
              <div className="p-3 bg-emerald-50/50 dark:bg-slate-950/60 rounded-xl border border-emerald-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Primary Delivery Parcel &amp; Destination Chemist
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Pharmacy / Hospital Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manifestForm.customerName}
                      onChange={e => setManifestForm({ ...manifestForm, customerName: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Destination Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={manifestForm.deliveryAddress}
                      onChange={e => setManifestForm({ ...manifestForm, deliveryAddress: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Carton Boxes Loaded
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={manifestForm.cartonCount}
                      onChange={e => setManifestForm({ ...manifestForm, cartonCount: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Cash On Delivery (COD) Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={manifestForm.codAmount}
                      onChange={e => setManifestForm({ ...manifestForm, codAmount: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateManifestOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Dispatch Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
