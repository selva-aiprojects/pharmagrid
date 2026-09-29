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
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: 'radial-gradient(ellipse 120% 60% at 50% -5%, #1a0f5c 0%, #08051e 45%, #07091a 100%)' }}>
      {/* 1. TOP STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-all" style={{ background: 'rgba(7,9,26,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: 'rgba(79,70,229,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' }}>
              Cloud ERP v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-[#a5b4fc] transition-colors">Core Modules</a>
            <a href="#comparison" className="hover:text-[#a5b4fc] transition-colors">Vs Marg &amp; C-Square</a>
            <a href="#compliance" className="hover:text-[#a5b4fc] transition-colors">CDSCO &amp; GST</a>
            <a href="#personas" className="hover:text-[#a5b4fc] transition-colors">Role Tour</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button onClick={onLaunchApp}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer transition-all relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 16px rgba(79,70,229,0.40)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #5b52f0 0%, #8948f5 100%)' }} />
              <span className="relative z-10">Launch Live ERP</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-14 pb-22 lg:pt-24 lg:pb-32 px-4 lg:px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Rich multi-color aurora background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-12%] left-[5%] w-[600px] h-[600px] rounded-full opacity-22" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(100px)' }} />
          <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-16" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(110px)' }} />
          <div className="absolute bottom-[-5%] left-[35%] w-[450px] h-[350px] rounded-full opacity-14" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(110px)' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Regulatory Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-7"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.30)', color: '#34d399' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CDSCO Drugs &amp; Cosmetics Act 1940 &bull; Form 20B/21B Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
            The High-Velocity Pharma Cloud ERP with{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Sub-2-Second Counter Billing
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Eliminate peak-hour billing queues, auto-split FEFO batches across multiple racks, prevent dead-stock with a 4-tier expiry radar, and guarantee 100% statutory Dual GST and CDSCO compliance.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button onClick={onLaunchApp}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-all relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 6px 28px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #5b52f0 0%, #8948f5 100%)' }} />
              <Zap className="w-4 h-4 fill-current relative z-10" />
              <span className="relative z-10">Launch Live ERP Workspace</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={onOpenLogin}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#c4c9f0', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
              <Users className="w-4 h-4" style={{ color: '#818cf8' }} />
              Sign In with Persona Demo
            </button>
          </div>

          {/* Live Engine Key Metrics */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left">
            {[
              { label: 'Checkout SLA', value: '18ms API', sub: 'Sub-2s checkout guarantee', clr: '#818cf8', glow: 'rgba(99,102,241,0.15)' },
              { label: 'Counter Usability', value: '100% Zero-Mouse', sub: 'Full F1 to F8 keyboard', clr: '#34d399', glow: 'rgba(16,185,129,0.12)' },
              { label: 'GST Engine', value: 'Dual Indian GST', sub: 'CGST/SGST vs IGST Slabs', clr: '#a78bfa', glow: 'rgba(124,58,237,0.12)' },
              { label: 'Cloud Database', value: 'Aiven PostgreSQL', sub: '28 Tables multi-tenant', clr: '#fbbf24', glow: 'rgba(245,158,11,0.12)' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 backdrop-blur-sm transition-all"
                style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid rgba(255,255,255,0.08)`, boxShadow: `0 4px 20px ${s.glow}` }}>
                <span className="text-[10px] uppercase font-bold block tracking-wider mb-1" style={{ color: 'rgba(176,183,216,1.0)' }}>{s.label}</span>
                <span className="text-lg font-extrabold font-mono block" style={{ color: s.clr }}>{s.value}</span>
                <span className="text-[11px] block mt-1" style={{ color: 'rgba(176,183,216,0.85)' }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMPETITIVE TEARDOWN (VS C-SQUARE & MARG ERP) */}
      <section id="comparison" className="py-16 px-4 lg:px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>Competitive Teardown</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Why Wholesale Stockists are Replacing Legacy Marg &amp; C-Square
            </h2>
            <p className="text-xs sm:text-sm text-[#b0b7d8] mt-2">
              Legacy Windows desktop systems slow down counter dispatch with split modal errors, corruptible local DB files, and blind expiry losses.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="text-[10px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="py-3.5 px-4" style={{ color: 'rgba(200,207,232,0.95)' }}>Capability &amp; Workload</th>
                  <th className="py-3.5 px-4 font-black" style={{ color: '#818cf8', background: 'rgba(79,70,229,0.10)', borderLeft: '1px solid rgba(99,102,241,0.25)', borderRight: '1px solid rgba(99,102,241,0.25)' }}>PharmaGrid™ Cloud ERP</th>
                  <th className="py-3.5 px-4" style={{ color: 'rgba(176,183,216,0.78)' }}>C-Square (Pharmasoft / EcoGreen)</th>
                  <th className="py-3.5 px-4" style={{ color: 'rgba(176,183,216,0.78)' }}>Marg ERP 9+ Desktop</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm font-medium" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {[
                  ['Counter Checkout Speed', '< 2.0 Seconds (Benchmark: 18ms)', '45–90 Seconds per bill', '60–120 Seconds per bill'],
                  ['Batch Split Allocation', 'Automated Inline FEFO Split', 'Disruptive modal • Manual re-entry', 'Fails order • Manual line splitting'],
                  ['Database Reliability', 'Aiven PostgreSQL Cloud + RedLock', 'Local SQL Server • Prone to sync lag', 'Local flat file (.dbf) • Corrupts easily'],
                  ['Expiry Defense System', 'Proactive 4-Tier Radar (0-30d Quarantine)', 'Static end-of-month printed report', 'Reactive notification during sale'],
                  ['CDSCO Form 20B/21B Guard', 'Real-time Hard-Block on Expiry', 'Soft warning • Easily bypassed', 'Manual inspection required'],
                  ['Invoice Printing', 'Rule 46 A4 Tax Invoice + 80mm Thermal', 'Requires printer driver reconfig', 'Legacy dot-matrix ASCII only'],
                ].map(([cap, pg, cs, marg], i) => (
                  <tr key={i} style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-3 px-4 font-semibold text-white">{cap}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[13px]" style={{ color: '#818cf8', background: 'rgba(79,70,229,0.07)', borderLeft: '1px solid rgba(99,102,241,0.15)', borderRight: '1px solid rgba(99,102,241,0.15)' }}>{pg}</td>
                    <td className="py-3 px-4" style={{ color: 'rgba(176,183,216,1.0)' }}>{cs}</td>
                    <td className="py-3 px-4" style={{ color: 'rgba(176,183,216,0.78)' }}>{marg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURE PILLARS */}
      <section id="features" className="py-16 px-4 lg:px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>Enterprise Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              The 6 Specialized Engines of PharmaGrid™
            </h2>
            <p className="text-xs sm:text-sm text-[#b0b7d8] mt-2">
              Every engine is built to solve the real operational challenges of Indian pharmaceutical supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, label: 'Rapid Counter Billing POS', desc: '100% Zero-Mouse keyboard shortcuts (F1–F8). Instant chemist credit limit verification and sub-2-second checkout.', footer: 'Atomic Redis Distributed Locks', clr: '#818cf8', glow: 'rgba(99,102,241,0.18)', bg: 'rgba(79,70,229,0.10)', bdr: 'rgba(79,70,229,0.22)' },
              { icon: Boxes, label: 'FEFO Batch & Rack Allocator', desc: 'Algorithmic First-Expiry-First-Out engine. Automatically splits orders across physical racks (Z1-R02-S03-B01).', footer: 'Cold Chain 2-8°C Tracking', clr: '#34d399', glow: 'rgba(16,185,129,0.18)', bg: 'rgba(16,185,129,0.10)', bdr: 'rgba(16,185,129,0.22)' },
              { icon: FileText, label: 'Statutory Rule 46 GST Invoice', desc: 'Dual GST engine (CGST+SGST for TN-33, IGST for interstate). Bank details and Indian Rupee word translation.', footer: 'A4 & Thermal Print Engines', clr: '#a78bfa', glow: 'rgba(124,58,237,0.18)', bg: 'rgba(124,58,237,0.10)', bdr: 'rgba(124,58,237,0.22)' },
              { icon: Clock, label: '4-Tier Expiry Defense Radar', desc: 'Classifies inventory into 4 active risk horizons: 0-30d Quarantine, 31-60d Supplier Return, 61-90d Promo Clearance.', footer: 'Automated Supplier Debit Proposals', clr: '#fbbf24', glow: 'rgba(245,158,11,0.18)', bg: 'rgba(245,158,11,0.08)', bdr: 'rgba(245,158,11,0.22)' },
              { icon: FileInput, label: 'Procurement & Inward GRN', desc: 'Inward physical batch entry with strict EXP > MFG validation, bonus scheme units (10+1 free), and supplier ledger updates.', footer: 'Printable Goods Receipt Vouchers', clr: '#22d3ee', glow: 'rgba(6,182,212,0.18)', bg: 'rgba(6,182,212,0.08)', bdr: 'rgba(6,182,212,0.20)' },
              { icon: Award, label: 'CDSCO Pharmacist & Staff RBAC', desc: 'State Pharmacy Council registration tracking, Schedule H1 registers, granular counter discount caps, and immutable audit trails.', footer: 'Tamper-Proof Audit Trail', clr: '#f472b6', glow: 'rgba(236,72,153,0.18)', bg: 'rgba(236,72,153,0.08)', bdr: 'rgba(236,72,153,0.20)' },
            ].map(({ icon: Icon, label, desc, footer, clr, glow, bg, bdr }, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col justify-between transition-all group cursor-default"
                style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)`, border: `1px solid ${bdr}`, boxShadow: `0 4px 20px ${glow}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 36px ${glow}, 0 0 0 1px ${clr}40`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${glow}`; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: bg, border: `1px solid ${bdr}` }}>
                    <Icon className="w-5 h-5" style={{ color: clr }} />
                  </div>
                  <h3 className="font-bold text-white text-base">{label}</h3>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(200,207,232,0.90)' }}>{desc}</p>
                </div>
                <div className="mt-5 pt-3 flex items-center justify-between text-[11px] font-semibold" style={{ borderTop: `1px solid ${bdr}`, color: clr }}>
                  <span>{footer}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PERSONA TEST DRIVE */}
      <section id="personas" className="py-16 px-4 lg:px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>Interactive 1-Click Tour</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Experience PharmaGrid Through Any Persona
            </h2>
            <p className="text-xs sm:text-sm text-[#b0b7d8] mt-2">
              Click any staff profile to test drive the tailored role experience in the live ERP:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { username: 'admin',     initials: 'SK', name: 'Selva Kumaran',  role: 'Owner',     label: 'Enter as Owner',     desc: 'Managing Director • Full P&L oversight, working capital & all 9 modules.', clr: '#a78bfa', bg: 'rgba(124,58,237,0.10)', bdr: 'rgba(124,58,237,0.22)', tag: 'rgba(124,58,237,0.28)', tagTxt: '#c4b5fd' },
              { username: 'billing',   initials: 'SB', name: 'Suresh Babu',    role: 'Billing',   label: 'Enter as Billing',   desc: 'Counter Billing Lead • Zero-mouse F1-F8 shortcuts, chemist credit & deals.', clr: '#22d3ee', bg: 'rgba(6,182,212,0.08)', bdr: 'rgba(6,182,212,0.20)', tag: 'rgba(6,182,212,0.25)', tagTxt: '#67e8f9' },
              { username: 'warehouse', initials: 'KR', name: 'Karthik Raja',   role: 'Warehouse', label: 'Enter as Warehouse', desc: 'Warehouse Lead • Cold chain put-away, inward GRN & batch rack balances.', clr: '#34d399', bg: 'rgba(16,185,129,0.08)', bdr: 'rgba(16,185,129,0.20)', tag: 'rgba(16,185,129,0.25)', tagTxt: '#6ee7b7' },
              { username: 'accounts',  initials: 'MS', name: 'Meena Sundaram', role: 'Accounts',  label: 'Enter as Accounts',  desc: 'Finance Controller • Dual GST tax reconciliation, supplier daybook & audit.', clr: '#818cf8', bg: 'rgba(79,70,229,0.10)', bdr: 'rgba(79,70,229,0.22)', tag: 'rgba(79,70,229,0.28)', tagTxt: '#a5b4fc' },
            ].map(({ username, initials, name, role, label, desc, clr, bg, bdr, tag, tagTxt }) => (
              <div key={username} onClick={() => onSelectPersonaLaunch(username)}
                className="rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
                style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)`, border: `1px solid ${bdr}` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 32px ${clr}25`; el.style.borderColor = clr; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = bdr; el.style.transform = 'none'; }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ background: `linear-gradient(135deg, ${clr}30 0%, ${clr}15 100%)`, border: `1px solid ${clr}40`, color: clr }}>{initials}</span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: tag, color: tagTxt, border: `1px solid ${clr}50` }}>{role}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm transition-colors" style={{ '--hover-clr': clr } as any}>{name}</h4>
                  <p className="text-[11px] mt-1.5" style={{ color: 'rgba(200,207,232,0.88)' }}>{desc}</p>
                </div>
                <div className="mt-5 pt-3 flex items-center justify-between text-xs font-bold" style={{ borderTop: `1px solid ${bdr}`, color: clr }}>
                  <span>{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <footer className="py-12 px-4 lg:px-8 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,9,26,0.95)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={26} />
            <span style={{ color: 'rgba(160,170,200,0.90)' }}>&copy; 2026 Cognivectra PharmaGrid™. Built for Indian Pharmaceutical Distribution.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-lg font-bold cursor-pointer transition-all relative overflow-hidden group text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 16px rgba(79,70,229,0.40)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #5b52f0 0%, #8948f5 100%)' }} />
              <span className="relative z-10">Launch Live ERP Workspace</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
