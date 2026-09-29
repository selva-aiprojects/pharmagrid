'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  Sparkles,
  Command,
  Flame,
  Lock,
  UserCog,
  ShoppingCart,
  Truck,
  TrendingUp,
  IndianRupee,
  Layers,
  Database,
  SlidersHorizontal,
  ChevronsUpDown
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
  | 'users'
  | 'masters';

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

  // Collapsible section state (default all open)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const expandAll = () => setCollapsedSections({});
  const collapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    navSections.forEach(s => {
      // Keep section containing active module open
      const hasActive = s.items.some(item => item.id === activeModule);
      if (!hasActive) {
        collapsed[s.title] = true;
      }
    });
    setCollapsedSections(collapsed);
  };

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
      title: 'Masters & Administration',
      items: [
        {
          id: 'masters',
          label: 'Central Masters Hub',
          icon: Database,
          badge: 'Setup',
          badgeColor: 'cyan',
        },
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

  const anyCollapsed = Object.values(collapsedSections).some(Boolean);

  return (
    <aside
      className={`border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1c] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* 1. TOP NAV ITEMS WITH VERTICAL SCROLLBAR */}
      <div className="flex-1 flex flex-col gap-5 py-3 px-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 pt-1 pb-0 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Navigation Modules</span>
            <button
              onClick={anyCollapsed ? expandAll : collapseAll}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5 normal-case"
              title={anyCollapsed ? 'Expand all sections' : 'Collapse all sections'}
            >
              <ChevronsUpDown className="w-3 h-3" />
              <span>{anyCollapsed ? 'Expand all' : 'Collapse'}</span>
            </button>
          </div>
        )}

        {navSections.map((section, sIdx) => {
          const isSectionCollapsed = !isCollapsed && !!collapsedSections[section.title];
          const hasActiveChild = section.items.some(item => item.id === activeModule);

          return (
            <div key={sIdx} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition group rounded cursor-pointer"
                  title="Click to collapse or expand section"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {hasActiveChild && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform duration-200 ${
                      isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>
              ) : null}

              {/* Items in Section */}
              {(!isSectionCollapsed || isCollapsed) && (
                <div className="flex flex-col gap-1">
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
              )}
            </div>
          );
        })}
      </div>

      {/* 2. FOOTER: COLLAPSE / EXPAND TOGGLE */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b16] shrink-0">
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
