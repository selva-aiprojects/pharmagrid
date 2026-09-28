'use client';

import React from 'react';
import Logo from '@/components/Logo';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  Clock,
  Building,
  TrendingUp,
  BarChart3,
  Layers,
  Award,
  FileText,
  Check,
  ExternalLink,
  ChevronRight,
  Boxes,
  Users,
  ShieldAlert,
  Printer,
  FileInput,
  Tag,
  Flame,
  LogIn,
} from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp: () => void;
  onOpenLogin: () => void;
  onSelectPersonaLaunch: (username: string) => void;
}

export default function LandingPageView({
  onLaunchApp,
  onOpenLogin,
  onSelectPersonaLaunch,
}: LandingPageViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 1. TOP STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-cyan-400 border border-cyan-500/30">
              Cloud ERP v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Core Modules</a>
            <a href="#comparison" className="hover:text-cyan-400 transition-colors">Vs Marg &amp; C-Square</a>
            <a href="#compliance" className="hover:text-cyan-400 transition-colors">CDSCO &amp; GST</a>
            <a href="#personas" className="hover:text-cyan-400 transition-colors">Role Tour</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>Launch Live ERP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 lg:px-8 border-b border-slate-800/80">
        {/* Glowing background ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Regulatory Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-6 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>CDSCO Drugs &amp; Cosmetics Act 1940 &bull; Form 20B/21B Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            The High-Velocity Pharma Cloud ERP with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Sub-2-Second Counter Billing
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Eliminate peak-hour billing queues, auto-split FEFO batches across multiple racks, prevent dead-stock with a 4-tier expiry radar, and guarantee 100% statutory Dual GST and CDSCO compliance.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Live ERP Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Sign In with Persona Demo</span>
            </button>
          </div>

          {/* Live Engine Key Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Checkout SLA</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">18ms API Latency</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Sub-2s checkout guarantee</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Counter Usability</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">100% Zero-Mouse</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Full F1 to F8 keyboard flow</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">GST Engine</span>
              <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">Dual Indian GST</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">CGST/SGST vs IGST Slabs</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Cloud Database</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">Aiven PostgreSQL</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">28 Tables live multi-tenant</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPETITIVE TEARDOWN (VS C-SQUARE & MARG ERP) */}
      <section id="comparison" className="py-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">Competitive Teardown</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Why Wholesale Stockists are Replacing Legacy Marg &amp; C-Square
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Legacy Windows desktop systems slow down counter dispatch with split modal errors, corruptible local DB files, and blind expiry losses.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Capability &amp; Workload</th>
                  <th className="py-3.5 px-4 text-cyan-400 font-bold bg-cyan-950/30 border-x border-cyan-800/50">
                    PharmaGrid™ Cloud ERP
                  </th>
                  <th className="py-3.5 px-4 text-slate-400">C-Square (Pharmasoft / EcoGreen)</th>
                  <th className="py-3.5 px-4 text-slate-400">Marg ERP 9+ Desktop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Counter Checkout Speed</td>
                  <td className="py-3 px-4 text-cyan-300 font-mono font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    &lt; 2.0 Seconds (Benchmark: 18ms)
                  </td>
                  <td className="py-3 px-4 text-slate-400">45 – 90 Seconds per bill</td>
                  <td className="py-3 px-4 text-slate-400">60 – 120 Seconds per bill</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Batch Split Allocation</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    Automated Inline FEFO Split
                  </td>
                  <td className="py-3 px-4 text-rose-400">Disruptive modal &bull; Manual re-entry</td>
                  <td className="py-3 px-4 text-rose-400">Fails order &bull; Manual line splitting</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Database Reliability</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    Aiven PostgreSQL Cloud + RedLock
                  </td>
                  <td className="py-3 px-4 text-slate-400">Local SQL Server &bull; Prone to sync lag</td>
                  <td className="py-3 px-4 text-rose-400">Local flat file (.dbf) &bull; Corrupts easily</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Expiry Defense System</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    Proactive 4-Tier Radar (0-30d Quarantine)
                  </td>
                  <td className="py-3 px-4 text-slate-400">Static end-of-month printed report</td>
                  <td className="py-3 px-4 text-slate-400">Reactive notification during sale</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">CDSCO Form 20B/21B Guard</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    Real-time Hard-Block on Expiry
                  </td>
                  <td className="py-3 px-4 text-slate-400">Soft warning &bull; Easily bypassed</td>
                  <td className="py-3 px-4 text-slate-400">Manual inspection required</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Invoice Printing</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold bg-cyan-950/20 border-x border-cyan-800/40">
                    Rule 46 A4 Tax Invoice + 80mm Thermal
                  </td>
                  <td className="py-3 px-4 text-slate-400">Requires printer driver reconfig</td>
                  <td className="py-3 px-4 text-slate-400">Legacy dot-matrix ASCII only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURE PILLARS */}
      <section id="features" className="py-16 px-4 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">Enterprise Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              The 6 Specialized Engines of PharmaGrid™
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every engine is built to solve the real operational challenges of Indian pharmaceutical supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Pillar 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Rapid Counter Billing POS</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  100% Zero-Mouse keyboard shortcuts (<kbd className="font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700">F1-F8</kbd>). Instant chemist credit limit verification and sub-2-second checkout.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                <span>Atomic Redis Distributed Locks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">FEFO Batch &amp; Rack Allocator</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Algorithmic First-Expiry-First-Out engine with 60-day buffer safeguard. Automatically splits orders across physical racks (<code className="font-mono text-[10px] text-slate-300">Z1-R02-S03-B01</code>).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Cold Chain 2-8°C Tracking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Statutory Rule 46 GST Invoice</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Dual GST engine (CGST+SGST for 33-Tamil Nadu, IGST for interstate). CDSCO Section 18 declaration, bank details, and Indian Rupee word translation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                <span>A4 &amp; Thermal Print Engines</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">4-Tier Expiry Defense Radar</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Classifies inventory into 4 active risk horizons: 0-30d Quarantine, 31-60d Supplier Return Debit, 61-90d Promo Clearance, and 91+d Safe Rotation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                <span>Automated Supplier Debit Proposals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <FileInput className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Procurement &amp; Inward GRN</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Inward physical batch entry with strict <code className="font-mono text-[10px] text-slate-300">EXP &gt; MFG</code> validation, bonus scheme units (10+1 free), and supplier ledger balance updates.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                <span>Printable Goods Receipt Vouchers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">CDSCO Pharmacist &amp; Staff RBAC</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  State Pharmacy Council registration tracking, Schedule H1 registers, granular counter discount caps, and immutable 21 CFR Part 11 audit trails.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-purple-400 font-semibold">
                <span>Tamper-Proof Audit Trail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PERSONA TEST DRIVE */}
      <section id="personas" className="py-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">Interactive 1-Click Tour</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Experience PharmaGrid Through Any Persona
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Click any staff profile to test drive the tailored role experience in the live ERP:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Persona 1: Owner */}
            <div
              onClick={() => onSelectPersonaLaunch('admin')}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-4.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-xs">
                    SK
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    Owner
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">Selva Kumaran</h4>
                <p className="text-[11px] text-slate-400 mt-1">Managing Director &bull; Full P&amp;L oversight, working capital &amp; all 9 modules.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>Enter as Owner</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 2: Billing */}
            <div
              onClick={() => onSelectPersonaLaunch('billing')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-4.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs">
                    SB
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Billing
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">Suresh Babu</h4>
                <p className="text-[11px] text-slate-400 mt-1">Counter Billing Lead &bull; Zero-mouse F1-F8 shortcuts, chemist credit &amp; deals.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Enter as Billing</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 3: Warehouse */}
            <div
              onClick={() => onSelectPersonaLaunch('warehouse')}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                    KR
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Warehouse
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">Karthik Raja</h4>
                <p className="text-[11px] text-slate-400 mt-1">Warehouse Lead &bull; Cold chain put-away, inward GRN &amp; batch rack balances.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Enter as Warehouse</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 4: Accounts */}
            <div
              onClick={() => onSelectPersonaLaunch('accounts')}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-4.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    MS
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Accounts
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">Meena Sundaram</h4>
                <p className="text-[11px] text-slate-400 mt-1">Finance Controller &bull; Dual GST tax reconciliation, supplier daybook &amp; audit.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span>Enter as Accounts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <footer className="py-12 px-4 lg:px-8 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={26} />
            <span>&copy; 2026 Cognivectra PharmaGrid™. Built for Indian Pharmaceutical Distribution.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer transition-colors shadow-md"
            >
              Launch Live ERP Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
