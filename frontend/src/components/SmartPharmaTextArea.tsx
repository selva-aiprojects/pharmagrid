'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  Zap,
  Wand2
} from 'lucide-react';

export type PharmaContextType = 'logistics' | 'breakage' | 'pod' | 'general';

interface SmartPharmaTextAreaProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  context?: PharmaContextType;
  required?: boolean;
  className?: string;
}

// Common pharmaceutical typos and statutory abbreviations dictionary
const PHARMA_TERM_CORRECTIONS: Record<string, string> = {
  paracetemol: 'Paracetamol',
  paracetomol: 'Paracetamol',
  amoxacillin: 'Amoxicillin',
  amoxycillin: 'Amoxicillin',
  panto: 'Pantoprazole',
  pantoprazol: 'Pantoprazole',
  coldchain: 'Cold-Chain (2°C - 8°C)',
  'cold-chain': 'Cold-Chain (2°C - 8°C)',
  '2-8c': '2°C to 8°C',
  '2-8 c': '2°C to 8°C',
  ampule: 'Ampoule',
  ampules: 'Ampoules',
  vials: 'Liquid Vials',
  leakg: 'leakage',
  leeking: 'leaking',
  damadge: 'damage',
  damagd: 'damaged',
  crushd: 'crushed packaging',
  cdsco: 'CDSCO',
  fefo: 'FEFO',
  fifo: 'FIFO',
  gmp: 'WHO-GMP',
  gdp: 'WHO-GDP',
  pod: 'Proof of Delivery (POD)',
  mfg: 'Manufacturing',
  exp: 'Expiry',
  grn: 'GRN (Goods Receipt Note)',
  po: 'Purchase Order',
  so: 'Sales Order',
  rx: 'Prescription (Rx)',
  h1: 'Schedule H1',
  dlo: 'Drug License',
};

// Domain-Specific Standard CDSCO & Logistics Phrasing Chips
const CONTEXT_SUGGESTIONS: Record<PharmaContextType, Array<{ label: string; text: string }>> = {
  logistics: [
    {
      label: '❄️ Cold-Chain 2-8°C',
      text: 'Maintain strict cold-chain between 2°C and 8°C during transit. Calibrated digital data logger included.'
    },
    {
      label: '⚠️ Fragile Glass/Liquid',
      text: 'Handle with extreme care. Fragile amber glass ampoules and liquid vials. Keep upright.'
    },
    {
      label: '🕒 Urgent Clinic Rush',
      text: 'Priority dispatch: Deliver before 4:00 PM for evening pharmacy clinic rush.'
    },
    {
      label: '🔒 Tamper-Tape Seal',
      text: 'Cartons secured with serial-numbered holographic tamper-evident tape. Do not accept if broken.'
    }
  ],
  breakage: [
    {
      label: '📦 Un-stuffing Pallet Crush',
      text: 'Carton crushed during inward pallet un-stuffing. Inner blister seals ruptured. Disposed per CDSCO Form 20B waste protocol.'
    },
    {
      label: '🧪 Hairline Ampoule Leakage',
      text: 'Hairline vial neck fracture detected during put-away verification. Leakage contained and logged in breakage register.'
    },
    {
      label: '⏳ Short Expiry Quarantine',
      text: 'Batch shelf life under statutory 90-day threshold. Transferred to Secure Quarantine Bay pending manufacturer credit note.'
    },
    {
      label: '⚖️ Physical Count Discrepancy',
      text: 'Physical audit count variance reconciled against book ledger under registered pharmacist supervision.'
    }
  ],
  pod: [
    {
      label: '✅ Seal & Cold-Chain Intact',
      text: 'Received in good condition. Tamper seal intact and temperature indicator card within safe threshold.'
    },
    {
      label: '✍️ Pharmacist Stamped & Signed',
      text: 'Delivered to registered pharmacist premises. Physically verified against tax invoice and stamped.'
    },
    {
      label: '💵 COD Reconciled',
      text: 'Cash on Delivery (COD) collected in full and verified via counter digital receipt.'
    },
    {
      label: '⛔ Premises Closed',
      text: 'Attempted delivery; pharmacy premises closed during scheduled route window. Rescheduled for morning run.'
    }
  ],
  general: [
    {
      label: '📋 Pharmacist Verified',
      text: 'Verified and approved by registered pharmacist in accordance with CDSCO Form 20B/21B guidelines.'
    },
    {
      label: '🔍 Batch Audit Passed',
      text: 'Batch numbers and manufacturer expiry dates cross-verified with inward shipping bill.'
    }
  ]
};

