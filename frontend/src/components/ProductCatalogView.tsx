'use client';

import React, { useState } from 'react';
import { SAMPLE_PRODUCTS, ProductItem } from '@/data/mockData';
import {
  Search,
  Plus,
  Filter,
  Package,
  Layers,
  Sparkles,
  Shield,
  Snowflake,
  AlertCircle,
  Tag,
  ArrowUpDown,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function ProductCatalogView() {
  const [products, setProducts] = useState<ProductItem[]>(SAMPLE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Medicine Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: 'Sun Pharmaceutical Industries',
    dosageForm: 'Tablet',
    packSize: '10 Tablets/Strip',
    uom: 'Strips',
    hsnCode: '30049099',
    gstPercentage: 12,
    ptr: 45.0,
    mrp: 65.0,
    scheduleClass: 'H' as 'Regular' | 'G' | 'H' | 'H1' | 'X',
    storageCondition: 'Room Temperature' as 'Room Temperature' | 'Cold Chain (2-8°C)' | 'Controlled',
    reorderLevel: 100,
    initialBatchNumber: 'BAT-' + Math.floor(1000 + Math.random() * 9000),
    initialExpiryDate: '2028-06-30',
    initialQty: 250,
    rackLocation: 'Z1-R02-S3',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.genericName.trim()) {
      showToast('⚠️  Please enter Medicine Brand Name and Generic Molecule');
      return;
    }

    const code = 'MED-' + (products.length + 101);
    const newBatch = {
      batchId: 'b-' + Date.now(),
      batchNumber: formData.initialBatchNumber || 'BAT-001',
      manufacturingDate: new Date().toISOString().split('T')[0],
      expiryDate: formData.initialExpiryDate || '2028-12-31',
      availableQty: Number(formData.initialQty) || 100,
      ptr: Number(formData.ptr) || 50,
      mrp: Number(formData.mrp) || 75,
      rackLocation: formData.rackLocation || 'Z1-R01-S1',
      isNearExpiry: false,
    };

    const newProd: ProductItem = {
      productId: 'p-' + Date.now(),
      code: code,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      manufacturer: formData.manufacturer,
      dosageForm: formData.dosageForm,
      packSize: formData.packSize,
      uom: formData.uom,
      hsnCode: formData.hsnCode,
      gstPercentage: Number(formData.gstPercentage),
      ptr: Number(formData.ptr),
      pts: Number(formData.ptr) * 0.95,
      mrp: Number(formData.mrp),
      scheduleClass: formData.scheduleClass,
      storageCondition: formData.storageCondition,
      reorderLevel: Number(formData.reorderLevel),
      batches: [newBatch],
    };

    setProducts(prev => [newProd, ...prev]);
    setIsAddModalOpen(false);
    showToast(`✅ "${newProd.name}" registered successfully with batch ${newBatch.batchNumber}!`);

    // Reset form
    setFormData({
      name: '',
      genericName: '',
      manufacturer: 'Sun Pharmaceutical Industries',
      dosageForm: 'Tablet',
      packSize: '10 Tablets/Strip',
      uom: 'Strips',
      hsnCode: '30049099',
      gstPercentage: 12,
      ptr: 45.0,
      mrp: 65.0,
      scheduleClass: 'H',
      storageCondition: 'Room Temperature',
      reorderLevel: 100,
      initialBatchNumber: 'BAT-' + Math.floor(1000 + Math.random() * 9000),
      initialExpiryDate: '2028-06-30',
      initialQty: 250,
      rackLocation: 'Z1-R02-S3',
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchedule =
      scheduleFilter === 'all' || p.scheduleClass === scheduleFilter;

    return matchesSearch && matchesSchedule;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER & ACTIONS */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Master Product Catalog &amp; SKU Directory
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#adb5d4] mt-0.5">
            CDSCO Drugs &amp; Cosmetics classification, Indian GST HSN codes, and cold-chain attributes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Schedule Filter Tabs */}
          <div className="bg-slate-100 dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 rounded-lg p-1 flex text-xs">
            {['all', 'Regular', 'H', 'H1', 'G'].map(sch => (
              <button
                key={sch}
                onClick={() => setScheduleFilter(sch)}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  scheduleFilter === sch
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#adb5d4] dark:hover:text-white'
                }`}
              >
                {sch === 'all' ? 'All Classes' : `Sch ${sch}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Medicine
          </button>
        </div>
      </div>

      {/* 2. SEARCH & STATS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Brand Name, Molecule / Generic, HSN Code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-[#adb5d4] font-mono">
          <span>Showing <strong className="text-cyan-700 dark:text-cyan-400">{filteredProducts.length}</strong> of {products.length} SKUs</span>
          <span>•</span>
          <span>Active Batches: <strong className="text-emerald-700 dark:text-emerald-400">{products.reduce((s, p) => s + p.batches.length, 0)} Available</strong></span>
        </div>
      </div>

      {/* 3. PRODUCTS DATA TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-[#111535] text-slate-800 dark:text-[#e8eaff] uppercase tracking-wider text-[11px] font-bold border-b border-slate-300 dark:border-white/11">
              <tr>
                <th className="py-3 px-4">Medicine Brand &amp; Generic Molecule</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3">Pack &amp; Form</th>
                <th className="py-3 px-3 text-center">HSN / GST</th>
                <th className="py-3 px-3 text-right">PTR Rate</th>
                <th className="py-3 px-3 text-right">MRP</th>
                <th className="py-3 px-3 text-center">Regulatory Schedule</th>
                <th className="py-3 px-3 text-center">Batches Held</th>
                <th className="py-3 px-3 text-right">Total Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-[#d4d8f5]">
              {filteredProducts.map(prod => {
                const totalUnits = prod.batches.reduce((sum, b) => sum + b.availableQty, 0);

                return (
                  <tr key={prod.productId} className="hover:bg-blue-50/50 dark:hover:bg-[#161940]/60 transition-colors">
                    {/* Brand & Molecule */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        {prod.name}
                        {prod.storageCondition.includes('Cold Chain') && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            <Snowflake className="w-2.5 h-2.5" /> 2-8°C
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#adb5d4] font-normal mt-0.5">
                        {prod.genericName}
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3 px-3 text-slate-800 dark:text-[#d4d8f5]">
                      {prod.manufacturer}
                    </td>

                    {/* Pack & Form */}
                    <td className="py-3 px-3 text-slate-700 dark:text-[#c2c8e8] font-mono">
                      <div>{prod.dosageForm}</div>
                      <div className="text-[10px] text-slate-500">{prod.packSize}</div>
                    </td>

                    {/* HSN & GST */}
                    <td className="py-3 px-3 text-center font-mono">
                      <div className="text-slate-800 dark:text-[#d4d8f5]">{prod.hsnCode}</div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-[#111535] text-blue-700 dark:text-cyan-400 border border-slate-200 dark:border-white/11">
                        {prod.gstPercentage}% GST
                      </span>
                    </td>

                    {/* PTR Rate */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-[#e8eaff]">
                      ₹{prod.ptr.toFixed(2)}
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-[#adb5d4] font-medium">
                      ₹{prod.mrp.toFixed(2)}
                    </td>

                    {/* Schedule Class Badge */}
                    <td className="py-3 px-3 text-center">
                      {prod.scheduleClass === 'H1' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                          Schedule H1
                        </span>
                      ) : prod.scheduleClass === 'H' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                          Schedule H
                        </span>
                      ) : prod.scheduleClass === 'G' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                          Schedule G
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#111535] dark:text-[#c2c8e8] dark:border-white/11">
                          Regular
                        </span>
                      )}
                    </td>

                    {/* Batches Held */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0d1130] text-slate-700 dark:text-[#c2c8e8] border border-slate-200 dark:border-white/8 text-xs font-medium">
                        {prod.batches.length} {prod.batches.length === 1 ? 'Batch' : 'Batches'}
                      </span>
                    </td>

                    {/* Total Available Units */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {totalUnits} {prod.uom}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: ADD NEW MEDICINE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-[#070a1e] border-b border-slate-200 dark:border-white/8 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Register New Pharmaceutical SKU
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#adb5d4]">
                  CDSCO Drugs &amp; Cosmetics Act compliance, Indian GST HSN slab, and opening batch inventory.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-[#d4d8f5] p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Brand Name / Commercial Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Azithral 500mg Tablet"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Generic Molecule / Composition *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Azithromycin 500mg IP"
                    value={formData.genericName}
                    onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Manufacturing Principal / Company *
                  </label>
                  <select
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  >
                    <option value="Sun Pharmaceutical Industries">Sun Pharmaceutical Industries</option>
                    <option value="Cipla Ltd">Cipla Ltd</option>
                    <option value="Dr. Reddy's Laboratories">Dr. Reddy's Laboratories</option>
                    <option value="GlaxoSmithKline India">GlaxoSmithKline India</option>
                    <option value="Alkem Laboratories">Alkem Laboratories</option>
                    <option value="Torrent Pharmaceuticals">Torrent Pharmaceuticals</option>
                    <option value="Abbott Healthcare Pvt Ltd">Abbott Healthcare Pvt Ltd</option>
                    <option value="Lupin Limited">Lupin Limited</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      Dosage Form
                    </label>
                    <select
                      value={formData.dosageForm}
                      onChange={e => setFormData({ ...formData, dosageForm: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      Pack Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Tablets"
                      value={formData.packSize}
                      onChange={e => setFormData({ ...formData, packSize: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      CDSCO Schedule
                    </label>
                    <select
                      value={formData.scheduleClass}
                      onChange={e => setFormData({ ...formData, scheduleClass: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                    >
                      <option value="Regular">Regular (OTC/Standard)</option>
                      <option value="H">Schedule H</option>
                      <option value="H1">Schedule H1 (Warning)</option>
                      <option value="G">Schedule G</option>
                      <option value="X">Schedule X (Narcotics)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={e => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      GST Rate %
                    </label>
                    <select
                      value={formData.gstPercentage}
                      onChange={e => setFormData({ ...formData, gstPercentage: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                    >
                      <option value="0">0% (Nil)</option>
                      <option value="5">5% (Essential)</option>
                      <option value="12">12% (Standard Pharma)</option>
                      <option value="18">18% (Supplements/Cosmeceuticals)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      PTR Rate (₹ Price to Retailer) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.ptr}
                      onChange={e => setFormData({ ...formData, ptr: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-bold focus:border-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                      MRP (₹ Maximum Retail Price) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-bold focus:border-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Storage &amp; Cold Chain Requirement
                  </label>
                  <select
                    value={formData.storageCondition}
                    onChange={e => setFormData({ ...formData, storageCondition: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  >
                    <option value="Room Temperature">Room Temperature (Below 25°C)</option>
                    <option value="Cold Chain (2-8°C)">Cold Chain Required (2°C to 8°C Refrigerator)</option>
                    <option value="Controlled">Controlled Humidity &amp; Dark Storage</option>
                  </select>
                </div>
              </div>

              {/* Initial Batch & Physical Location */}
              <div className="p-3 bg-blue-50/50 dark:bg-[#070a1e]/60 rounded-xl border border-blue-200 dark:border-white/8 space-y-3">
                <div className="font-bold text-blue-900 dark:text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Initial Opening Batch &amp; Warehouse Location
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-[#adb5d4] text-[11px] mb-1 font-semibold">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.initialBatchNumber}
                      onChange={e => setFormData({ ...formData, initialBatchNumber: e.target.value })}
                      className="w-full bg-white dark:bg-[#0d1130] border border-slate-300 dark:border-white/11 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-[#adb5d4] text-[11px] mb-1 font-semibold">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.initialExpiryDate}
                      onChange={e => setFormData({ ...formData, initialExpiryDate: e.target.value })}
                      className="w-full bg-white dark:bg-[#0d1130] border border-slate-300 dark:border-white/11 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-[#adb5d4] text-[11px] mb-1 font-semibold">
                      Opening Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.initialQty}
                      onChange={e => setFormData({ ...formData, initialQty: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-[#0d1130] border border-slate-300 dark:border-white/11 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-[#adb5d4] text-[11px] mb-1 font-semibold">
                      Rack Location (Z-R-S)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rackLocation}
                      onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                      className="w-full bg-white dark:bg-[#0d1130] border border-slate-300 dark:border-white/11 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/11 text-slate-700 dark:text-[#c2c8e8] hover:bg-slate-100 dark:hover:bg-[#161940] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save &amp; Register Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

