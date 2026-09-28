import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  badge?: string;
}

export default function Logo({
  className = '',
  size = 34,
  showText = true,
  showTagline = true,
  tagline = 'Clinical Pharma ERP • CDSCO Compliant',
  badge = 'GRID™',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Clinical Royal Blue & Pharmacy Emerald Network Matrix SVG Mark */}
      <div
        className="relative flex items-center justify-center rounded-xl p-1 bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-700/50 shadow-xs dark:shadow-md group transition-all duration-300 hover:border-blue-500/80"
        style={{ width: size + 10, height: size + 10 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Primary Pharma Clinical Gradient: Deep Royal Blue -> Clinical Sapphire -> Pharmacy Emerald */}
            <linearGradient id="pharmaClinicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Subtle Clinical Matrix Grid Gradient */}
            <linearGradient id="gridMatrixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* 1. Precision Grid Coordinates (The "Grid" Matrix Framework) */}
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="18"
            fill="#F8FAFC"
            className="dark:fill-[#070E1E]"
            stroke="url(#pharmaClinicalGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* 4x4 Coordinate Matrix Gridlines */}
          <line x1="30" y1="8" x2="30" y2="92" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="50" y1="8" x2="50" y2="92" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.6" />
          <line x1="70" y1="8" x2="70" y2="92" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="8" y1="30" x2="92" y2="30" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="2,3" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.6" />
          <line x1="8" y1="70" x2="92" y2="70" stroke="url(#gridMatrixGrad)" strokeWidth="1" strokeDasharray="2,3" />

          {/* 2. Network Distribution Corner Pins & Circuit Paths */}
          <path d="M38 38 L24 24" stroke="#1E40AF" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.75" />
          <path d="M62 38 L76 24" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.75" />
          <path d="M38 62 L24 76" stroke="#047857" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.75" />
          <path d="M62 62 L76 76" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.75" />

          {/* Four Corner Depots (Distribution Grid Endpoints) */}
          <circle cx="24" cy="24" r="3" fill="#1D4ED8" />
          <circle cx="76" cy="24" r="3" fill="#3B82F6" />
          <circle cx="24" cy="76" r="3" fill="#047857" />
          <circle cx="76" cy="76" r="3" fill="#059669" />

          {/* 3. The Core Pharma Cross Matrix (Modular Grid Blocks) */}
          {/* Top Arm: Inward Inflow / Cold Chain */}
          <rect x="42" y="17" width="16" height="20" rx="4" fill="url(#pharmaClinicalGrad)" />

          {/* Bottom Arm: Dispatch & Logistics */}
          <rect x="42" y="63" width="16" height="20" rx="4" fill="url(#pharmaClinicalGrad)" />

          {/* Left Arm: Regulatory & CDSCO Compliance */}
          <rect x="17" y="42" width="20" height="16" rx="4" fill="url(#pharmaClinicalGrad)" />

          {/* Right Arm: Rapid Billing & FEFO Engine */}
          <rect x="63" y="42" width="20" height="16" rx="4" fill="url(#pharmaClinicalGrad)" />

          {/* 4. Central High-Speed Nexus Hub */}
          <rect
            x="39.5"
            y="39.5"
            width="21"
            height="21"
            rx="5"
            fill="#1E3A8A"
            stroke="url(#pharmaClinicalGrad)"
            strokeWidth="2.2"
          />

          {/* Active Core Diamond Node */}
          <polygon points="50,44.5 55.5,50 50,55.5 44.5,50" fill="#60A5FA" />
          <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" />
        </svg>

        {/* Ambient Subtle Glow */}
        <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/15 rounded-xl blur-xs -z-10 group-hover:bg-blue-500/15 transition-colors" />
      </div>

      {/* Brand Name & Aligned Product Identity */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center">
              Pharma
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 dark:from-blue-400 dark:via-sky-300 dark:to-emerald-400 bg-clip-text text-transparent ml-0.5">
                Grid
              </span>
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/50 shadow-xs">
                {badge}
              </span>
            )}
          </div>
          {showTagline && (
            <div className="text-[10px] tracking-wide text-slate-500 dark:text-slate-400 font-medium -mt-0.5 flex items-center gap-1.5">
              <span>{tagline}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-slate-400 dark:text-slate-500 font-mono">v1.0</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
