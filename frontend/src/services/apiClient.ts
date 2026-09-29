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
  },

  // ----------------------------------------
  // ORDERS MODULE (VENDOR PO & CUSTOMER PRE-ORDERS)
  // ----------------------------------------
  async getOrdersSummary(): Promise<ApiOrdersSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/orders/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Orders summary fetch error:', e);
    }
    return {
      totalVendorPos: 3,
      totalPoValue: 470200.00,
      pendingPoDeliveries: 2,
      totalCustomerOrders: 3,
      totalOrderValue: 104210.00,
      urgentBookings: 2
    };
  },

  async getVendorPos(): Promise<ApiVendorPo[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/orders/vendor-pos`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Vendor PO fetch error:', e);
    }
    return [];
  },

  async createVendorPo(req: any): Promise<ApiVendorPo> {
    const res = await fetch(`${BASE_URL}/api/v1/orders/vendor-pos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to create Vendor PO');
    }
    return await res.json();
  },

  async convertPoToGrn(poId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/orders/vendor-pos/${poId}/convert-to-grn`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to convert PO to Inward GRN');
    return await res.json();
  },

  async getCustomerOrders(): Promise<ApiCustomerOrder[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/orders/customer-orders`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Customer orders fetch error:', e);
    }
    return [];
  },

  async createCustomerOrder(req: any): Promise<ApiCustomerOrder> {
    const res = await fetch(`${BASE_URL}/api/v1/orders/customer-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to book customer pre-order');
    }
    return await res.json();
  },

  async convertOrderToInvoice(orderId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/orders/customer-orders/${orderId}/convert-to-invoice`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to convert order to invoice');
    return await res.json();
  },

  // ----------------------------------------
  // SHIPMENT & LOGISTICS MODULE
  // ----------------------------------------
  async getLogisticsSummary(): Promise<ApiLogisticsSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/logistics/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Logistics summary fetch error:', e);
    }
    return {
      activeManifests: 2,
      dispatchedParcels: 5,
      deliveredToday: 1,
      pendingCodCollections: 48200.00,
      reconciledCodToday: 14500.00
    };
  },

  async getDeliveryManifests(): Promise<ApiDeliveryManifest[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/logistics/manifests`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Manifests fetch error:', e);
    }
    return [];
  },

  async createDeliveryManifest(req: any): Promise<ApiDeliveryManifest> {
    const res = await fetch(`${BASE_URL}/api/v1/logistics/manifests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to create delivery manifest');
    return await res.json();
  },

  async updateChallanPod(manifestId: string, challanId: string, req: any): Promise<ApiDeliveryManifest> {
    const res = await fetch(`${BASE_URL}/api/v1/logistics/manifests/${manifestId}/challans/${challanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to record POD');
    return await res.json();
  },

  async completeManifest(manifestId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/logistics/manifests/${manifestId}/complete`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reconcile manifest');
    return await res.json();
  },

  // ----------------------------------------
  // UNIFIED STOCK MASTER & PHYSICAL ADJUSTMENTS
  // ----------------------------------------
  async getStockMasterSummary(): Promise<ApiStockMasterSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/stockmaster/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Stock master summary error:', e);
    }
    return {
      totalSkus: 4,
      totalBatches: 8,
      totalValuation: 423700.00,
      lowStockCount: 2,
      expiredQuarantineCount: 60,
      monthlyBreakageLoss: 7000.00
    };
  },

  async getStockMasterItems(): Promise<ApiStockMasterItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/stockmaster/items`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Stock master items error:', e);
    }
    return [];
  },

  async getStockAdjustments(): Promise<ApiStockAdjustment[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/stockmaster/adjustments`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Stock adjustments error:', e);
    }
    return [];
  },

  async createStockAdjustment(req: any): Promise<ApiStockAdjustment> {
    const res = await fetch(`${BASE_URL}/api/v1/stockmaster/adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to register stock adjustment');
    return await res.json();
  },

  // ----------------------------------------
  // DEMAND FORECAST & STOCKOUT RADAR
  // ----------------------------------------
  async getDemandForecastSummary(): Promise<ApiDemandForecastSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/demandforecast/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Demand forecast error:', e);
    }
    return {
      criticalStockoutsCount: 1,
      lowStockWarningsCount: 1,
      healthyStockCount: 2,
      totalRecommendedPoValue: 480000.00,
      averageInventoryDays: 16.1,
      items: []
    };
  },

  async generatePoForForecastProduct(productId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/demandforecast/generate-po/${productId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to generate automatic PO');
    return await res.json();
  },

  // ----------------------------------------
  // STAFF PAYROLL & SALARY SLIPS
  // ----------------------------------------
  async getPayrollSummary(month?: string): Promise<ApiPayrollRunSummary> {
    try {
      const query = month ? `?month=${encodeURIComponent(month)}` : '';
      const res = await fetch(`${BASE_URL}/api/v1/payroll/summary${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Payroll summary error:', e);
    }
    return {
      monthYear: 'September 2026',
      totalEmployees: 4,
      totalGrossSalary: 210653.85,
      totalNetDisbursement: 196129.45,
      totalPfContribution: 14400.00,
      totalEsiContribution: 2092.70,
      status: 'Completed',
      slips: []
    };
  },

  async getPayrollSlip(employeeId: string, month?: string): Promise<ApiSalarySlip> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/payroll/slip/${employeeId}${query}`);
    if (!res.ok) throw new Error('Failed to fetch salary slip');
    return await res.json();
  },

  async processPayroll(req: { monthYear: string; workingDaysInMonth: number }): Promise<ApiPayrollRunSummary> {
    const res = await fetch(`${BASE_URL}/api/v1/payroll/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to process payroll');
    return await res.json();
  },

  async disburseSalary(slipId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/payroll/disburse/${slipId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to disburse salary');
    return await res.json();
  },

  // ----------------------------------------
  // CENTRALIZED MASTERS MANAGEMENT
  // ----------------------------------------
  async getMastersSummary(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Masters summary error:', e);
    }
    return {
      totalManufacturers: 6,
      totalCategories: 6,
      totalRacks: 6,
      totalHsnCodes: 5,
      totalRoutes: 4
    };
  },

  async getManufacturersMaster(): Promise<ApiManufacturerMaster[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/manufacturers`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Manufacturers fetch error:', e);
    }
    return [];
  },

  async getCategoriesMaster(): Promise<ApiCategoryMaster[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/categories`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Categories fetch error:', e);
    }
    return [];
  },

  async getRacksMaster(): Promise<ApiWarehouseRack[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/racks`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Racks fetch error:', e);
    }
    return [];
  },

  async getHsnTaxMaster(): Promise<ApiHsnTaxMaster[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/hsn-tax`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('HSN Tax fetch error:', e);
    }
    return [];
  },

  async getDeliveryRoutesMaster(): Promise<ApiDeliveryRoute[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/masters/routes`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Delivery routes fetch error:', e);
    }
    return [];
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

// ==========================================
// ENTERPRISE MODULES DTO INTERFACES
// ==========================================
export interface ApiVendorPoItem {
  productId: string;
  productName: string;
  productCode: string;
  quantityOrdered: number;
  unitPrice: number;
  gstRate: number;
  lineTotal: number;
}

export interface ApiVendorPo {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'Draft' | 'Submitted' | 'PartiallyReceived' | 'Fulfilled' | 'Cancelled';
  paymentTerms: string;
  totalAmount: number;
  notes: string;
  items: ApiVendorPoItem[];
}

export interface ApiCustomerOrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantityOrdered: number;
  unitPrice: number;
  gstRate: number;
  lineTotal: number;
}

export interface ApiCustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  salesRepName: string;
  priority: 'Normal' | 'Urgent' | 'ColdChain';
  status: 'Booked' | 'Approved' | 'Dispatched' | 'Invoiced' | 'Cancelled';
  totalAmount: number;
  deliveryAddress: string;
  notes: string;
  items: ApiCustomerOrderItem[];
}

export interface ApiOrdersSummary {
  totalVendorPos: number;
  totalPoValue: number;
  pendingPoDeliveries: number;
  totalCustomerOrders: number;
  totalOrderValue: number;
  urgentBookings: number;
}

export interface ApiDeliveryChallan {
  id: string;
  challanNumber: string;
  invoiceNumber: string;
  customerName: string;
  deliveryAddress: string;
  contactPhone: string;
  cartonCount: number;
  codAmount: number;
  paymentMode: 'Credit' | 'COD_Cash' | 'COD_UPI' | 'Prepaid';
  deliveryStatus: 'Pending' | 'OutForDelivery' | 'Delivered' | 'AttemptedFailed' | 'Returned';
  podReceiverName?: string | null;
  podTimestamp?: string | null;
  podRemarks?: string | null;
}

export interface ApiDeliveryManifest {
  id: string;
  manifestNumber: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  dispatchDate: string;
  status: 'Scheduled' | 'InTransit' | 'Completed' | 'Reconciled';
  totalInvoices: number;
  totalCartons: number;
  totalCodAmount: number;
  collectedCodAmount: number;
  challans: ApiDeliveryChallan[];
}

export interface ApiLogisticsSummary {
  activeManifests: number;
  dispatchedParcels: number;
  deliveredToday: number;
  pendingCodCollections: number;
  reconciledCodToday: number;
}

export interface ApiStockMasterBatch {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  physicalStock: number;
  bookStock: number;
  allocatedStock: number;
  quarantineStock: number;
  availableStock: number;
  purchasePrice: number;
  mrp: number;
  locationBin: string;
}

export interface ApiStockMasterItem {
  productId: string;
  productCode: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  category: string;
  hsnCode: string;
  gstRate: number;
  totalPhysicalStock: number;
  totalBookStock: number;
  totalAllocatedStock: number;
  totalQuarantineStock: number;
  totalAvailableStock: number;
  batchCount: number;
  storageCondition: string;
  scheduleClass: string;
  reorderLevel: number;
  stockValue: number;
  batches: ApiStockMasterBatch[];
}

export interface ApiStockAdjustment {
  id: string;
  adjustmentNumber: string;
  productId: string;
  productName: string;
  batchNumber: string;
  adjustmentType: 'Breakage' | 'Leakage' | 'ExpiryQuarantine' | 'PhysicalVariance' | 'Sample';
  quantity: number;
  unitCost: number;
  totalValueLoss: number;
  reasonCode: string;
  approvedBy: string;
  createdDate: string;
  notes: string;
}

export interface ApiStockMasterSummary {
  totalSkus: number;
  totalBatches: number;
  totalValuation: number;
  lowStockCount: number;
  expiredQuarantineCount: number;
  monthlyBreakageLoss: number;
}

export interface ApiDemandForecastItem {
  productId: string;
  productCode: string;
  brandName: string;
  manufacturer: string;
  currentAvailableStock: number;
  dailySalesRunRate: number;
  monthlySalesRunRate: number;
  daysOfInventoryRemaining: number;
  stockoutRisk: 'Critical_Stockout' | 'Low_Stock_Warning' | 'Adequate' | 'Overstocked';
  reorderLevel: number;
  recommendedReorderQuantity: number;
  leadTimeDays: number;
  supplierId: string;
  supplierName: string;
  estimatedPoValue: number;
}

export interface ApiDemandForecastSummary {
  criticalStockoutsCount: number;
  lowStockWarningsCount: number;
  healthyStockCount: number;
  totalRecommendedPoValue: number;
  averageInventoryDays: number;
  items: ApiDemandForecastItem[];
}

export interface ApiSalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  roleName: string;
  panNumber: string;
  uanNumber: string;
  monthYear: string;
  totalWorkingDays: number;
  daysWorked: number;
  lopDays: number;
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  grossEarnings: number;
  pfEmployeeDeduction: number;
  esiEmployeeDeduction: number;
  professionalTax: number;
  tdsDeduction: number;
  totalDeductions: number;
  netSalary: number;
  netSalaryInWords: string;
  paymentStatus: 'Draft' | 'Approved' | 'Paid';
  paymentReference?: string | null;
  processedDate: string;
}

export interface ApiPayrollRunSummary {
  monthYear: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetDisbursement: number;
  totalPfContribution: number;
  totalEsiContribution: number;
  status: string;
  slips: ApiSalarySlip[];
}

// ==========================================
// MASTERS MANAGEMENT INTERFACES
// ==========================================
export interface ApiManufacturerMaster {
  id: string;
  code: string;
  name: string;
  divisions: string;
  returnPolicy: string;
  phone: string;
  email: string;
  isActive: boolean;
  skuCount: number;
}

export interface ApiCategoryMaster {
  id: string;
  name: string;
  description: string;
  scheduleClass: string;
  storageCondition: string;
  isActive: boolean;
  skuCount: number;
}

export interface ApiWarehouseRack {
  id: string;
  binCode: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  storageType: string;
  capacity: number;
  occupied: number;
  status: string;
}

export interface ApiHsnTaxMaster {
  id: string;
  hsnCode: string;
  description: string;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  slabName: string;
  isActive: boolean;
}

export interface ApiDeliveryRoute {
  id: string;
  routeName: string;
  areaCoverage: string;
  vehicleAssigned: string;
  driverName: string;
  driverPhone: string;
  chemistCount: number;
  frequency: string;
  targetCodCollection: number;
}


