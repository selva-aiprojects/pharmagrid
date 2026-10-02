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
import MastersManagementView from '@/components/MastersManagementView';
import CdscoRegistersView from '@/components/CdscoRegistersView';
import PaymentCollectionsView from '@/components/PaymentCollectionsView';
import ReturnsManagementView from '@/components/ReturnsManagementView';
import FinancialLedgersView from '@/components/FinancialLedgersView';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, logout, switchPersona } = useAuth();

  // 'landing' = public marketing page
  // 'login'   = enterprise login screen
  // 'erp'     = authenticated app shell
  const [viewMode, setViewMode] = useState<'erp' | 'landing' | 'login'>('landing');
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModuleId>('billing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Wait for AuthContext to finish reading localStorage before routing
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated) {
      setViewMode('erp');
    }
  }, [isAuthenticated, hasHydrated]);

  // Handle logout from Header: clear auth and go to login screen
  const handleLogout = () => {
    logout();
    setViewMode('login');
  };

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

  // Show nothing until AuthContext has read localStorage (prevents flash)
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#07091a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
          <span className="text-[#6e7a9f] text-sm font-medium tracking-wide">Loading PharmaGrid…</span>
        </div>
      </div>
    );
  }

  // 1. PUBLIC MARKETING & SALES PITCH LANDING PAGE
  if (viewMode === 'landing') {
    return (
      <div className="landing-page-root dark">
        <LandingPageView
          onLaunchApp={async () => {
            if (!isAuthenticated) {
              await switchPersona('admin');
            }
            setViewMode('erp');
          }}
          onOpenLogin={() => setViewMode('login')}
          onSelectPersonaLaunch={async (username) => {
            await switchPersona(username);
            setViewMode('erp');
          }}
        />
      </div>
    );
  }

  // 2. DEDICATED ENTERPRISE COUNTER LOGIN SCREEN
  if (viewMode === 'login') {
    return (
      <div className="login-page-root dark">
        <LoginView
          onSuccessLogin={() => setViewMode('erp')}
          onBackToLanding={() => setViewMode('landing')}
        />
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'billing':
        return <RapidBillingWorkspace />;
      case 'collections':
        return <PaymentCollectionsView />;
      case 'returns':
        return <ReturnsManagementView />;
      case 'cdsco':
        return <CdscoRegistersView />;
      case 'financials':
        return <FinancialLedgersView />;
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
      case 'masters':
        return <MastersManagementView />;
      default:
        return <RapidBillingWorkspace />;
    }
  };

  return (
    <div className="erp-shell min-h-screen bg-[#f0f2f8] dark:bg-[#07091a] text-slate-900 dark:text-[#e8eaff] flex flex-col transition-colors duration-200">
      {/* 1. TOP GLOBAL APP HEADER */}
      <Header
        activeModule={activeModule}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onOpenLanding={() => setViewMode('landing')}
        onOpenLogin={() => setViewMode('login')}
        onLogout={handleLogout}
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
        <main className="flex-1 overflow-y-auto p-5 max-w-[1820px] w-full mx-auto text-slate-900 dark:text-[#e8eaff]">
          {renderActiveModule()}
        </main>
      </div>

      {/* 3. FOOTER STATUTORY & ENGINE STATUS BAR */}
      <footer className="border-t border-[#e2e5f0] dark:border-white/5 bg-white/98 dark:bg-[#07091a]/98 px-4 py-2 text-[11px] text-[#6b7280] dark:text-[#6e7a9f] flex flex-wrap items-center justify-between gap-4 transition-colors duration-200 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="status-dot-online" />
            <span className="text-emerald-600 dark:text-[#34d399]">Core Engine Online</span>
            <span className="text-[#9ca3af] dark:text-[#44506a] font-normal">(99.5% SLA)</span>
          </span>
          <span className="text-[#d1d5f0] dark:text-white/10 hidden sm:inline">|</span>
          <span className="hidden sm:inline">PostgreSQL 16: <strong className="text-[#2d3554] dark:text-[#b0b7d8]">Tenant-Scoped Isolation</strong></span>
          <span className="text-[#d1d5f0] dark:text-white/10 hidden md:inline">|</span>
          <span className="hidden md:inline">Redis Lock: <strong className="text-[#4f46e5] dark:text-[#818cf8] font-semibold">RedLock Active</strong></span>
          <span className="text-[#d1d5f0] dark:text-white/10 hidden lg:inline">|</span>
          <span className="hidden lg:inline">CDSCO Compliance: <strong className="text-[#2d3554] dark:text-[#b0b7d8]">Schedules H / H1 / X &amp; Indian Dual GST</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#2d3554] dark:text-[#b0b7d8]">Pharma<span className="text-[#4f46e5] dark:text-[#818cf8] font-black">Grid™</span> Cloud ERP v1.0</span>
          <span className="text-[#d1d5f0] dark:text-white/10">•</span>
          <span className="text-[#10b981] dark:text-[#34d399] font-mono font-bold tracking-tight">2-Second Checkout Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
