'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  LayoutDashboard,
  Package,
  Boxes,
  FileInput,
  Users,
  Tag,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Flame,
  Lock,
  UserCog,
  ShoppingCart,
  Truck,
  TrendingUp,
  IndianRupee,
  Layers
} from 'lucide-react';

export type AppModuleId =
  | 'billing'
  | 'dashboard'
  | 'orders'
  | 'procurement'
  | 'logistics'
  | 'products'
  | 'stockmaster'
  | 'inventory'
  | 'demandforecast'
  | 'customers'
  | 'schemes'
  | 'audit'
  | 'payroll'
  | 'users';

interface SidebarProps {
  activeModule: AppModuleId;
  setActiveModule: (module: AppModuleId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: AppModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'cyan' | 'amber' | 'rose' | 'emerald';
  shortcut?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const { user, hasPermission } = useAuth();

  const navSections: NavSection[] = [
    {
      title: 'Core Operations',
      items: [
        {
          id: 'billing',
          label: 'Rapid Counter Billing',
          icon: Zap,
          shortcut: 'F1-F8',
          badge: 'Fast',
          badgeColor: 'cyan',
        },
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'orders',
          label: 'Orders & Indents (PO/SO)',
          icon: ShoppingCart,
          badge: 'B2B',
          badgeColor: 'cyan',
        },
        {
          id: 'procurement',
          label: 'Inward GRN Ingestion',
          icon: FileInput,
        },
        {
          id: 'logistics',
          label: 'Shipment & Fleet (COD)',
          icon: Truck,
          badge: 'Live',
          badgeColor: 'emerald',
        },
      ],
    },
    {
      title: 'Inventory & Planning',
      items: [
        {
          id: 'stockmaster',
          label: 'Unified Stock Master',
          icon: Layers,
          badge: 'Audit',
          badgeColor: 'cyan',
        },
        {
          id: 'products',
          label: 'Master SKU Catalog',
          icon: Package,
          badge: '5 SKUs',
          badgeColor: 'emerald',
        },
        {
          id: 'inventory',
          label: 'Batch Rack Balances',
          icon: Boxes,
          badge: '23 Low',
          badgeColor: 'amber',
        },
        {
          id: 'demandforecast',
          label: 'Demand Forecast Radar',
          icon: TrendingUp,
          badge: 'AI Run',
          badgeColor: 'amber',
        },
        {
          id: 'schemes',
          label: 'Scheme & Deal Matrix',
          icon: Tag,
        },
      ],
    },
    {
      title: 'Network & Compliance',
      items: [
        {
          id: 'customers',
          label: 'Pharmacies & Chemists',
          icon: Users,
          badge: 'DL Valid',
          badgeColor: 'emerald',
        },
        {
          id: 'audit',
          label: 'CDSCO Regulatory Audit',
          icon: Shield,
        },
      ],
    },
    {
      title: 'Administration & Finance',
      items: [
        {
          id: 'payroll',
          label: 'Staff Payroll & Slips',
          icon: IndianRupee,
          badge: 'Pay',
          badgeColor: 'emerald',
        },
        {
          id: 'users',
          label: 'Staff & Role Access',
          icon: UserCog,
          badge: 'RBAC',
          badgeColor: 'cyan',
        },
      ],
    },
  ];

  return (
    <aside
      className={`border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1c] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* 1. TOP NAV ITEMS */}
      <div className="flex flex-col gap-6 py-4 px-3 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-1.5">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
            )}

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isPermitted = hasPermission(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={isCollapsed ? item.label : (!isPermitted ? `Restricted for ${user.roleName}` : undefined)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                    isActive
                      ? 'sidebar-active-item bg-blue-50/90 border border-blue-200/90 text-blue-700 font-bold shadow-xs dark:bg-slate-800 dark:border-blue-500/50 dark:text-blue-200'
                      : isPermitted
                      ? 'text-slate-600 hover:text-blue-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/80 border border-transparent'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-900/40 border border-transparent opacity-75'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between gap-1 overflow-hidden">
                      <span className="truncate">{item.label}</span>

                      {!isPermitted && (
                        <span title={`Restricted for ${user.roleName}`}>
                          <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        </span>
                      )}

                      {isPermitted && item.shortcut && (
                        <kbd
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                            isActive
                              ? 'bg-white text-blue-800 border-blue-200 shadow-2xs dark:bg-slate-900 dark:text-blue-200 dark:border-blue-700'
                              : 'bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-cyan-200 border-slate-200 dark:border-transparent'
                          }`}
                        >
                          {item.shortcut}
                        </kbd>
                      )}

                      {isPermitted && item.badge && !item.shortcut && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                            item.badgeColor === 'amber'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : item.badgeColor === 'cyan'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Bar on the left */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-blue-600 dark:bg-blue-400 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 2. FOOTER: COLLAPSE / EXPAND TOGGLE */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b16]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-850 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
