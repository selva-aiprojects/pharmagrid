'use client';

import React, { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { AppModuleId } from '@/components/Sidebar';
import { pharmaApi } from '@/services/apiClient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Building2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown,
  Menu,
  ChevronRight,
  Sun,
  Moon,
  Users,
  Check,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeModule: AppModuleId;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onOpenLanding?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

const MODULE_TITLES: Record<AppModuleId, { title: string; subtitle: string }> = {
  billing: { title: 'Rapid Counter Billing', subtitle: '100% Zero-Mouse POS Invoicing (F1-F8)' },
  dashboard: { title: 'Executive Dashboard', subtitle: 'Real-Time Financial KPIs & Expiry Radar' },
  orders: { title: 'Orders & Indents', subtitle: 'Manufacturer Indents (PO) & Chemist Field Bookings (SO)' },
  procurement: { title: 'Inbound GRN', subtitle: 'Goods Receipt Note & Batch Date Ingestion' },
  logistics: { title: 'Shipment & Fleet', subtitle: 'Van Dispatch Manifests, COD Reconciliation & POD' },
  products: { title: 'Master SKU Catalog', subtitle: 'CDSCO Schedules H/H1/G & Cold-Chain Master' },
  stockmaster: { title: 'Unified Stock Master', subtitle: 'Consolidated SKU Inventory & CDSCO Breakage Register' },
  inventory: { title: 'Warehouse Balances', subtitle: 'Zone-Rack-Shelf-Bin Batch Allocations' },
  demandforecast: { title: 'Demand Forecast Radar', subtitle: '30-Day Sales Run Rate & Days of Inventory (DOI)' },
  customers: { title: 'Customer Registry', subtitle: 'Pharmacies, Form 20B/21B & Credit Limits' },
  schemes: { title: 'Scheme Engine', subtitle: 'Volumetric Bonus Deals & Rebate Claims' },
  audit: { title: 'Regulatory Audit', subtitle: 'Immutable Append-Only Compliance Trail' },
  payroll: { title: 'Staff Payroll & Slips', subtitle: 'Monthly Salary Disbursement & Statutory A4 Payslips' },
  users: { title: 'Staff & RBAC Management', subtitle: 'CDSCO Pharmacist Licensing & Counter Access' },
  masters: { title: 'Central Masters Management', subtitle: 'Pharma Companies, Racks, Categories & Statutory Profiles' },
};

export default function Header({
  activeModule,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onOpenLanding,
  onOpenLogin,
  onLogout,
}: HeaderProps) {
  const currentMeta = MODULE_TITLES[activeModule];
  const { theme, toggleTheme } = useTheme();
  const { user, personas, switchPersona, logout } = useAuth();
  const [latency, setLatency] = useState<number | null>(null);
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      const t0 = performance.now();
      try {
        const health = await pharmaApi.getHealth();
        const duration = Math.round(performance.now() - t0);
        if (isMounted) {
          setLatency(duration);
          setIsApiOnline(health.status === 'Healthy');
        }
      } catch {
        if (isMounted) setIsApiOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="app-header border-b border-slate-200 dark:border-white/6 bg-white/95 dark:bg-[#090e1c]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Brand / Active Module Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle sidebar navigation"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 text-slate-600 dark:text-[#adb5d4] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle Sidebar (Ctrl+B)"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Logo size={28} showText={true} showTagline={false} />

          {/* Module Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/8 text-xs">
            <span className="text-slate-400 dark:text-[#8892b0] font-medium">Module</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#6e7a9f]" />
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{currentMeta.title}</span>
            <span className="text-[11px] text-slate-500 dark:text-[#adb5d4] hidden xl:inline">({currentMeta.subtitle})</span>
          </div>
        </div>

        {/* Center: Live Alert Chips */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs">
          {/* Active Depot Chip */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 text-slate-700 dark:text-[#c2c8e8]">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-800 dark:text-white">Main Chennai Depot</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#070a1e] text-teal-700 dark:text-cyan-400 border border-slate-200 dark:border-white/8 font-medium">
              TN-33
            </span>
          </div>

          {/* Low Stock Alert Chip */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>23 Low Stock</span>
          </div>

          {/* Near-Expiry Horizon Chip */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-medium">
            <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>₹4.8L Expiring</span>
          </div>

          {/* CDSCO Regulatory License Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>DL 20B/21B Valid</span>
          </div>
        </div>

        {/* Right: Search, Latency SLA, Theme Toggle & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#070a1e]/90 border border-slate-200 dark:border-white/8 text-slate-500 dark:text-[#adb5d4] text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search SKU, Order...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#111535] border border-slate-200 dark:border-white/11 text-[10px] font-mono text-slate-600 dark:text-[#c2c8e8]">
              Ctrl+K
            </kbd>
          </div>

          {/* Live Engine Latency Benchmark Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 text-[11px] text-slate-600 dark:text-[#adb5d4] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
            />
            <span className={`font-semibold ${isApiOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {latency !== null ? `${latency}ms` : '18ms'}
            </span>
            <span className="text-slate-400 dark:text-[#8892b0]">.NET 9 API</span>
          </div>

          {/* Clinical Light / High-Tech Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/8 bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1130] dark:hover:bg-[#161940] text-slate-700 dark:text-[#c2c8e8] transition-colors text-xs font-medium cursor-pointer shadow-sm"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to Clinical Healthcare Light Theme' : 'Switch to High-Tech Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline text-[11px] font-semibold">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xl:inline text-[11px] font-semibold text-teal-700">Clinical Mode</span>
              </>
            )}
          </button>

          {/* Sales Pitch & Marketing Showcase Button */}
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              aria-label="View Sales Pitch and Product Showcase"
              title="View Sales Pitch & Product Showcase"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span className="hidden sm:inline">Sales Pitch</span>
            </button>
          )}

          {/* Interactive User Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={isPersonaMenuOpen}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/8 cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.fullName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <div className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#adb5d4] leading-tight">
                  {user.roleName}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Persona Switcher Menu */}
            {isPersonaMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPersonaMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 shadow-2xl z-50 p-2 text-xs">
                  {/* Current Active Account Card */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111535]/60 border border-slate-200 dark:border-white/11/60 mb-2">
                    <div className="text-[10px] text-slate-500 dark:text-[#adb5d4] font-medium">Active Account:</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{user.fullName}</div>
                    <div className="text-[11px] text-slate-600 dark:text-[#c2c8e8] font-mono mt-0.5">{user.email}</div>
                    <div className="mt-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                        Role: {user.roleName}
                      </span>
                    </div>
                  </div>

                  {/* Switch Persona Heading */}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8892b0] flex items-center gap-1">
                    <Users className="w-3 h-3" /> Switch Staff Persona:
                  </div>

                  <div className="space-y-1 mt-1">
                    {personas.map((persona) => {
                      const isSelected = user.username === persona.username;
                      return (
                        <button
                          key={persona.username}
                          onClick={async () => {
                            await switchPersona(persona.username);
                            setIsPersonaMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-[#161940]/80 text-slate-700 dark:text-[#c2c8e8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#111535] font-bold text-xs flex items-center justify-center text-slate-700 dark:text-[#d4d8f5] shrink-0">
                              {persona.avatarInitials}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-[#e8eaff] leading-tight">
                                {persona.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-[#adb5d4]">
                                {persona.roleName}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-slate-200 dark:border-white/8 mt-2 pt-1.5">
                    <button
                      onClick={() => {
                        if (onLogout) {
                          onLogout();
                        } else {
                          logout();
                          onOpenLogin?.();
                        }
                        setIsPersonaMenuOpen(false);
                      }}
                      aria-label="Sign out of current session"
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out / Terminal Switch
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

