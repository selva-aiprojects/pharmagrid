'use client';

import React, { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, Zap, ArrowRight, ArrowLeft,
  AlertCircle, Eye, EyeOff, User, KeyRound,
} from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
  onBackToLanding: () => void;
}

export default function LoginView({ onSuccessLogin, onBackToLanding }: LoginViewProps) {
  const { login, switchPersona } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [terminal, setTerminal] = useState('Terminal-01 (Rapid POS)');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username.trim()) { setErrorMsg('Please enter your staff username or email.'); return; }
    setIsLoading(true);
    try {
      const ok = await login(username.trim(), password);
      if (ok) { onSuccessLogin(); } else {
        setErrorMsg('Authentication failed. Please check your credentials or select a demo persona below.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error during login.');
    } finally { setIsLoading(false); }
  };

  const handleQuickPersona = async (personaUsername: string) => {
    setIsLoading(true); setErrorMsg(null);
    try { await switchPersona(personaUsername); onSuccessLogin(); }
    catch { setErrorMsg('Failed to initialize persona session.'); }
    finally { setIsLoading(false); }
  };

  const PERSONAS = [
    { username: 'admin',     name: 'Selva Kumaran', role: 'Owner',     desc: 'Full ERP & P&L Access',  clr: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.28)',  tag: 'rgba(124,58,237,0.30)',  tagTxt: '#c4b5fd' },
    { username: 'billing',   name: 'Suresh Babu',   role: 'Billing',   desc: 'Counter POS Lead',        clr: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.25)',   tag: 'rgba(6,182,212,0.28)',   tagTxt: '#67e8f9' },
    { username: 'warehouse', name: 'Karthik Raja',  role: 'Warehouse', desc: 'FEFO & Inward GRN',      clr: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  tag: 'rgba(16,185,129,0.28)',  tagTxt: '#6ee7b7' },
    { username: 'accounts',  name: 'Meena Sundaram',role: 'Accounts',  desc: 'Dual GST & Ledgers',     clr: '#6366f1', bg: 'rgba(79,70,229,0.12)',   border: 'rgba(79,70,229,0.28)',   tag: 'rgba(79,70,229,0.30)',   tagTxt: '#a5b4fc' },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 130% 90% at 50% -20%, #1e1060 0%, #0a0521 40%, #07091a 100%)' }}>

      {/* Aurora orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-8%] left-[5%] w-[520px] h-[520px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute top-[25%] right-[-8%] w-[420px] h-[420px] rounded-full opacity-18" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[8%] left-[15%] w-[380px] h-[320px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute top-[55%] left-[58%] w-[300px] h-[300px] rounded-full opacity-12" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      </div>

      {/* Top nav */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 relative">
        <button onClick={onBackToLanding}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Product Showcase
        </button>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.28)' }}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">CDSCO 21 CFR Part 11 Compliant</span>
        </div>
      </div>

      {/* Login card */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        {/* Glow border */}
        <div className="absolute -inset-[1px] rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(124,58,237,0.35) 50%, rgba(6,182,212,0.35) 100%)' }} />
        <div className="relative rounded-3xl overflow-hidden" style={{ background: 'rgba(10,5,33,0.94)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Brand bar */}
          <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 45%, #06b6d4 100%)' }} />
          <div className="p-6 sm:p-8">
            {/* Logo */}
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <div className="relative p-2 rounded-2xl" style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <Logo size={40} />
                </div>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(135deg, #e8eaff 0%, #c4b5fd 55%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Enterprise Staff Sign-In
              </h2>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(200,207,232,0.88)' }}>Main Chennai Logistics Depot (TN-33) &bull; Cloud ERP v1.0</p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.28)', color: '#fda4af' }}>
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Username */}
              <div>
                <label htmlFor="login-username" className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'rgba(200,207,232,0.95)' }}>Staff Username / ID</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3.5 top-3" style={{ color: 'rgba(129,140,248,0.65)' }} />
                  <input id="login-username" type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}
                    aria-label="Staff username or ID"
                    placeholder="e.g. admin or suresh.billing"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl font-mono text-xs transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.22)', color: '#e8eaff', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(129,140,248,0.60)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.22)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'rgba(200,207,232,0.95)' }}>Terminal Password</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3.5 top-3" style={{ color: 'rgba(129,140,248,0.65)' }} />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                    aria-label="Terminal password"
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl font-mono text-xs transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.22)', color: '#e8eaff', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(129,140,248,0.60)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.22)'; e.target.style.boxShadow = 'none'; }} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 transition-colors cursor-pointer" style={{ color: 'rgba(129,140,248,0.65)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terminal & Remember */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="login-terminal" className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'rgba(200,207,232,0.95)' }}>Counter Terminal</label>
                  <select id="login-terminal" aria-label="Select counter terminal" value={terminal} onChange={e => setTerminal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs cursor-pointer transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.18)', color: '#b0b7d8', outline: 'none' }}>
                    <option value="Terminal-01 (Rapid POS)" className="bg-[#111432] text-white">Terminal-01 (Rapid POS)</option>
                    <option value="Terminal-02 (Counter Cashier)" className="bg-[#111432] text-white">Terminal-02 (Counter)</option>
                    <option value="Inward Dock #2" className="bg-[#111432] text-white">Inward Dock #2</option>
                    <option value="Admin Suite" className="bg-[#111432] text-white">Admin Suite</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium" style={{ color: '#b0b7d8' }}>
                    <input type="checkbox" checked={rememberTerminal} onChange={e => setRememberTerminal(e.target.checked)} style={{ accentColor: '#6366f1' }} />
                    Remember Counter
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 relative overflow-hidden group mt-2"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #06b6d4 100%)', boxShadow: '0 4px 28px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #5b52f0 0%, #8948f5 55%, #22d3ee 100%)' }} />
                <Zap className={`w-4 h-4 fill-current relative z-10 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="relative z-10">{isLoading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>

            {/* Quick personas */}
            <div className="mt-7 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'rgba(176,183,216,0.78)' }}>1-Click Demo Access</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map(p => (
                  <button key={p.username} type="button" onClick={() => handleQuickPersona(p.username)}
                    className="p-3 rounded-xl text-left transition-all cursor-pointer"
                    style={{ background: p.bg, border: `1px solid ${p.border}` }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = p.clr; el.style.boxShadow = `0 0 16px ${p.clr}30`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = p.border; el.style.boxShadow = 'none'; }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{p.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: p.tag, color: p.tagTxt, border: `1px solid ${p.clr}50` }}>{p.role}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: 'rgba(190,198,228,0.88)' }}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center space-y-1 relative z-10">
        <p className="text-[10px]" style={{ color: 'rgba(160,172,210,0.90)' }}>🔒 256-Bit TLS Encryption &bull; Aiven Cloud Multi-Tenant Query Filter</p>
        <p className="text-[10px]" style={{ color: 'rgba(160,172,210,0.78)' }}>CDSCO Registered Form 20B/21B Wholesale License Verification Active</p>
      </div>
    </div>
  );
}
