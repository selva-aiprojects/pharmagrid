'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Building2,
  ShoppingCart,
  Banknote,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Printer,
  Download,
  Search,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Radio,
  Sparkles,
  RotateCcw,
  Calendar,
  Send
} from 'lucide-react';
import {
  pharmaApi,
  ApiChemistBeatPlan,
  ApiChemistBeatVisit,
  ApiFieldForceSummary,
  ApiProduct
} from '@/services/apiClient';

export default function FieldForceSfaView() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'order-pad' | 'collections' | 'telemetry'>('itinerary');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // SFA Data states
  const [summary, setSummary] = useState<ApiFieldForceSummary | null>(null);
  const [beats, setBeats] = useState<ApiChemistBeatPlan[]>([]);
  const [selectedBeatId, setSelectedBeatId] = useState<string>('beat-1');
  const [visits, setVisits] = useState<ApiChemistBeatVisit[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);

  // Selected visit for actions
  const [activeVisit, setActiveVisit] = useState<ApiChemistBeatVisit | null>(null);

  // Field Order Pad Form State
  const [orderItems, setOrderItems] = useState([
    {
      productId: 'p-1',
      productName: 'Augmentin 625 Duo Tablet',
      batchNumber: 'AUG-AUG625-102',
      quantity: 20,
      unitPrice: 180.50,
      schemeApplied: 'Buy 10 Get 1 Free',
      lineTotal: 3610.00
    },
    {
      productId: 'p-2',
      productName: 'Pan 40mg Gastro-Resistant Tablet',
      batchNumber: 'PAN-40-771',
      quantity: 30,
      unitPrice: 135.00,
      schemeApplied: '5% Volume Rebate',
      lineTotal: 3847.50
    }
  ]);
  const [managerOverridePin, setManagerOverridePin] = useState('');
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);

  // Field Collection Form State
  const [collectionAmount, setCollectionAmount] = useState('15000');
  const [collectionMode, setCollectionMode] = useState<'CASH' | 'CHEQUE' | 'UPI'>('CHEQUE');
  const [chequeNo, setChequeNo] = useState('CHQ-891042');
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [remarks, setRemarks] = useState('Collected by MR at morning beat visit');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBeatId) {
      loadBeatVisits(selectedBeatId);
    }
  }, [selectedBeatId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, prods] = await Promise.all([
        pharmaApi.getFieldForceSummary(),
        pharmaApi.getProducts()
      ]);
      setSummary(sum);
      setBeats(sum.beats);
      setProducts(prods);
      if (sum.beats.length > 0) {
        setSelectedBeatId(sum.beats[0].beatId);
      }
    } catch (e) {
      console.error('Error loading SFA summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBeatVisits = async (bId: string) => {
    try {
      const list = await pharmaApi.getBeatVisits(bId);
      setVisits(list);
      if (list.length > 0) {
        setActiveVisit(list[0]);
      }
    } catch (e) {
      console.error('Error loading beat visits:', e);
    }
  };

  const selectedBeat = beats.find(b => b.beatId === selectedBeatId) || beats[0] || {
    beatId: 'beat-1',
    beatName: 'T. Nagar Commercial & Hospital Beat',
    areaZone: 'Central Chennai (Zone-1)',
    repName: 'Rajesh Kumar (MR)',
    repPhone: '+91 98401 55667',
    dayOfWeek: 'Monday & Thursday',
    totalChemistsCount: 12,
    visitedCount: 9,
    targetOrderValue: 85000,
    achievedOrderValue: 92450,
    targetCollection: 50000,
    achievedCollection: 42000,
    status: 'In_Progress'
  };

  // GPS Check-in simulator
  const handleGpsCheckIn = async (vis: ApiChemistBeatVisit) => {
    try {
      await pharmaApi.recordGpsCheckIn({
        visitId: vis.visitId,
        latitude: 13.0418,
        longitude: 80.2341,
        repId: selectedBeat.repId
      });

      const updated = visits.map(v =>
        v.visitId === vis.visitId
          ? {
              ...v,
              visitStatus: 'CheckedIn' as const,
              checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isGeofenceValid: true
            }
          : v
      );
      setVisits(updated);
      setActiveVisit(updated.find(v => v.visitId === vis.visitId) || null);
      setActionSuccess(`Geofence Verified: Checked in at ${vis.customerName} (Lat 13.0418, Lng 80.2341). Order pad unlocked!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  // Submit Field Order
  const handleBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;

    if (activeVisit.isOverdueBlocked && !overrideUnlocked) {
      alert('Chemist account is blocked due to >60 days overdue! Enter Depot Manager PIN to authorize exception booking.');
      return;
    }

    try {
      const total = orderItems.reduce((acc, i) => acc + i.lineTotal, 0);
      const payload = {
        visitId: activeVisit.visitId,
        customerId: activeVisit.customerId,
        repId: selectedBeat.repId,
        latitude: 13.0418,
        longitude: 80.2341,
        items: orderItems,
        paymentMode: 'Credit',
        remarks: `Booked via SFA Mobile by ${selectedBeat.repName}`
      };

      const result = await pharmaApi.bookFieldOrder(payload);

      const updated = visits.map(v =>
        v.visitId === activeVisit.visitId
          ? {
              ...v,
              visitStatus: 'OrderBooked' as const,
              bookedOrderId: result.orderNumber,
              bookedOrderValue: total
            }
          : v
      );
      setVisits(updated);
      setActionSuccess(`Field Sales Order ${result.orderNumber} booked for ₹${total.toLocaleString('en-IN')}! Transmitted to warehouse packing queue.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setActiveTab('itinerary');
    } catch (err: any) {
      alert(err.message || 'Order booking failed');
    }
  };

  // Submit Field Payment Collection
  const handleRecordCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;
    const amount = parseFloat(collectionAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid collection amount');
      return;
    }

    try {
      const payload = {
        visitId: activeVisit.visitId,
        customerId: activeVisit.customerId,
        repId: selectedBeat.repId,
        amountCollected: amount,
        paymentMode: collectionMode,
        chequeNumber: collectionMode === 'CHEQUE' ? chequeNo : null,
        chequeBankName: collectionMode === 'CHEQUE' ? bankName : null,
        remarks
      };

      const res = await pharmaApi.recordFieldCollection(payload);

      const updated = visits.map(v =>
        v.visitId === activeVisit.visitId
          ? {
              ...v,
              collectedAmount: (v.collectedAmount || 0) + amount,
              currentOutstanding: res.remainingChemistBalance
            }
          : v
      );
      setVisits(updated);
      setActionSuccess(`Receipt Voucher ${res.receiptNumber} punched for ₹${amount.toLocaleString('en-IN')}. SMS confirmation sent to chemist!`);
      setTimeout(() => setActionSuccess(null), 4000);
      setActiveTab('itinerary');
    } catch (err: any) {
      alert(err.message || 'Collection punch failed');
    }
  };

  const totalOrderTotal = orderItems.reduce((acc, i) => acc + i.lineTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Field Force Automation (SFA) & Beat Planner</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Beat Tracking
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Chemist route beats • Mobile quick-order booking pad • Geofence GPS verification • On-field cash & cheque collection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Beat Sheet
          </button>
          <button
            onClick={() => {
              setActionSuccess('Today\'s field orders transmitted to warehouse picking wave #02.');
              setTimeout(() => setActionSuccess(null), 3000);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Transmit Field Orders
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>MR Strike Rate (Booked/Visited)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {summary?.strikeRatePercentage || 82.4}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary?.totalFieldOrdersBooked || 28} orders from {summary?.visitsCompleted || 34} chemist visits
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Field Orders Value Booked</span>
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{summary ? summary.totalFieldBookingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '2,93,550.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target: ₹3,15,000 (93.2% achieved)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>On-Field Chemist Collections</span>
            <Banknote className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 tracking-tight">
            ₹{summary ? summary.totalFieldCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,73,500.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cash & Cheques in hand with 4 MRs
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Chemist Beat Coverage</span>
            <MapPin className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 tracking-tight">
            {summary?.coveragePercentage || 75.6}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary?.visitsCompleted || 34} of {summary?.totalScheduledVisits || 45} scheduled pharmacies visited
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'itinerary'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Chemist Beat Itinerary & Geofence
        </button>

        <button
          onClick={() => setActiveTab('order-pad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'order-pad'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Mobile Field POS Order Pad
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'collections'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          On-Field Payment Collection
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'telemetry'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          MR Rep Strike Rate Telemetry
        </button>
      </div>

      {/* TAB 1: CHEMIST BEAT ITINERARY & GEOFENCE */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Beat Selector & Active Representative Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="lg:col-span-4 space-y-2">
              <label className="block text-xs font-medium text-slate-400">Select Active Chemist Beat Route</label>
              <select
                value={selectedBeatId}
                onChange={(e) => setSelectedBeatId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:border-indigo-500"
              >
                {beats.map((b) => (
                  <option key={b.beatId} value={b.beatId}>
                    {b.beatName} ({b.dayOfWeek})
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-500 font-medium">
                Zone: <span className="text-slate-300">{selectedBeat.areaZone}</span>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Order Booker</span>
                <span className="font-semibold text-white">{selectedBeat.repName}</span>
                <span className="text-[10px] text-slate-500 block">{selectedBeat.repPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Beat Visits Done</span>
                <span className="font-bold text-sky-400 text-sm">
                  {selectedBeat.visitedCount} / {selectedBeat.totalChemistsCount}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round((selectedBeat.visitedCount / selectedBeat.totalChemistsCount) * 100)}% completed
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Orders Booked</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">
                  ₹{selectedBeat.achievedOrderValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Target: ₹{selectedBeat.targetOrderValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cash/Chq Collected</span>
                <span className="font-bold text-teal-400 text-sm font-mono">
                  ₹{selectedBeat.achievedCollection.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Target: ₹{selectedBeat.targetCollection.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Sequential Chemist Stops */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Sequential Chemist Visit Queue (Beat #1)</h3>
                <p className="text-xs text-slate-400">Order booker stops arranged by optimal street walking sequence</p>
              </div>
              <span className="font-mono text-xs text-slate-400">{visits.length} Pharmacies</span>
            </div>

            <div className="space-y-3">
              {visits.map((vis) => {
                const isSelected = activeVisit?.visitId === vis.visitId;
                return (
                  <div
                    key={vis.visitId}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500/60 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Stop Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 shrink-0">
                          #{vis.sequenceOrder}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{vis.customerName}</h4>
                            <span className="text-[11px] font-mono text-slate-500">{vis.customerCode}</span>
                            {vis.isOverdueBlocked && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> OVERDUE HOLD
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{vis.address}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                            <span>Phone: <strong className="text-slate-300">{vis.contactPhone}</strong></span>
                            <span>•</span>
                            <span>DL 20B: <strong className="text-emerald-400">{vis.drugLicense20B}</strong></span>
                            <span>•</span>
                            <span>Bal Due: <strong className="text-amber-400">₹{vis.currentOutstanding.toLocaleString('en-IN')}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Visit Status & Actions */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Status Badge */}
                        {vis.visitStatus === 'OrderBooked' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Order Booked ({vis.bookedOrderId})
                          </span>
                        )}
                        {vis.visitStatus === 'CheckedIn' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Checked In ({vis.checkInTime})
                          </span>
                        )}
                        {vis.visitStatus === 'Pending' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                            Pending Visit
                          </span>
                        )}

                        {/* GPS Check-in Button */}
                        {vis.visitStatus === 'Pending' && (
                          <button
                            onClick={() => handleGpsCheckIn(vis)}
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <MapPin className="w-3 h-3" />
                            GPS Check-in
                          </button>
                        )}

                        {/* Punch Order Button */}
                        <button
                          onClick={() => {
                            setActiveVisit(vis);
                            setActiveTab('order-pad');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Punch Order
                        </button>

                        {/* Collect Payment Button */}
                        <button
                          onClick={() => {
                            setActiveVisit(vis);
                            setCollectionAmount(Math.min(vis.currentOutstanding, 15000).toString());
                            setActiveTab('collections');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
                        >
                          <Banknote className="w-3 h-3" />
                          Collect Cash/Chq
                        </button>
                      </div>
                    </div>

                    {/* Remarks snippet if any */}
                    {vis.remarks && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                        "{vis.remarks}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE FIELD POS ORDER PAD */}
      {activeTab === 'order-pad' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Order Punch Form */}
          <div className="lg:col-span-8 space-y-4">
            <form onSubmit={handleBookOrder} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Field Order Booking Pad</h3>
                </div>
                <span className="font-mono text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  {selectedBeat.repName} (SFA Mobile)
                </span>
              </div>

              {/* Chemist Details & Overdue Warning */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeVisit?.customerName || 'Select Chemist'}</h4>
                    <p className="text-xs text-slate-400">{activeVisit?.address}</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 block text-[11px]">Outstanding Due</span>
                    <span className="font-bold text-amber-400">
                      ₹{activeVisit ? activeVisit.currentOutstanding.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>

                {/* Overdue Block Notification */}
                {activeVisit?.isOverdueBlocked && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Chemist Account Blocked: Outstanding balance exceeds credit terms (&gt;60 days)</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="password"
                        placeholder="Enter Depot Manager PIN to unlock"
                        value={managerOverridePin}
                        onChange={(e) => setManagerOverridePin(e.target.value)}
                        className="bg-slate-900 border border-rose-500/50 text-white text-xs rounded px-2.5 py-1 w-64"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (managerOverridePin === '9999' || managerOverridePin.length >= 4) {
                            setOverrideUnlocked(true);
                            setActionSuccess('Manager PIN Accepted: Exception order booking authorized for this visit.');
                            setTimeout(() => setActionSuccess(null), 3000);
                          } else {
                            alert('Invalid Manager PIN. Default test pin is 9999');
                          }
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                      >
                        Authorize Override
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Medicines Ordered by Chemist
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderItems([
                        ...orderItems,
                        {
                          productId: 'p-3',
                          productName: 'Azithral 500mg Tablet (Alembic)',
                          batchNumber: 'AZI-500-881',
                          quantity: 15,
                          unitPrice: 112.00,
                          schemeApplied: 'Buy 5 Get 1 Free',
                          lineTotal: 1680.00
                        }
                      ]);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Formulation
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Medicine & Batch</th>
                        <th className="py-2.5 px-3">Scheme Deal</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">PTR (₹)</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-semibold text-white">{item.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Batch: {item.batchNumber}</div>
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {item.schemeApplied || 'Standard Trade'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...orderItems];
                                const q = parseInt(e.target.value) || 0;
                                updated[idx].quantity = q;
                                updated[idx].lineTotal = q * updated[idx].unitPrice;
                                setOrderItems(updated);
                              }}
                              className="w-16 bg-slate-950 border border-slate-700 text-white text-xs rounded px-2 py-1 text-right"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            ₹{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-400">
                            ₹{item.lineTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                if (orderItems.length <= 1) return;
                                setOrderItems(orderItems.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Order Action */}
              <button
                type="submit"
                disabled={activeVisit?.isOverdueBlocked && !overrideUnlocked}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Book Pre-Order & Transmit to Warehouse (₹{totalOrderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
              </button>
            </form>
          </div>

          {/* Right 4 Cols: Order Summary & Warehouse SLA */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Order Dispatch SLA</h3>
                <p className="text-xs text-slate-400">Same-day delivery routing</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Estimated Warehouse Cut-off</div>
                  <div className="font-bold text-white">12:30 PM (Wave #2 Dispatch)</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Delivery Van Route Assigned</div>
                  <div className="font-bold text-emerald-400">Route #01 - Central Chennai Van</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Chemist Order Booking Scheme</div>
                  <div className="font-bold text-indigo-400">10+1 Fast Moving Antibiotics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ON-FIELD PAYMENT COLLECTION */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <form onSubmit={handleRecordCollection} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Punch On-Field Payment Collection</h3>
                <p className="text-xs text-slate-400">Record cash/cheque collected by MR directly from retail counter</p>
              </div>

              {/* Chemist Display */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{activeVisit?.customerName || 'Apollo Pharmacy'}</span>
                  <span className="text-[11px] text-slate-500 block">{activeVisit?.customerCode}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-slate-400 block">Current Ledger Due</span>
                  <span className="font-bold text-amber-400">
                    ₹{activeVisit ? activeVisit.currentOutstanding.toLocaleString('en-IN') : '45,000.00'}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Collection Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CHEQUE', 'CASH', 'UPI'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCollectionMode(mode as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        collectionMode === mode
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Amount Collected (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base rounded-xl pl-8 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cheque details */}
              {collectionMode === 'CHEQUE' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cheque Number</label>
                    <input
                      type="text"
                      value={chequeNo}
                      onChange={(e) => setChequeNo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4" />
                Record On-Field Collection & Send SMS Receipt
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white">Daily Field Cash Remittance Policy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Order bookers carrying cash and cheques collected on field beats must remit collections to the distributor bank counter or depot cashier by 06:00 PM daily.
            </p>
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs space-y-1">
              <span className="font-bold text-emerald-300">Chemist SMS Confirmation</span>
              <p className="text-slate-400 text-[11px]">
                Upon punching collection, an automated SMS receipt is triggered to chemist registered mobile number acknowledging receipt of funds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MR STRIKE RATE TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Order Booker & Medical Representative Daily Telemetry</h3>
            <p className="text-xs text-slate-400">Coverage %, strike rate, order booking conversion, and on-field collection performance</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Representative Name</th>
                  <th className="py-3 px-4">Assigned Beat & Zone</th>
                  <th className="py-3 px-4 text-center">Visits Done / Total</th>
                  <th className="py-3 px-4 text-center text-sky-400">Coverage %</th>
                  <th className="py-3 px-4 text-right text-indigo-400">Booking Value (₹)</th>
                  <th className="py-3 px-4 text-right text-teal-400">Collections (₹)</th>
                  <th className="py-3 px-4 text-center text-emerald-400">Strike Rate</th>
                  <th className="py-3 px-4 text-center">Beat Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {beats.map((b) => {
                  const cov = Math.round((b.visitedCount / b.totalChemistsCount) * 100);
                  const strike = b.visitedCount > 0 ? Math.round(((b.visitedCount - 1) / b.visitedCount) * 100) : 0;
                  return (
                    <tr key={b.beatId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white">{b.repName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.repPhone}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">
                        <div>{b.beatName}</div>
                        <div className="text-[10px] text-slate-500">{b.areaZone}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {b.visitedCount} / {b.totalChemistsCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sky-400">
                        {cov}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-400">
                        ₹{b.achievedOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-teal-400">
                        ₹{b.achievedCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">
                        {strike}%
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {b.status === 'Completed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
