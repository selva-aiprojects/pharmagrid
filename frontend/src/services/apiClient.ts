// PharmaGrid Cloud Frontend API Client
// Seamless integration with .NET 9 Web API (http://127.0.0.1:5050)
// High-resilience client with fallback to mock data when server is restarting

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5050';

export interface ApiProduct {
  productId: string;
  code: string;
  productName: string;
  genericName: string;
  manufacturerName: string;
  dosageForm: string;
  packSize: string;
  uom: string;
  hsnCode: string;
  gstPercentage: number;
  ptr: number;
  mrp: number;
  scheduleClass: string;
  storageCondition: string;
  totalAvailableQuantity: number;
}

export interface ApiCustomer {
  customerId: string;
  code: string;
  name: string;
  customerType: string;
  gstin: string;
  stateCode: string;
  drugLicense20B: string;
  drugLicense21B: string;
  licenseExpiryDate: string;
  isLicenseValid: boolean;
  creditLimit: number;
  currentOutstanding: number;
}

export interface ApiDashboardSummary {
  branchName: string;
  todaysSalesValue: number;
  salesGrowthPct: number;
  totalInventoryAssetValue: number;
  totalInventoryUnits: number;
  overdueReceivables: number;
  overdueCustomerCount: number;
  activeExpiryRiskHorizonValue: number;
  financialKpis?: {
    todaysSalesValue: number;
    salesGrowthVsYesterdayPct: number;
    inventoryAssetValue: number;
    totalInventoryUnits: number;
    overdueReceivables: number;
    receivablesOverdueCustomerCount: number;
  };
  expiryRiskKpis?: {
    critical0To30DaysValue: number;
    warning31To60DaysValue: number;
    promo61To90DaysValue: number;
    totalNearExpiryValue: number;
  };
  liveOperationalQueue?: Array<{
    orderId: string;
    customerName: string;
    status: string;
    zone: string;
  }>;
}

export interface ApiBatch {
  batchId: string;
  productId: string;
  productCode: string;
  productName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  availableQuantity: number;
  ptr: number;
  mrp: number;
  locationRackBin: string;
  isQuarantined: boolean;
  storageCondition: string;
  scheduleClass: string;
  daysToExpiry: number;
}

export interface CreateInvoiceItem {
  productId: string;
  batchId: string;
  quantityBilled: number;
  unitPricePTR: number;
  discountPercentage: number;
}

export interface CreateInvoicePayload {
  customerId: string;
  invoiceMode: string;
  lineItems: CreateInvoiceItem[];
}

export interface InvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  totalGrossAmount: number;
  totalTradeDiscountAmount: number;
  totalTaxableAmount: number;
  totalCgstAmount: number;
  totalSgstAmount: number;
  totalIgstAmount: number;
  roundOffAmount: number;
  netPayableAmount: number;
  irnHash: string;
  executionDurationMs: number;
}

export interface ApiSupplier {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  gstinNumber: string;
  stateCode: string;
  drugLicenseNo: string;
  currentPayableBalance: number;
  creditPeriodDays: number;
}

export interface InboundGrnPayload {
  supplierId: string;
  supplierInvoiceNumber: string;
  invoiceDate: string;
  warehouseId: string;
  lineItems: Array<{
    productId: string;
    batchNumber: string;
    manufacturingDate: string;
    expiryDate: string;
    quantityReceived: number;
    freeQuantityReceived: number;
    purchaseRate: number;
    mrp: number;
    hsnCode: string;
    gstPercentage: number;
    putAwayRackLocation: string;
  }>;
}

