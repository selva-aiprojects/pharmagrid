'use client';

import React, { useState, useEffect } from 'react';
import Sidebar, { AppModuleId } from '@/components/Sidebar';
import Header from '@/components/Header';
import RapidBillingWorkspace from '@/components/RapidBillingWorkspace';
import ExecutiveDashboardView from '@/components/ExecutiveDashboardView';
import ProductCatalogView from '@/components/ProductCatalogView';
import WarehouseInventoryView from '@/components/WarehouseInventoryView';
import ProcurementGrnView from '@/components/ProcurementGrnView';
import CustomersView from '@/components/CustomersView';
import SchemesView from '@/components/SchemesView';
import AuditLogView from '@/components/AuditLogView';
import UserManagementView from '@/components/UserManagementView';
import LandingPageView from '@/components/LandingPageView';
import LoginView from '@/components/LoginView';
import OrdersManagementView from '@/components/OrdersManagementView';
import LogisticsDispatchView from '@/components/LogisticsDispatchView';
import StockMasterView from '@/components/StockMasterView';
import DemandForecastView from '@/components/DemandForecastView';
import PayrollView from '@/components/PayrollView';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [viewMode, setViewMode] = useState<'erp' | 'landing' | 'login'>('erp');
  const [activeModule, setActiveModule] = useState<AppModuleId>('billing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { switchPersona } = useAuth();

  // Global keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. PUBLIC MARKETING & SALES PITCH LANDING PAGE
  if (viewMode === 'landing') {
    return (
      <LandingPageView
        onLaunchApp={() => setViewMode('erp')}
        onOpenLogin={() => setViewMode('login')}
        onSelectPersonaLaunch={async (username) => {
          await switchPersona(username);
          setViewMode('erp');
        }}
      />
    );
  }

  // 2. DEDICATED ENTERPRISE COUNTER LOGIN SCREEN
  if (viewMode === 'login') {
    return (
      <LoginView
        onSuccessLogin={() => setViewMode('erp')}
        onBackToLanding={() => setViewMode('landing')}
      />
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'billing':
        return <RapidBillingWorkspace />;
      case 'dashboard':
        return <ExecutiveDashboardView />;
      case 'orders':
        return <OrdersManagementView />;
      case 'procurement':
        return <ProcurementGrnView />;
      case 'logistics':
        return <LogisticsDispatchView />;
      case 'products':
        return <ProductCatalogView />;
      case 'stockmaster':
        return <StockMasterView />;
      case 'inventory':
        return <WarehouseInventoryView />;
      case 'demandforecast':
        return <DemandForecastView />;
      case 'customers':
        return <CustomersView />;
      case 'schemes':
        return <SchemesView />;
      case 'audit':
        return <AuditLogView />;
      case 'payroll':
        return <PayrollView />;
      case 'users':
        return <UserManagementView />;
      default:
        return <RapidBillingWorkspace />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 1. TOP GLOBAL APP HEADER */}
      <Header
        activeModule={activeModule}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onOpenLanding={() => setViewMode('landing')}
        onOpenLogin={() => setViewMode('login')}
      />

      {/* 2. BODY: COLLAPSIBLE SIDEBAR + MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Clean Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 max-w-[1780px] w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* 3. FOOTER STATUTORY & ENGINE STATUS BAR */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d18] px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Core Engine Online (99.5% Uptime SLA)
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="hidden sm:inline">PostgreSQL 16: <strong className="text-slate-700 dark:text-slate-300">Tenant-Scoped Isolation</strong></span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
          <span className="hidden md:inline">Redis Lock: <strong className="text-blue-700 dark:text-blue-400 font-semibold">RedLock Active</strong></span>
          <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>
          <span className="hidden lg:inline">CDSCO Compliance: <strong className="text-slate-700 dark:text-slate-300">Schedules H / H1 / X &amp; Indian Dual GST</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Pharma<span className="text-blue-700 dark:text-blue-400 font-bold">Grid™</span> Cloud ERP v1.0</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">2-Second Checkout Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
