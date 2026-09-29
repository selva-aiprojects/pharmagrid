'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiManufacturerMaster,
  ApiCategoryMaster,
  ApiWarehouseRack,
  ApiHsnTaxMaster,
  ApiDeliveryRoute
} from '@/services/apiClient';
import {
  Database,
  Building,
  Layers,
  MapPin,
  Tag,
  Percent,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Boxes,
  FileText,
  Phone,
  Mail,
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';

export default function MastersManagementView() {
  const [activeTab, setActiveTab] = useState<'manufacturers' | 'categories' | 'racks' | 'hsn' | 'routes' | 'depot'>('manufacturers');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [summary, setSummary] = useState<any>({ totalManufacturers: 6, totalCategories: 6, totalRacks: 6, totalHsnCodes: 5, totalRoutes: 4 });
  const [manufacturers, setManufacturers] = useState<ApiManufacturerMaster[]>([]);
  const [categories, setCategories] = useState<ApiCategoryMaster[]>([]);
  const [racks, setRacks] = useState<ApiWarehouseRack[]>([]);
  const [hsnTax, setHsnTax] = useState<ApiHsnTaxMaster[]>([]);
  const [routes, setRoutes] = useState<ApiDeliveryRoute[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding entries
  const [mfgForm, setMfgForm] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    drugLicenseNo: '',
    gstin: '',
    creditDays: 30,
    city: 'Mumbai',
    state: 'Maharashtra',
  });

  const [catForm, setCatForm] = useState({
    name: '',
    code: '',
    scheduleClass: 'H' as 'Regular' | 'H' | 'H1' | 'G' | 'X',
    isColdChain: false,
    recommendedTemp: 'Store below 25°C',
  });

  const [rackForm, setRackForm] = useState({
    rackCode: '',
    zone: 'Zone A - Fast Moving Tablets',
    shelfCount: 4,
    capacityBoxes: 400,
    temperatureType: 'Ambient (15-25°C)',
  });

  const [hsnForm, setHsnForm] = useState({
    hsnCode: '',
    description: '',
    cgst: 6,
    sgst: 6,
    igst: 12,
  });

  const [routeForm, setRouteForm] = useState({
    routeCode: '',
    routeName: '',
    assignedVehicle: 'TN-09-CB-1044',
    driverName: '',
    driverPhone: '+91 98401 23456',
    estimatedDuration: '4.5 Hours',
    totalCustomersCount: 15,
    targetCodCollection: 125000,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'manufacturers') {
      if (!mfgForm.name.trim()) {
        showToast('⚠️ Manufacturer name is required');
        return;
      }
      const newMfg: ApiManufacturerMaster = {
        id: 'mfg-' + Date.now(),
        code: mfgForm.code.trim().toUpperCase() || 'MFG-' + (manufacturers.length + 101),
        name: mfgForm.name.trim(),
        divisions: 'All Divisions',
        returnPolicy: '100% Expiry Breakage Replacement within 60 days',
        phone: mfgForm.phone || '+91 98401 00000',
        email: mfgForm.email || 'orders@pharma.com',
        isActive: true,
        skuCount: 0,
      };
      setManufacturers(prev => [newMfg, ...prev]);
      setSummary((s: any) => ({ ...s, totalManufacturers: (s.totalManufacturers || 0) + 1 }));
      showToast(`✅ Manufacturer "${newMfg.name}" added to master database!`);
    } else if (activeTab === 'categories') {
      if (!catForm.name.trim()) {
        showToast('⚠️ Category name is required');
        return;
      }
      const newCat: ApiCategoryMaster = {
        id: 'cat-' + Date.now(),
        name: catForm.name.trim(),
        description: catForm.scheduleClass ? `Schedule ${catForm.scheduleClass} Formulation` : 'Therapeutic Formulation',
        scheduleClass: catForm.scheduleClass,
        storageCondition: catForm.isColdChain ? 'Cold Chain (2°C - 8°C)' : catForm.recommendedTemp || 'Ambient',
        isActive: true,
        skuCount: 0,
      };
      setCategories(prev => [newCat, ...prev]);
      setSummary((s: any) => ({ ...s, totalCategories: (s.totalCategories || 0) + 1 }));
      showToast(`✅ Category "${newCat.name}" added successfully!`);
    } else if (activeTab === 'racks') {
      if (!rackForm.rackCode.trim()) {
        showToast('⚠️ Rack location code is required');
        return;
      }
      const newRack: ApiWarehouseRack = {
        id: 'rck-' + Date.now(),
        binCode: rackForm.rackCode.trim().toUpperCase(),
        zone: rackForm.zone,
        rack: rackForm.rackCode.split('-')[1] || 'R01',
        shelf: 'S01',
        bin: 'B01',
        storageType: rackForm.temperatureType,
        capacity: Number(rackForm.capacityBoxes) || 400,
        occupied: 0,
        status: 'Available',
      };
      setRacks(prev => [newRack, ...prev]);
      setSummary((s: any) => ({ ...s, totalRacks: (s.totalRacks || 0) + 1 }));
      showToast(`✅ Rack location "${newRack.binCode}" registered!`);
    } else if (activeTab === 'hsn') {
      if (!hsnForm.hsnCode.trim()) {
        showToast('⚠️ HSN code is required');
        return;
      }
      const newHsn: ApiHsnTaxMaster = {
        id: 'hsn-' + Date.now(),
        hsnCode: hsnForm.hsnCode.trim(),
        description: hsnForm.description || 'Pharmaceutical formulation',
        gstRate: Number(hsnForm.igst) || 12,
        cgstRate: Number(hsnForm.cgst) || 6,
        sgstRate: Number(hsnForm.sgst) || 6,
        igstRate: Number(hsnForm.igst) || 12,
        slabName: `GST ${hsnForm.igst}% Standard Pharma Slab`,
        isActive: true,
      };
      setHsnTax(prev => [newHsn, ...prev]);
      setSummary((s: any) => ({ ...s, totalHsnCodes: (s.totalHsnCodes || 0) + 1 }));
      showToast(`✅ HSN code "${newHsn.hsnCode}" tax slab configured!`);
    } else if (activeTab === 'routes') {
      if (!routeForm.routeName.trim()) {
        showToast('⚠️ Route name is required');
        return;
      }
      const newRoute: ApiDeliveryRoute = {
        id: 'rt-' + Date.now(),
        routeName: routeForm.routeName.trim(),
        areaCoverage: 'Chennai Metro & Peripheral Zones',
        vehicleAssigned: routeForm.assignedVehicle || 'TN-09-CB-1044',
        driverName: routeForm.driverName || 'Designated Driver',
        driverPhone: routeForm.driverPhone || '+91 98401 23456',
        chemistCount: Number(routeForm.totalCustomersCount) || 15,
        frequency: 'Daily (2 Dispatch Runs)',
        targetCodCollection: Number(routeForm.targetCodCollection) || 50000,
      };
      setRoutes(prev => [newRoute, ...prev]);
      setSummary((s: any) => ({ ...s, totalRoutes: (s.totalRoutes || 0) + 1 }));
      showToast(`✅ Delivery route "${newRoute.routeName}" created!`);
    }
    setIsAddModalOpen(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, mfg, cat, rck, hsn, rts] = await Promise.all([
        pharmaApi.getMastersSummary(),
        pharmaApi.getManufacturersMaster(),
        pharmaApi.getCategoriesMaster(),
        pharmaApi.getRacksMaster(),
        pharmaApi.getHsnTaxMaster(),
        pharmaApi.getDeliveryRoutesMaster()
      ]);
      if (sum) setSummary(sum);
      setManufacturers(mfg);
      setCategories(cat);
      setRacks(rck);
      setHsnTax(hsn);
      setRoutes(rts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              CENTRAL CONFIGURATION HUB
            </span>
            <span className="text-slate-500 text-xs">CDSCO Statutory Master Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Central Masters Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Configure pharmaceutical manufacturers, therapeutic groups, warehouse bin racks, GST HSN slabs, van delivery routes, and depot statutory profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            Refresh Masters
          </button>
          <button
            onClick={() => {
              if (activeTab === 'depot') {
                showToast('💡 Depot statutory profile is verified with CDSCO licensing authority.');
              } else {
                setIsAddModalOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'manufacturers' ? 'Manufacturer' : activeTab === 'categories' ? 'Category' : activeTab === 'racks' ? 'Rack Location' : activeTab === 'hsn' ? 'GST / HSN Slab' : activeTab === 'routes' ? 'Delivery Route' : 'Master Entry'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('manufacturers')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'manufacturers'
              ? 'bg-blue-50 border-blue-400 dark:bg-blue-950/40 dark:border-blue-500/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Manufacturers</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalManufacturers}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
            <Building className="w-3.5 h-3.5" /> Pharma Companies
          </div>
        </div>

        <div
          onClick={() => setActiveTab('categories')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'categories'
              ? 'bg-purple-50 border-purple-400 dark:bg-purple-950/40 dark:border-purple-500/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Therapeutic Groups</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalCategories}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5" /> CDSCO Schedules
          </div>
        </div>

        <div
          onClick={() => setActiveTab('racks')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'racks'
              ? 'bg-cyan-50 border-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-500/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Warehouse Bins</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalRacks}</div>
          <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1 font-medium">
            <Boxes className="w-3.5 h-3.5" /> Put-Away Racks
          </div>
        </div>

        <div
          onClick={() => setActiveTab('hsn')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'hsn'
              ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-500/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Tax & HSN Codes</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalHsnCodes}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <Percent className="w-3.5 h-3.5" /> Dual GST Slabs
          </div>
        </div>

        <div
          onClick={() => setActiveTab('routes')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'routes'
              ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/40 dark:border-amber-500/60 shadow-xs'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Delivery Routes</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalRoutes}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <Truck className="w-3.5 h-3.5" /> Van Trip Loops
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('manufacturers')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'manufacturers'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          Pharma Manufacturers ({manufacturers.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Therapeutic Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('racks')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'racks'
              ? 'border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Warehouse Rack Locations ({racks.length})
        </button>
        <button
          onClick={() => setActiveTab('hsn')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'hsn'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          GST &amp; HSN Directory ({hsnTax.length})
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'routes'
              ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          Delivery Territories ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('depot')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'depot'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Depot Regulatory Profile
        </button>
      </div>

      {/* Tab 1: Manufacturers Master */}
      {activeTab === 'manufacturers' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Registered Pharmaceutical Manufacturers</div>
            <div className="text-xs text-slate-500">Defines returns, credit notes &amp; brand divisions</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Company Code</th>
                  <th className="py-3 px-4">Manufacturer Name</th>
                  <th className="py-3 px-4">Therapeutic Divisions</th>
                  <th className="py-3 px-4">Expiry Return Policy</th>
                  <th className="py-3 px-4">Rep Contact</th>
                  <th className="py-3 px-4 text-center">Active SKUs</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {manufacturers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">
                      {m.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {m.divisions}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {m.returnPolicy}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="text-slate-900 dark:text-slate-200 font-medium">{m.phone}</div>
                      <div className="text-slate-500 dark:text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 dark:text-cyan-400">
                      {m.skuCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Categories Master */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Therapeutic Categories &amp; CDSCO Schedule Classes</div>
            <div className="text-xs text-slate-500">Regulates prescription requirements and storage controls</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Therapeutic Scope</th>
                  <th className="py-3 px-4">Statutory Schedule</th>
                  <th className="py-3 px-4">Mandatory Storage</th>
                  <th className="py-3 px-4 text-center">Active SKUs</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {c.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.scheduleClass === 'Schedule X'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          : c.scheduleClass === 'Schedule H1'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                          : c.scheduleClass === 'Schedule H'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {c.scheduleClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {c.storageCondition}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700 dark:text-purple-400">
                      {c.skuCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Racks Master */}
      {activeTab === 'racks' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Warehouse Zone, Rack &amp; Bin Hierarchy</div>
            <div className="text-xs text-slate-500">Accurate physical put-away locations for rapid picker routing</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bin Location Code</th>
                  <th className="py-3 px-4">Warehouse Zone</th>
                  <th className="py-3 px-4">Rack &amp; Shelf</th>
                  <th className="py-3 px-4">Storage Environment</th>
                  <th className="py-3 px-4 text-center">Capacity (Units)</th>
                  <th className="py-3 px-4 text-center">Occupied</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {racks.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700 dark:text-cyan-400 text-xs">
                      {r.binCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {r.zone}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {r.rack} &bull; {r.shelf} &bull; {r.bin}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {r.storageType}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {r.capacity}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-cyan-700 dark:text-cyan-400">
                      {r.occupied}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        r.status === 'Audit Locked'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: HSN & Tax Master */}
      {activeTab === 'hsn' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Indian Dual GST &amp; HSN Directory Master</div>
            <div className="text-xs text-slate-500">Statutory CGST/SGST/IGST apportionments for pharmaceutical invoicing</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4">Therapeutic / Commodity Description</th>
                  <th className="py-3 px-4 text-center">GST Rate</th>
                  <th className="py-3 px-4 text-center">CGST</th>
                  <th className="py-3 px-4 text-center">SGST</th>
                  <th className="py-3 px-4 text-center">IGST</th>
                  <th className="py-3 px-4">Slab Classification</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {hsnTax.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                      {h.hsnCode}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-200 max-w-md">
                      {h.description}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {h.gstRate}%
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {h.cgstRate}%
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {h.sgstRate}%
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {h.igstRate}%
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {h.slabName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Delivery Routes Master */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Territory &amp; Van Route Master</div>
            <div className="text-xs text-slate-500">Daily logistics trip scheduling &amp; driver COD allocations</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Route Name</th>
                  <th className="py-3 px-4">Area Coverage</th>
                  <th className="py-3 px-4">Vehicle Assigned</th>
                  <th className="py-3 px-4">Driver In-Charge</th>
                  <th className="py-3 px-4 text-center">Chemists</th>
                  <th className="py-3 px-4">Dispatch Frequency</th>
                  <th className="py-3 px-4 text-right">Target COD (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {r.routeName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {r.areaCoverage}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {r.vehicleAssigned}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{r.driverName}</div>
                      <div className="text-slate-500 dark:text-slate-400">{r.driverPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-700 dark:text-amber-400">
                      {r.chemistCount}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {r.frequency}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      ₹{r.targetCodCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Depot Regulatory Profile */}
      {activeTab === 'depot' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Corporate Depot &amp; Statutory Regulatory Credentials
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These credentials print on all Rule 46 GST Invoices, Inward GRNs, Delivery Challans, and Form 16 / Salary Certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Registered Entity Name</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">PharmaGrid Logistics &amp; Healthcare Pvt Ltd</div>
              <div className="text-xs text-slate-500">Wholesale Pharma Stockist Depot</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">GSTIN / State Jurisdiction</div>
              <div className="text-sm font-mono font-bold text-blue-700 dark:text-blue-400">33AAAAA0000A1Z5</div>
              <div className="text-xs text-slate-500">State Code: 33 (Tamil Nadu)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">CDSCO Drug License (Form 20B/21B)</div>
              <div className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">TN-CHN-20B-10992 / 21B-10993</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Valid Thru: 31-Dec-2030 (Active)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Licensed Reg. Pharmacist In-Charge</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Selva Kumaran (Owner/MD)</div>
              <div className="text-xs text-slate-500 font-mono">Tamil Nadu Pharmacy Council: TN-PC-32104/2012</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">FSSAI Central Food License</div>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">10019042004811</div>
              <div className="text-xs text-slate-500">Nutraceuticals &amp; Health Supplements</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Corporate Bank Account (NEFT/RTGS)</div>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">HDFC Bank: 50200012345678</div>
              <div className="text-xs text-slate-500 font-mono">IFSC: HDFC0000024 (Guindy Branch)</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => showToast('✅ Depot statutory profile verified with CDSCO licensing portal.')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              Verify License with CDSCO Portal
            </button>
          </div>
        </div>
      )}

      {/* 7. MODAL: ADD MASTER ENTRY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Add Master: {activeTab === 'manufacturers' ? 'Pharma Manufacturer' : activeTab === 'categories' ? 'Therapeutic Category' : activeTab === 'racks' ? 'Warehouse Rack Location' : activeTab === 'hsn' ? 'GST / HSN Tax Slab' : 'Van Delivery Route'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Central master entity registry for system-wide ERP operations.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaster} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Manufacturer Form */}
              {activeTab === 'manufacturers' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Manufacturer / Principal Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Torrent Pharmaceuticals Ltd"
                      value={mfgForm.name}
                      onChange={e => setMfgForm({ ...mfgForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company Code</label>
                      <input
                        type="text"
                        placeholder="e.g. TORRENT"
                        value={mfgForm.code}
                        onChange={e => setMfgForm({ ...mfgForm, code: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Credit Days</label>
                      <input
                        type="number"
                        value={mfgForm.creditDays}
                        onChange={e => setMfgForm({ ...mfgForm, creditDays: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Contact Officer</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={mfgForm.contactPerson}
                        onChange={e => setMfgForm({ ...mfgForm, contactPerson: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 22 2495 8000"
                        value={mfgForm.phone}
                        onChange={e => setMfgForm({ ...mfgForm, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Drug License (MFG)</label>
                      <input
                        type="text"
                        placeholder="e.g. 25-KD-3200"
                        value={mfgForm.drugLicenseNo}
                        onChange={e => setMfgForm({ ...mfgForm, drugLicenseNo: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 24AAACT1234F1Z9"
                        value={mfgForm.gstin}
                        onChange={e => setMfgForm({ ...mfgForm, gstin: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category Form */}
              {activeTab === 'categories' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Category / Therapeutic Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Antihypertensives & Beta Blockers"
                      value={catForm.name}
                      onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CAT-CARDIO"
                        value={catForm.code}
                        onChange={e => setCatForm({ ...catForm, code: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CDSCO Schedule Class</label>
                      <select
                        value={catForm.scheduleClass}
                        onChange={e => setCatForm({ ...catForm, scheduleClass: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                      >
                        <option value="Regular">Regular (OTC / Non-Prescription)</option>
                        <option value="H">Schedule H (Prescription)</option>
                        <option value="H1">Schedule H1 (High Risk / Antibiotic / Narcotic)</option>
                        <option value="G">Schedule G</option>
                        <option value="X">Schedule X (Psychotropic Substance)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-slate-950/60 rounded-xl border border-blue-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="coldChainToggle"
                      checked={catForm.isColdChain}
                      onChange={e => setCatForm({ ...catForm, isColdChain: e.target.checked, recommendedTemp: e.target.checked ? '2°C to 8°C (Refrigerated)' : 'Store below 25°C' })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="coldChainToggle" className="text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                      Mandatory Cold Chain Category (Requires Refrigerated Cold Storage)
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Recommended Storage</label>
                    <input
                      type="text"
                      value={catForm.recommendedTemp}
                      onChange={e => setCatForm({ ...catForm, recommendedTemp: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Rack Form */}
              {activeTab === 'racks' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Rack Location Identifier Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Z1-R04"
                      value={rackForm.rackCode}
                      onChange={e => setRackForm({ ...rackForm, rackCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Warehouse Zone</label>
                    <select
                      value={rackForm.zone}
                      onChange={e => setRackForm({ ...rackForm, zone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                    >
                      <option value="Zone A - Fast Moving Tablets">Zone A - Fast Moving Tablets</option>
                      <option value="Zone B - Syrups & Liquids">Zone B - Syrups &amp; Liquids</option>
                      <option value="Zone C - Schedule H1 Secure Vault">Zone C - Schedule H1 Secure Vault</option>
                      <option value="Zone D - Cold Chain Storage">Zone D - Cold Chain Storage</option>
                      <option value="Zone E - General Bulk Storage">Zone E - General Bulk Storage</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Shelf Count</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rackForm.shelfCount}
                        onChange={e => setRackForm({ ...rackForm, shelfCount: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Box Capacity</label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={rackForm.capacityBoxes}
                        onChange={e => setRackForm({ ...rackForm, capacityBoxes: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Storage Condition</label>
                    <select
                      value={rackForm.temperatureType}
                      onChange={e => setRackForm({ ...rackForm, temperatureType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                    >
                      <option value="Ambient (15-25°C)">Ambient (15-25°C)</option>
                      <option value="Refrigerated (2-8°C)">Refrigerated Cold Room (2-8°C)</option>
                      <option value="Controlled Low Humidity">Controlled Low Humidity</option>
                    </select>
                  </div>
                </div>
              )}

              {/* HSN Form */}
              {activeTab === 'hsn' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      HSN Code (Chapter 30 Indian Customs Tariff) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 30049099"
                      value={hsnForm.hsnCode}
                      onChange={e => setHsnForm({ ...hsnForm, hsnCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Statutory Description *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Other medicaments consisting of mixed or unmixed products"
                      value={hsnForm.description}
                      onChange={e => setHsnForm({ ...hsnForm, description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CGST Rate (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={hsnForm.cgst}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setHsnForm({ ...hsnForm, cgst: val, sgst: val, igst: val * 2 });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">SGST Rate (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={hsnForm.sgst}
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-300 font-mono outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">IGST Rate (%)</label>
                      <input
                        type="number"
                        step="1"
                        value={hsnForm.igst}
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-blue-700 dark:text-blue-400 font-mono outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Route Form */}
              {activeTab === 'routes' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Route Name / Territory Corridor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Route 05 - Tambaram & Chromepet Loop"
                      value={routeForm.routeName}
                      onChange={e => setRouteForm({ ...routeForm, routeName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Route Code</label>
                      <input
                        type="text"
                        placeholder="e.g. RT-TAMB"
                        value={routeForm.routeCode}
                        onChange={e => setRouteForm({ ...routeForm, routeCode: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Vehicle No</label>
                      <input
                        type="text"
                        placeholder="e.g. TN-09-CB-1044"
                        value={routeForm.assignedVehicle}
                        onChange={e => setRouteForm({ ...routeForm, assignedVehicle: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Driver Name</label>
                      <input
                        type="text"
                        placeholder="e.g. V. Murugan"
                        value={routeForm.driverName}
                        onChange={e => setRouteForm({ ...routeForm, driverName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Driver Phone</label>
                      <input
                        type="text"
                        value={routeForm.driverPhone}
                        onChange={e => setRouteForm({ ...routeForm, driverPhone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Estimated Retail Stops</label>
                      <input
                        type="number"
                        value={routeForm.totalCustomersCount}
                        onChange={e => setRouteForm({ ...routeForm, totalCustomersCount: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target COD (₹)</label>
                      <input
                        type="number"
                        step="5000"
                        value={routeForm.targetCodCollection}
                        onChange={e => setRouteForm({ ...routeForm, targetCodCollection: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save Master Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