export const pharmaApi = {
  // 1. Health check
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/healthz`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using local mode:', e);
      return { status: 'Local Mode', engineSla: '< 2.0s', product: 'PharmaGrid' };
    }
  },

  // 2. Master Products
  async getProducts(): Promise<ApiProduct[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch products from backend:', e);
      return [];
    }
  },

  // 2b. Search Products
  async searchProducts(query: string): Promise<ApiProduct[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/products/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to search products');
      return await res.json();
    } catch (e) {
      console.warn('Search fallback error:', e);
      return [];
    }
  },

  // 3. Product Stock Breakdown
  async getProductStock(productId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/products/${productId}/stock`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch stock');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch product stock:', e);
      return null;
    }
  },

  // 4. FEFO Split Allocation Preview
  async previewAllocation(warehouseId: string, items: Array<{ productId: string; requestedQuantity: number }>) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/allocate-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId, items }),
      });
      if (!res.ok) throw new Error('Allocation preview failed');
      return await res.json();
    } catch (e) {
      console.warn('Failed to preview FEFO allocation:', e);
      return null;
    }
  },

  // 5. High-Velocity Sales Invoice Execution
  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResult> {
    const res = await fetch(`${BASE_URL}/api/v1/sales/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Invoice finalization failed' }));
      throw new Error(errorData.message || `Server responded with HTTP ${res.status}`);
    }
    return await res.json();
  },

  // 5b. Get Invoice Details by ID
  async getInvoiceDetails(invoiceId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/sales/invoices/${invoiceId}/details`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch invoice details');
      return await res.json();
    } catch (e) {
      console.warn('Invoice details error:', e);
      return null;
    }
  },

  // 5c. Get E-Invoice NIC Status
  async getEInvoice(invoiceId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/sales/invoices/${invoiceId}/einvoice`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch e-invoice');
      return await res.json();
    } catch (e) {
      console.warn('E-invoice error:', e);
      return null;
    }
  },

  // 5d. Process Sales Return / Credit Note
  async createSalesReturn(payload: { customerId: string; originalInvoiceNumber: string; returnLines: any[] }) {
    const res = await fetch(`${BASE_URL}/api/v1/sales/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Credit note issuance failed' }));
      throw new Error(errorData.message || 'Credit note failure');
    }
    return await res.json();
  },

  // 6. Customers CRM
  async getCustomers(): Promise<ApiCustomer[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/customers`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch customers from backend:', e);
      return [];
    }
  },

  // 7. Dashboard Executive Summary
  async getDashboardSummary(): Promise<ApiDashboardSummary | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/dashboard/summary`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch dashboard summary');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch dashboard summary:', e);
      return null;
    }
  },

  // 8. 4-Tier Expiry Horizons
  async getExpiryHorizons() {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/expiry-horizons`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch expiry horizons');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch expiry horizons:', e);
      return null;
    }
  },

  // 9. Warehouse Batches
  async getWarehouseBatches(): Promise<ApiBatch[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/batches`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch warehouse batches');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch batches:', e);
      return [];
    }
  },

  // 10. Schemes
  async getSchemes() {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/schemes`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch schemes');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch schemes:', e);
      return [];
    }
  },

  // 11. Audit Logs
  async getAuditLogs(limit: number = 50) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auditlogs?limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch audit logs:', e);
      return [];
    }
  },

  // 12. Sales Invoices List
  async getInvoices(limit: number = 50) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/sales/invoices?limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch invoices:', e);
      return [];
    }
  },

  // 13. Suppliers
  async getSuppliers(): Promise<ApiSupplier[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/purchases/suppliers`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch suppliers:', e);
      return [];
    }
  },

  // 14. Inbound Goods Receipt Note (GRN)
  async createGrn(payload: InboundGrnPayload) {
    const res = await fetch(`${BASE_URL}/api/v1/purchases/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'GRN processing failed' }));
      throw new Error(err.message || 'GRN failed');
    }
    return await res.json();
  },

  // 15. Inbound GRN Audit History
  async getGrnHistory() {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/purchases/grn-history`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch GRN history');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch GRN history:', e);
      return [];
    }
  },

  // 16. User & Staff Management
  async getUsers(params?: { q?: string; role?: string; status?: string }): Promise<ApiUserItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.q) query.append('q', params.q);
      if (params?.role) query.append('role', params.role);
      if (params?.status) query.append('status', params.status);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${BASE_URL}/api/v1/users${qs}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch users:', e);
      return [];
    }
  },

  async getUserStats(): Promise<ApiUserStats | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/stats`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch user stats');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch user stats:', e);
      return null;
    }
  },

  async createUser(payload: any): Promise<ApiUserItem> {
    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create user' }));
      throw new Error(err.message || 'Create user error');
    }
    return await res.json();
  },

  async updateUser(userId: string, payload: any): Promise<ApiUserItem> {
    const res = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update user' }));
      throw new Error(err.message || 'Update user error');
    }
    return await res.json();
  },

  async toggleUserStatus(userId: string) {
    const res = await fetch(`${BASE_URL}/api/v1/users/${userId}/status`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to toggle status' }));
      throw new Error(err.message || 'Status toggle error');
    }
    return await res.json();
  },

  async resetUserPassword(userId: string) {
    const res = await fetch(`${BASE_URL}/api/v1/users/${userId}/reset-password`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to reset password' }));
      throw new Error(err.message || 'Reset password error');
    }
    return await res.json();
  }
};

export interface ApiUserItem {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleName: 'Owner' | 'BillingExecutive' | 'Pharmacist' | 'WarehouseOperator' | 'AccountsExecutive' | string;
  branchName: string;
  counterNumber: string;
  shift: string;
  isActive: boolean;
  isRegisteredPharmacist: boolean;
  pharmacistCouncilRegNo?: string | null;
  pharmacistCouncilExpiry?: string | null;
  maxDiscountPercentage: number;
  canAuthorizeReturns: boolean;
  canCancelInvoices: boolean;
  canAccessScheduleX: boolean;
  lastLoginAt: string;
  permissions: string[];
}

export interface ApiUserStats {
  totalStaff: number;
  activeNow: number;
  billingExecutives: number;
  licensedPharmacists: number;
  suspendedAccounts: number;
}