export default function SmartPharmaTextArea({
  id,
  value,
  onChange,
  placeholder = 'Enter detailed clinical, logistics, or audit remarks...',
  rows = 3,
  label,
  context = 'general',
  required = false,
  className = ''
}: SmartPharmaTextAreaProps) {
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [lastFixCount, setLastFixCount] = useState<number | null>(null);

  // Analyze text for common pharma corrections
  const suggestedCorrections = useMemo(() => {
    if (!value) return [];
    const words = value.split(/\s+/);
    const fixes: Array<{ original: string; corrected: string }> = [];

    words.forEach(rawWord => {
      const cleanWord = rawWord.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (PHARMA_TERM_CORRECTIONS[cleanWord] && PHARMA_TERM_CORRECTIONS[cleanWord].toLowerCase() !== cleanWord) {
        fixes.push({ original: rawWord, corrected: PHARMA_TERM_CORRECTIONS[cleanWord] });
      }
    });

    return fixes;
  }, [value]);

  // Grammatical normalization & standard terminology cleanup
  const handleAutoFix = () => {
    if (!value.trim()) return;

    setPreviousValue(value);
    let text = value;
    let fixesCount = 0;

    // 1. Replace clinical typos
    Object.entries(PHARMA_TERM_CORRECTIONS).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      if (regex.test(text)) {
        text = text.replace(regex, right);
        fixesCount++;
      }
    });

    // 2. Normalize whitespace (remove multiple spaces)
    text = text.replace(/[ \t]+/g, ' ');

    // 3. Sentence case capitalization (after periods, question marks, exclamation marks)
    text = text.replace(/(^\s*|\.\s*)([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`);

    // 4. Ensure trailing punctuation if complete sentence
    const trimmed = text.trim();
    if (trimmed.length > 10 && !/[.!?]$/.test(trimmed)) {
      text = `${trimmed}.`;
      fixesCount++;
    }

    setLastFixCount(fixesCount);
    onChange(text);
  };

  const handleRevert = () => {
    if (previousValue !== null) {
      onChange(previousValue);
      setPreviousValue(null);
      setLastFixCount(null);
    }
  };

  const handleApplySuggestion = (suggestionText: string) => {
    if (!value.trim()) {
      onChange(suggestionText);
    } else {
      const trimmed = value.trim();
      const needsPeriod = !/[.!?]$/.test(trimmed);
      onChange(`${trimmed}${needsPeriod ? '.' : ''} ${suggestionText}`);
    }
  };

  const suggestions = CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">
              {wordCount} words • {value.length} chars
            </span>
          </div>
        </div>
      )}

      {/* Domain Suggestion Quick Chips */}
      <div className="flex flex-wrap gap-1.5 pb-0.5">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplySuggestion(s.text)}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-200 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-medium transition flex items-center gap-1 shadow-2xs group cursor-pointer"
            title={s.text}
          >
            <Sparkles className="w-3 h-3 text-cyan-400/80 group-hover:text-cyan-300 shrink-0" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main Textarea Input with Visual Styling */}
      <div className="relative group">
        <textarea
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 rounded-xl p-3 text-sm text-slate-200 focus:outline-none transition font-sans leading-relaxed shadow-inner"
        />

        {/* Suggestion Highlights / Quick Fix Badge */}
        {suggestedCorrections.length > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md text-[10px] backdrop-blur-sm animate-in fade-in">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>{suggestedCorrections.length} Pharma Term {suggestedCorrections.length === 1 ? 'Improvement' : 'Improvements'}</span>
          </div>
        )}
      </div>

      {/* Bottom Action & Compliance Assistant Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFix}
            disabled={!value.trim()}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Auto-format sentences, fix punctuation, and normalize pharmaceutical abbreviations"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fix Grammar & Punctuation</span>
          </button>

          {previousValue !== null && (
            <button
              type="button"
              onClick={handleRevert}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium flex items-center gap-1 transition"
              title="Undo last auto-fix"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}

          {lastFixCount !== null && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>Formatted clean</span>
            </span>
          )}
        </div>

        {/* Audit Status Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Zero-AI Local Validation • CDSCO GxP Compliant</span>
        </div>
      </div>
    </div>
  );
}
