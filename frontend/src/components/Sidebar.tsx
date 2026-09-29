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
      className={`app-sidebar border-r border-[#e2e5f0] dark:border-white/5 bg-white dark:bg-[#0b0e27] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* 1. TOP NAV ITEMS WITH VERTICAL SCROLLBAR */}
      <div className="flex-1 flex flex-col gap-5 py-3 px-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 pt-1 pb-0 text-[10px] font-semibold text-[#9ca3af] dark:text-[#44506a] uppercase tracking-wider">
            <span>Navigation Modules</span>
            <button
              onClick={anyCollapsed ? expandAll : collapseAll}
              className="text-[10px] text-[#4f46e5] dark:text-[#818cf8] hover:underline cursor-pointer flex items-center gap-0.5 normal-case font-bold"
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
                  className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] dark:text-[#44506a] hover:text-[#0f1629] dark:hover:text-[#e8eaff] transition group rounded cursor-pointer"
                  aria-label={`Toggle ${section.title} section`}
                  title="Click to collapse or expand section"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {hasActiveChild && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] dark:bg-[#818cf8] shrink-0" />
                    )}
                    {section.title}
                  </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#9ca3af] group-hover:text-[#2d3554] dark:group-hover:text-[#b0b7d8] transition-transform duration-200 ${
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
                            ? 'sidebar-active-item bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 font-bold dark:bg-[#161940]/60 dark:border-indigo-500/40 dark:text-indigo-200'
                            : isPermitted
                            ? 'text-[#6b7280] hover:text-[#0f1629] hover:bg-[#f4f5ff]/80 dark:text-[#6e7a9f] dark:hover:text-[#e8eaff] dark:hover:bg-[#161940]/50 border border-transparent'
                            : 'text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f8f9ff] dark:text-[#44506a] dark:hover:text-[#6e7a9f] dark:hover:bg-[#111432]/60 border border-transparent opacity-75'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-[#9ca3af] group-hover:text-[#4f46e5] dark:group-hover:text-[#818cf8]'
                          }`}
                        />

                        {!isCollapsed && (
                          <div className="flex-1 text-left flex items-center justify-between gap-1 overflow-hidden">
                            <span className="truncate">{item.label}</span>

                            {!isPermitted && (
                              <span title={`Restricted for ${user.roleName}`}>
                                <Lock className="w-3 h-3 text-slate-400 dark:text-[#8892b0]" />
                              </span>
                            )}

                            {isPermitted && item.shortcut && (
                              <kbd
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                                  isActive
                                    ? 'bg-white text-indigo-700 border-indigo-200 shadow-2xs dark:bg-[#111432] dark:text-indigo-200 dark:border-indigo-700'
                                    : 'bg-[#f4f5ff] dark:bg-black/40 text-[#6b7280] dark:text-[#818cf8] border-[#e2e5f0] dark:border-transparent'
                                }`}
                              >
                                {item.shortcut}
                              </kbd>
                            )}

                            {isPermitted && item.badge && !item.shortcut && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                                  item.badgeColor === 'amber'
                                    ? 'badge-amber'
                                    : item.badgeColor === 'cyan'
                                    ? 'badge-indigo'
                                    : item.badgeColor === 'rose'
                                    ? 'badge-rose'
                                    : 'badge-emerald'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] dark:from-[#818cf8] dark:to-[#a78bfa]" />
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
      <div className="p-3 border-t border-[#e2e5f0] dark:border-white/5 bg-[#f8f9ff] dark:bg-[#070a1e] shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-white hover:bg-[#f4f5ff] dark:bg-[#111432]/80 dark:hover:bg-[#161940] text-[#6b7280] hover:text-[#0f1629] dark:text-[#6e7a9f] dark:hover:text-[#e8eaff] text-xs font-semibold transition-colors border border-[#e2e5f0] dark:border-white/5 shadow-sm cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
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
