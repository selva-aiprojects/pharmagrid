'use client';

import React from 'react';
import {
  Shield,
  Lock,
  Search,
  CheckCircle2,
  FileCode,
  Calendar,
  Terminal,
  Clock,
} from 'lucide-react';

export default function AuditLogView() {
  const auditRecords = [
    {
      id: 8492,
      timestamp: '28-Sep-2026 12:15:30 IST',
      action: 'INVOICE_FINALIZED',
      entity: 'T_Sales_Invoices',
      recordId: 'INV-2026-08942',
      user: 'Suresh Babu (Billing)',
      ipAddress: '192.168.1.42',
      details: 'Committed 100 units Pan 40mg (Split: 40@AUG26 + 60@SEP26) + 10 Free. Net: ₹4,043.00',
    },
    {
      id: 8491,
      timestamp: '28-Sep-2026 11:42:10 IST',
      action: 'BATCH_INGESTED_GRN',
      entity: 'T_Batches',
      recordId: 'AUG-PAN40-102',
      user: 'Ramesh K. (Warehouse)',
      ipAddress: '192.168.1.18',
      details: 'GRN-2026-00481 inward 550 units from Sun Pharma. Exp: 2028-07-31, Rack: Z1-R02-S03-B01',
    },
    {
      id: 8490,
      timestamp: '28-Sep-2026 10:14:05 IST',
      action: 'CREDIT_LIMIT_OVERRIDE',
      entity: 'M_Customers',
      recordId: 'CUST-4108',
      user: 'Admin (Manager PIN Verified)',
      ipAddress: '192.168.1.10',
      details: 'Temporary billing release granted for MedPlus Guindy. Balance ₹68,500 on ₹75,000 limit.',
    },
    {
      id: 8489,
      timestamp: '28-Sep-2026 09:30:00 IST',
      action: 'SCH1_ANTIBIOTIC_REGISTER',
      entity: 'T_Sales_Invoice_Items',
      recordId: 'AUG-GSK-991',
      user: 'Suresh Babu (Billing)',
      ipAddress: '192.168.1.42',
      details: 'Schedule H1 statutory registry entry logged for Augmentin 625mg (20 strips to Apollo Alandur).',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 1. HEADER */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Immutable Regulatory Audit Trail (CDSCO Compliance)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed, append-only transaction ledger enforced by PostgreSQL trigger policy.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Append-Only Trigger Active
          </span>
        </div>
      </div>

      {/* 2. AUDIT LOG RECORDS */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] font-bold border-b border-slate-300 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-3 w-16">Log #</th>
              <th className="py-2.5 px-3">Operation Timestamp</th>
              <th className="py-2.5 px-3 text-center">Action Type</th>
              <th className="py-2.5 px-3">Target Entity &amp; Record ID</th>
              <th className="py-2.5 px-3">Authorized User</th>
              <th className="py-2.5 px-3">IP Address</th>
              <th className="py-2.5 px-4">Transactional Changes &amp; State Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
            {auditRecords.map(rec => (
              <tr key={rec.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 font-semibold">#{rec.id}</td>
                <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">{rec.timestamp}</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-slate-900 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-slate-800">
                    {rec.action}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono text-slate-900 dark:text-white text-xs font-semibold">{rec.entity}</div>
                  <div className="font-mono text-[10px] text-blue-700 dark:text-cyan-400">{rec.recordId}</div>
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">{rec.user}</td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 text-[11px]">{rec.ipAddress}</td>
                <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">{rec.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
