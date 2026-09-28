'use client';

import React, { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Award,
} from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
  onBackToLanding: () => void;
}

export default function LoginView({
  onSuccessLogin,
  onBackToLanding,
}: LoginViewProps) {
  const { login, switchPersona, personas } = useAuth();
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
    if (!username.trim()) {
      setErrorMsg('Please enter your staff username or email.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await login(username.trim(), password);
      if (ok) {
        onSuccessLogin();
      } else {
        setErrorMsg('Authentication failed. Please check your credentials or select a demo persona below.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = async (personaUsername: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await switchPersona(personaUsername);
      onSuccessLogin();
    } catch (err: any) {
      setErrorMsg('Failed to initialize persona session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-blue-500 selection:text-white">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Pitch</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>CDSCO 21 CFR Part 11 Compliant Terminal</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo size={40} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Staff Sign-In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Main Chennai Logistics Depot (TN-33) &bull; Cloud ERP v1.0
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Staff Username / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin or suresh.billing"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Terminal Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Counter Terminal</label>
                <select
                  value={terminal}
                  onChange={e => setTerminal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="Terminal-01 (Rapid POS)">Terminal-01 (Rapid POS)</option>
                  <option value="Terminal-02 (Counter Cashier)">Terminal-02 (Counter)</option>
                  <option value="Inward Dock #2">Inward Dock #2</option>
                  <option value="Admin Suite">Admin Suite</option>
                </select>
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={e => setRememberTerminal(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0"
                  />
                  <span>Remember Counter</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Authenticating Terminal...' : 'Sign In to Terminal'}</span>
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center mb-3">
              Or Sign In with 1-Click Demo Persona:
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPersona('admin')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-purple-300">Selva Kumaran</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">Owner</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Full ERP &amp; P&amp;L</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('billing')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-cyan-300">Suresh Babu</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300">Billing</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Counter POS Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('warehouse')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-emerald-300">Karthik Raja</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">Warehouse</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">FEFO &amp; Inward GRN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('accounts')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-indigo-300">Meena Sundaram</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300">Accounts</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Dual GST &amp; Ledgers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Compliance Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] text-slate-500 space-y-1">
        <p>Protected by 256-Bit TLS Encryption &bull; Aiven Cloud Multi-Tenant Query Filter</p>
        <p>CDSCO Registered Form 20B/21B Wholesale License Verification Active</p>
      </div>
    </div>
  );
}
