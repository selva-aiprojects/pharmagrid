'use client';

import React, { useState, useEffect } from 'react';
import { pharmaApi, ApiUserItem, ApiUserStats } from '@/services/apiClient';
import {
  Users,
  UserCheck,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Building,
  Clock,
  Award,
  Zap,
  Check,
  Copy,
} from 'lucide-react';

const ALL_MODULE_PERMISSIONS = [
  { id: 'dashboard', label: 'Executive Dashboard & P&L' },
  { id: 'billing', label: 'Rapid Counter Billing (POS)' },
  { id: 'products', label: 'Master SKU Catalog' },
  { id: 'inventory', label: 'Batch Rack Balances & FEFO' },
  { id: 'procurement', label: 'Inbound GRN & Purchases' },
  { id: 'customers', label: 'Pharmacies CRM & DL 20B/21B' },
  { id: 'schemes', label: 'Scheme & Deal Matrix' },
  { id: 'audit', label: 'CDSCO Regulatory Audit Trail' },
  { id: 'users', label: 'Staff & RBAC Administration' },
];

export default function UserManagementView() {
  const [users, setUsers] = useState<ApiUserItem[]>([]);
  const [stats, setStats] = useState<ApiUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUserItem | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{ username: string; tempPass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('BillingExecutive');
  const [formBranch, setFormBranch] = useState('Main Chennai Depot TN-33');
  const [formCounter, setFormCounter] = useState('Terminal-01 (Rapid POS)');
  const [formShift, setFormShift] = useState('Morning (8 AM - 4 PM)');
  const [formIsPharmacist, setFormIsPharmacist] = useState(false);
  const [formCouncilRegNo, setFormCouncilRegNo] = useState('');
  const [formCouncilExpiry, setFormCouncilExpiry] = useState('2029-12-31');
  const [formMaxDiscount, setFormMaxDiscount] = useState<number>(5.0);
  const [formCanAuthorizeReturns, setFormCanAuthorizeReturns] = useState(false);
  const [formCanCancelInvoices, setFormCanCancelInvoices] = useState(false);
  const [formCanAccessScheduleX, setFormCanAccessScheduleX] = useState(false);
  const [formPermissions, setFormPermissions] = useState<string[]>(['billing', 'customers', 'products']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userList, statsData] = await Promise.all([
        pharmaApi.getUsers(),
        pharmaApi.getUserStats(),
      ]);
      setUsers(userList);
      setStats(statsData);
    } catch (e) {
      console.warn('Failed to load user management data:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('BillingExecutive');
    setFormBranch('Main Chennai Depot TN-33');
    setFormCounter('Terminal-01 (Rapid POS)');
    setFormShift('Morning (8 AM - 4 PM)');
    setFormIsPharmacist(false);
    setFormCouncilRegNo('');
    setFormCouncilExpiry('2029-12-31');
    setFormMaxDiscount(5.0);
    setFormCanAuthorizeReturns(false);
    setFormCanCancelInvoices(false);
    setFormCanAccessScheduleX(false);
    setFormPermissions(['billing', 'customers', 'products']);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: ApiUserItem) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormFullName(u.fullName);
    setFormEmail(u.email);
    setFormPhone(u.phoneNumber);
    setFormRole(u.roleName);
    setFormBranch(u.branchName);
    setFormCounter(u.counterNumber);
    setFormShift(u.shift);
    setFormIsPharmacist(u.isRegisteredPharmacist);
    setFormCouncilRegNo(u.pharmacistCouncilRegNo || '');
    setFormCouncilExpiry(u.pharmacistCouncilExpiry || '2029-12-31');
    setFormMaxDiscount(u.maxDiscountPercentage);
    setFormCanAuthorizeReturns(u.canAuthorizeReturns);
    setFormCanCancelInvoices(u.canCancelInvoices);
    setFormCanAccessScheduleX(u.canAccessScheduleX);
    setFormPermissions(u.permissions || []);
    setIsAddModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleRoleChange = (newRole: string) => {
    setFormRole(newRole);
    if (newRole === 'Owner') {
      setFormPermissions(ALL_MODULE_PERMISSIONS.map(p => p.id));
      setFormMaxDiscount(15.0);
      setFormCanAuthorizeReturns(true);
      setFormCanCancelInvoices(true);
      setFormCanAccessScheduleX(true);
    } else if (newRole === 'BillingExecutive') {
      setFormPermissions(['billing', 'customers', 'schemes', 'products']);
      setFormMaxDiscount(5.0);
      setFormCanAuthorizeReturns(false);
      setFormCanCancelInvoices(false);
      setFormCanAccessScheduleX(false);
    } else if (newRole === 'Pharmacist') {
      setFormPermissions(['billing', 'products', 'inventory', 'audit']);
      setFormIsPharmacist(true);
      setFormMaxDiscount(8.0);
      setFormCanAuthorizeReturns(true);
      setFormCanCancelInvoices(true);
      setFormCanAccessScheduleX(true);
    } else if (newRole === 'WarehouseOperator') {
      setFormPermissions(['inventory', 'procurement', 'products']);
      setFormMaxDiscount(0.0);
      setFormCanAuthorizeReturns(true);
      setFormCanCancelInvoices(false);
      setFormCanAccessScheduleX(false);
    } else if (newRole === 'AccountsExecutive') {
      setFormPermissions(['dashboard', 'customers', 'schemes', 'audit']);
      setFormMaxDiscount(10.0);
      setFormCanAuthorizeReturns(true);
      setFormCanCancelInvoices(true);
      setFormCanAccessScheduleX(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      alert('Full Name is required.');
      return;
    }
    if (!editingUser && !formUsername.trim()) {
      alert('Username is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await pharmaApi.updateUser(editingUser.userId, {
          fullName: formFullName,
          email: formEmail,
          phoneNumber: formPhone,
          roleName: formRole,
          branchName: formBranch,
          counterNumber: formCounter,
          shift: formShift,
          isActive: editingUser.isActive,
          isRegisteredPharmacist: formIsPharmacist,
          pharmacistCouncilRegNo: formIsPharmacist ? formCouncilRegNo : null,
          pharmacistCouncilExpiry: formIsPharmacist ? formCouncilExpiry : null,
          maxDiscountPercentage: Number(formMaxDiscount),
          canAuthorizeReturns: formCanAuthorizeReturns,
          canCancelInvoices: formCanCancelInvoices,
          canAccessScheduleX: formCanAccessScheduleX,
          permissions: formPermissions,
        });
        showToast(`Staff member "${res.fullName}" profile updated.`);
      } else {
        // Create user
        const res = await pharmaApi.createUser({
          username: formUsername,
          fullName: formFullName,
          email: formEmail,
          phoneNumber: formPhone,
          roleName: formRole,
          branchName: formBranch,
          counterNumber: formCounter,
          shift: formShift,
          isRegisteredPharmacist: formIsPharmacist,
          pharmacistCouncilRegNo: formIsPharmacist ? formCouncilRegNo : null,
          pharmacistCouncilExpiry: formIsPharmacist ? formCouncilExpiry : null,
          maxDiscountPercentage: Number(formMaxDiscount),
          canAuthorizeReturns: formCanAuthorizeReturns,
          canCancelInvoices: formCanCancelInvoices,
          canAccessScheduleX: formCanAccessScheduleX,
          permissions: formPermissions,
        });
        showToast(`New staff member "${res.fullName}" successfully registered.`);
      }

      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving user record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ApiUserItem) => {
    try {
      await pharmaApi.toggleUserStatus(user.userId);
      showToast(`User ${user.username} status set to ${!user.isActive ? 'Active' : 'Suspended'}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleResetPassword = async (user: ApiUserItem) => {
    try {
      const res = await pharmaApi.resetUserPassword(user.userId);
      setTempPasswordResult({
        username: res.username,
        tempPass: res.temporaryPassword,
      });
      setCopiedPass(false);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleCopyPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult.tempPass);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber.includes(searchQuery) ||
      (u.pharmacistCouncilRegNo && u.pharmacistCouncilRegNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.roleName.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 1. TOP HEADER & METRICS */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Staff &amp; Role-Based Access Control (RBAC) Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            CDSCO Registered Pharmacist verification, counter terminal assignments, and granular checkout authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Reload Staff Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            Total Staff Force
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.totalStaff ?? users.length}
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Across all depot roles</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            Active on Duty
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats?.activeNow ?? users.filter(u => u.isActive).length}
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">Live authenticated</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            CDSCO Pharmacists
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-cyan-400">
              {stats?.licensedPharmacists ?? users.filter(u => u.isRegisteredPharmacist).length}
            </span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[10px] text-blue-600/80 dark:text-cyan-400/80 mt-1 block">State Council Validated</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            Billing Operators
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-300">
              {stats?.billingExecutives ?? users.filter(u => u.roleName === 'BillingExecutive').length}
            </span>
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Sub-2s Counter Terminals</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            Suspended / Leave
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {stats?.suspendedAccounts ?? users.filter(u => !u.isActive).length}
            </span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1 block">Access locked</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff by name, username, email, mobile, or Council Reg No..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Enterprise Roles</option>
              <option value="Owner">Managing Director / Owner</option>
              <option value="BillingExecutive">Billing Executive</option>
              <option value="Pharmacist">CDSCO QA Pharmacist</option>
              <option value="WarehouseOperator">Warehouse Operator</option>
              <option value="AccountsExecutive">Accounts &amp; GST Executive</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. STAFF DIRECTORY TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Enterprise Staff Roster &amp; Counter Assignments
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
              {filteredUsers.length} Employee(s)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Live PostgreSQL Role Mapping</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 min-w-[200px]">Staff Member</th>
                <th className="py-2.5 px-3 min-w-[130px]">Role &amp; Domain</th>
                <th className="py-2.5 px-3 min-w-[170px]">Branch &amp; Counter</th>
                <th className="py-2.5 px-3 min-w-[150px]">CDSCO Pharmacist Reg</th>
                <th className="py-2.5 px-3 min-w-[160px]">Checkout RBAC Guards</th>
                <th className="py-2.5 px-3 text-center min-w-[90px]">Duty Status</th>
                <th className="py-2.5 px-3 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No staff members match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const initials = u.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={u.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.roleName === 'Owner'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                              : u.roleName === 'Pharmacist'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : u.roleName === 'BillingExecutive'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              <span className="font-mono text-[10px] text-slate-500 font-normal">@{u.username}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {u.email} &bull; {u.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          u.roleName === 'Owner'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                            : u.roleName === 'Pharmacist'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : u.roleName === 'BillingExecutive'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                            : u.roleName === 'AccountsExecutive'
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                          {u.roleName === 'BillingExecutive' ? 'Billing Executive' :
                           u.roleName === 'AccountsExecutive' ? 'Accounts / GST Lead' :
                           u.roleName === 'WarehouseOperator' ? 'Warehouse Operator' :
                           u.roleName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{u.shift}</div>
                      </td>

                      {/* Branch & Counter */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.counterNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {u.branchName}
                        </div>
                      </td>

                      {/* CDSCO Registered Pharmacist Status */}
                      <td className="py-3 px-3">
                        {u.isRegisteredPharmacist && u.pharmacistCouncilRegNo ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">
                              <Award className="w-3 h-3 text-emerald-500" />
                              {u.pharmacistCouncilRegNo}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              Valid Thru: {u.pharmacistCouncilExpiry || '2030'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Non-Pharmacist Staff</span>
                        )}
                      </td>

                      {/* Granular RBAC Guards */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            Disc: <strong>{u.maxDiscountPercentage}% Max</strong>
                          </span>
                          {u.canAccessScheduleX && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-semibold border border-rose-200 dark:border-rose-800">
                              Sched X
                            </span>
                          )}
                          {u.canAuthorizeReturns && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                              Returns Auth
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            u.isActive
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          }`}
                          title={`Click to ${u.isActive ? 'Suspend' : 'Activate'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          {u.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Edit Staff & Permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-amber-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Reset Temporary Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: ADD / EDIT STAFF MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {editingUser ? `Edit Staff Member (${editingUser.fullName})` : 'Register New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: Full Name & Username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Username / ID *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="e.g. anand.billing"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="anand@pharmagrid.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Role & Counter Assignment */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Enterprise Role
                  </label>
                  <select
                    value={formRole}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Owner">Managing Director / Owner</option>
                    <option value="BillingExecutive">Billing Executive</option>
                    <option value="Pharmacist">CDSCO QA Pharmacist</option>
                    <option value="WarehouseOperator">Warehouse Operator</option>
                    <option value="AccountsExecutive">Accounts &amp; GST Lead</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Assigned Counter / Dock
                  </label>
                  <input
                    type="text"
                    value={formCounter}
                    onChange={e => setFormCounter(e.target.value)}
                    placeholder="Terminal-01 (Rapid POS)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Shift Timings
                  </label>
                  <select
                    value={formShift}
                    onChange={e => setFormShift(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Morning (8 AM - 4 PM)">Morning (8 AM - 4 PM)</option>
                    <option value="Evening (1 PM - 9 PM)">Evening (1 PM - 9 PM)</option>
                    <option value="General (9 AM - 6 PM)">General (9 AM - 6 PM)</option>
                    <option value="Night Dock (9 PM - 5 AM)">Night Dock (9 PM - 5 AM)</option>
                  </select>
                </div>
              </div>

              {/* CDSCO Pharmacist Verification Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      CDSCO Statutory Registered Pharmacist Status
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPharmacist}
                      onChange={e => setFormIsPharmacist(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Licensed Pharmacist
                    </span>
                  </label>
                </div>

                {formIsPharmacist && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        State Pharmacy Council Reg No.
                      </label>
                      <input
                        type="text"
                        value={formCouncilRegNo}
                        onChange={e => setFormCouncilRegNo(e.target.value)}
                        placeholder="e.g. TN-PC-55421/2019"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Registration Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formCouncilExpiry}
                        onChange={e => setFormCouncilExpiry(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Authorizations */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Max Counter Discount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="25"
                      step="0.5"
                      value={formMaxDiscount}
                      onChange={e => setFormMaxDiscount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <span className="absolute right-2 top-1 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-1.5 pt-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanAuthorizeReturns}
                      onChange={e => setFormCanAuthorizeReturns(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Authorize Returns / Credit Note</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanCancelInvoices}
                      onChange={e => setFormCanCancelInvoices(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Authorize Bill Cancellation</span>
                  </label>
                </div>

                <div className="flex flex-col justify-center pt-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCanAccessScheduleX}
                      onChange={e => setFormCanAccessScheduleX(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Schedule X Narcotics Vault</span>
                  </label>
                </div>
              </div>

              {/* Module RBAC Matrix */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
                  Permitted Modules &amp; Subsystems
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {ALL_MODULE_PERMISSIONS.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPermissions.includes(p.id)}
                        onChange={() => handleTogglePermission(p.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : editingUser ? 'Save Profile Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: PASSWORD RESET SUCCESS */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Temporary Password Issued</h4>
                <p className="text-[11px] text-slate-500">For user @{tempPasswordResult.username}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-mono font-bold text-base text-blue-600 dark:text-cyan-300">
                {tempPasswordResult.tempPass}
              </span>
              <button
                onClick={handleCopyPassword}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold text-xs cursor-pointer border border-blue-200 dark:border-blue-700"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPass ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Provide this one-time credential to the staff member. The system will enforce a mandatory password reset on first login.
            </p>

            <button
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
            >
              Done &amp; Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
