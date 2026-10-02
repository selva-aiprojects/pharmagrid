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
  },

  // ----------------------------------------
  // STATUTORY CDSCO COMPLIANCE REGISTERS
  // ----------------------------------------
  async getCdscoScheduleH1(query?: string): Promise<ApiScheduleH1Entry[]> {
    try {
      const q = query ? `?query=${encodeURIComponent(query)}` : '';
      const res = await fetch(`${BASE_URL}/api/v1/cdsco/schedule-h1${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('CDSCO H1 fetch error:', e);
    }
    return [
      {
        id: 'h1-1',
        supplyDate: '2026-10-02',
        invoiceNumber: 'INV-2026-0891',
        customerName: 'Apollo Pharmacy - T. Nagar',
        drugLicenseNumber: 'TN-CHE-20B-98124',
        customerCity: 'Chennai',
        doctorName: 'Dr. A. K. Sundaram, MD',
        doctorRegistrationNumber: 'MCI-TN-45812',
        productName: 'Meropenem 1g Injection',
        genericName: 'Meropenem Trihydrate IP',
        batchNumber: 'OCT-MERO-901',
        expiryDate: '2028-05-31',
        quantitySold: 60,
        packagingUnit: '1 Vial with WFI'
      },
      {
        id: 'h1-2',
        supplyDate: '2026-10-01',
        invoiceNumber: 'INV-2026-0884',
        customerName: 'MedPlus - Anna Nagar West',
        drugLicenseNumber: 'TN-CHE-20B-78234',
        customerCity: 'Chennai',
        doctorName: 'Dr. Priya Venkatesh, MBBS',
        doctorRegistrationNumber: 'MCI-TN-89241',
        productName: 'Augmentin 625mg Tablet',
        genericName: 'Amoxicillin + Potassium Clavulanate',
        batchNumber: 'AUG-AUG625-102',
        expiryDate: '2027-08-31',
        quantitySold: 120,
        packagingUnit: '10x10 Tablets'
      },
      {
        id: 'h1-3',
        supplyDate: '2026-09-29',
        invoiceNumber: 'INV-2026-0870',
        customerName: 'Manipal Hospital Pharmacy',
        drugLicenseNumber: 'TN-CHE-20B-11209',
        customerCity: 'Chennai',
        doctorName: 'Dr. R. Ramanathan, MD',
        doctorRegistrationNumber: 'MCI-TN-12409',
        productName: 'Cefixime 200mg Tablet',
        genericName: 'Cefixime Trihydrate IP',
        batchNumber: 'JUL-CEF200-44',
        expiryDate: '2027-04-30',
        quantitySold: 200,
        packagingUnit: '10x10 Tablets'
      }
    ];
  },

  async getCdscoScheduleX(): Promise<ApiScheduleXLedger[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/cdsco/schedule-x`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('CDSCO Schedule X fetch error:', e);
    }
    return [
      {
        id: 'schx-1',
        date: '2026-09-25',
        productName: 'Alprazolam 0.5mg Tablets',
        batchNumber: 'SCHX-ALP-101',
        openingBalance: 500,
        inwardReceiptQuantity: 1000,
        inwardSupplierBillNo: 'SUN-CHN-9012',
        outwardSoldQuantity: 200,
        outwardChemistName: 'Manipal Hospital Central Dispensing',
        chemistLicenseForm20F21F: 'TN-CHE-20F-1204',
        closingBalance: 1300,
        registeredPharmacistName: 'Karthik Raja, B.Pharm',
        pharmacistRegNo: 'TN-PC-48912-A'
      },
      {
        id: 'schx-2',
        date: '2026-09-28',
        productName: 'Zolpidem 10mg Tablets',
        batchNumber: 'SCHX-ZOL-202',
        openingBalance: 250,
        inwardReceiptQuantity: 0,
        inwardSupplierBillNo: '-',
        outwardSoldQuantity: 100,
        outwardChemistName: 'Apollo Specialty Hospital Pharmacy',
        chemistLicenseForm20F21F: 'TN-CHE-20F-9941',
        closingBalance: 150,
        registeredPharmacistName: 'Karthik Raja, B.Pharm',
        pharmacistRegNo: 'TN-PC-48912-A'
      },
      {
        id: 'schx-3',
        date: '2026-10-01',
        productName: 'Ketamine 50mg/ml Injection',
        batchNumber: 'SCHX-KET-303',
        openingBalance: 80,
        inwardReceiptQuantity: 200,
        inwardSupplierBillNo: 'CIPLA-MAA-441',
        outwardSoldQuantity: 50,
        outwardChemistName: 'Fortis Malar Hospital OT Dispensing',
        chemistLicenseForm20F21F: 'TN-CHE-21F-3321',
        closingBalance: 230,
        registeredPharmacistName: 'Karthik Raja, B.Pharm',
        pharmacistRegNo: 'TN-PC-48912-A'
      }
    ];
  },

  async getBatchTraceability(batchNumber: string): Promise<ApiBatchRecallTrace> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/cdsco/batch-recall/${encodeURIComponent(batchNumber)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Batch recall trace error:', e);
    }
    return {
      batchNumber: batchNumber.toUpperCase(),
      productName: 'Augmentin 625mg Tablet',
      genericName: 'Amoxicillin + Potassium Clavulanate IP',
      manufacturerName: 'GlaxoSmithKline Pharmaceuticals',
      manufacturingDate: '2026-08-01',
      expiryDate: '2028-07-31',
      initialBatchQuantity: 2500,
      totalUnitsSupplied: 250,
      currentWarehouseStock: 180,
      warehouseRackLocation: 'Z1-R02-S03-B01',
      recallStatus: 'ACTIVE_RECALL',
      severityLevel: 'Class II (Potential Harm)',
      impactedPharmacies: [
        {
          customerId: 'c-1',
          customerName: 'Apollo Pharmacy - T. Nagar',
          contactPhone: '+91 98401 22334',
          city: 'Chennai',
          drugLicense20B: 'TN-CHE-20B-98124',
          invoiceNumber: 'INV-2026-0891',
          invoiceDate: '2026-09-27',
          quantitySupplied: 60,
          deliveryStatus: 'Delivered_Acknowledged'
        },
        {
          customerId: 'c-2',
          customerName: 'MedPlus Pharmacy - Anna Nagar',
          contactPhone: '+91 98402 33445',
          city: 'Chennai',
          drugLicense20B: 'TN-CHE-20B-78234',
          invoiceNumber: 'INV-2026-0884',
          invoiceDate: '2026-09-26',
          quantitySupplied: 40,
          deliveryStatus: 'Delivered_Acknowledged'
        },
        {
          customerId: 'c-3',
          customerName: 'Manipal Hospital Pharmacy',
          contactPhone: '+91 98403 44556',
          city: 'Chennai',
          drugLicense20B: 'TN-CHE-20B-11209',
          invoiceNumber: 'INV-2026-0870',
          invoiceDate: '2026-09-23',
          quantitySupplied: 150,
          deliveryStatus: 'Delivered_Acknowledged'
        }
      ]
    };
  },

  async issueRecallNotice(payload: { batchNumber: string; reasonForRecall: string; authorityOrderReference: string; urgencyLevel: string }) {
    const res = await fetch(`${BASE_URL}/api/v1/cdsco/batch-recall/issue-notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to issue recall notice');
    return await res.json();
  },

  async getColdChainLogs(): Promise<ApiColdChainLog[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/cdsco/cold-chain-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Cold chain logs error:', e);
    }
    return [
      {
        id: 'cc-1',
        logDate: '2026-10-02',
        timeSlot: '08:00 AM (Morning)',
        storageUnitName: 'Deep Cold Room Unit-A (2-8°C)',
        recordedTemperatureCelsius: 4.2,
        isWithinSafeThreshold: true,
        calibratedLoggerSerialNumber: 'SEN-CAL-99410',
        inspectorPharmacistName: 'Karthik Raja, B.Pharm',
        excursionRemarks: null
      },
      {
        id: 'cc-2',
        logDate: '2026-10-01',
        timeSlot: '08:00 PM (Evening)',
        storageUnitName: 'Deep Cold Room Unit-A (2-8°C)',
        recordedTemperatureCelsius: 4.6,
        isWithinSafeThreshold: true,
        calibratedLoggerSerialNumber: 'SEN-CAL-99410',
        inspectorPharmacistName: 'Karthik Raja, B.Pharm',
        excursionRemarks: null
      },
      {
        id: 'cc-3',
        logDate: '2026-10-01',
        timeSlot: '08:00 AM (Morning)',
        storageUnitName: 'Transit Chiller Unit-B (2-8°C)',
        recordedTemperatureCelsius: 5.1,
        isWithinSafeThreshold: true,
        calibratedLoggerSerialNumber: 'SEN-CAL-99412',
        inspectorPharmacistName: 'Karthik Raja, B.Pharm',
        excursionRemarks: null
      }
    ];
  },

  async recordColdChainLog(payload: { storageUnitName: string; timeSlot: string; temperatureCelsius: number; remarks?: string }) {
    const res = await fetch(`${BASE_URL}/api/v1/cdsco/cold-chain-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record cold chain log');
    return await res.json();
  },

  // ----------------------------------------
  // CHEMIST PAYMENT COLLECTIONS & KNOCKOFF
  // ----------------------------------------
  async getPendingInvoices(customerId: string): Promise<ApiPendingInvoiceKnockoff[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/collections/pending-invoices/${customerId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Pending invoices knockoff error:', e);
    }
    return [
      {
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-2026-0391',
        invoiceDate: '2026-09-04',
        totalNetPayable: 18450.00,
        alreadyPaidAmount: 0,
        outstandingBalance: 18450.00,
        daysOverdue: 7,
        promptPaymentDiscountEligible: 0
      },
      {
        invoiceId: 'inv-2',
        invoiceNumber: 'INV-2026-0412',
        invoiceDate: '2026-09-18',
        totalNetPayable: 12300.00,
        alreadyPaidAmount: 0,
        outstandingBalance: 12300.00,
        daysOverdue: 0,
        promptPaymentDiscountEligible: 0
      },
      {
        invoiceId: 'inv-3',
        invoiceNumber: 'INV-2026-0445',
        invoiceDate: '2026-09-28',
        totalNetPayable: 8640.00,
        alreadyPaidAmount: 0,
        outstandingBalance: 8640.00,
        daysOverdue: 0,
        promptPaymentDiscountEligible: 172.80
      }
    ];
  },

  async createPaymentReceipt(payload: any): Promise<ApiPaymentReceiptVoucher> {
    const res = await fetch(`${BASE_URL}/api/v1/collections/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create payment receipt');
    return await res.json();
  },

  async getAgingAnalysis(): Promise<ApiChemistAgingSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/collections/aging-analysis`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Aging analysis fetch error:', e);
    }
    return {
      totalReceivables: 1245000.00,
      totalOverdueAmount: 485000.00,
      totalOverdueCustomers: 5,
      amountOver60Days: 78000.00,
      customerAgingList: [
        {
          customerId: 'c-1',
          customerName: 'Apollo Pharmacy - T. Nagar',
          customerCode: 'CUST-APO-01',
          phoneNumber: '+91 98401 22334',
          totalOutstanding: 45000.00,
          currentNotDue: 25000.00,
          days1To15: 12000.00,
          days16To30: 8000.00,
          days31To45: 0,
          days46To60: 0,
          daysOver60: 0,
          isBlockedForBilling: false
        },
        {
          customerId: 'c-2',
          customerName: 'MedPlus - Anna Nagar West',
          customerCode: 'CUST-MED-02',
          phoneNumber: '+91 98402 33445',
          totalOutstanding: 78400.00,
          currentNotDue: 35000.00,
          days1To15: 20000.00,
          days16To30: 15000.00,
          days31To45: 8400.00,
          days46To60: 0,
          daysOver60: 0,
          isBlockedForBilling: false
        },
        {
          customerId: 'c-3',
          customerName: 'Manipal Hospital Central Pharmacy',
          customerCode: 'CUST-MAN-03',
          phoneNumber: '+91 98403 44556',
          totalOutstanding: 198500.00,
          currentNotDue: 80000.00,
          days1To15: 45000.00,
          days16To30: 35000.00,
          days31To45: 25000.00,
          days46To60: 13500.00,
          daysOver60: 0,
          isBlockedForBilling: false
        },
        {
          customerId: 'c-4',
          customerName: 'Sri Balaji Medicals - Tambaram',
          customerCode: 'CUST-BAL-04',
          phoneNumber: '+91 98404 55667',
          totalOutstanding: 89000.00,
          currentNotDue: 15000.00,
          days1To15: 14000.00,
          days16To30: 20000.00,
          days31To45: 15000.00,
          days46To60: 10000.00,
          daysOver60: 15000.00,
          isBlockedForBilling: true
        }
      ]
    };
  },

  // ----------------------------------------
  // RETURNS & CLAIMS MANAGEMENT
  // ----------------------------------------
  async getSalesReturns(): Promise<ApiSalesReturnCreditNote[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/returns/sales`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Sales returns fetch error:', e);
    }
    return [
      {
        creditNoteId: 'cn-1',
        creditNoteNumber: 'CN-2026-0812',
        creditNoteDate: '2026-09-30',
        customerId: 'c-1',
        customerName: 'Apollo Pharmacy - T. Nagar',
        originalInvoiceNumber: 'INV-2026-0812',
        subTotalTaxable: 4250.00,
        totalGstReversed: 510.00,
        totalCreditNoteAmount: 4760.00,
        status: 'CreditNoteIssued',
        itemsCount: 3
      },
      {
        creditNoteId: 'cn-2',
        creditNoteNumber: 'CN-2026-0805',
        creditNoteDate: '2026-09-27',
        customerId: 'c-2',
        customerName: 'MedPlus - Anna Nagar West',
        originalInvoiceNumber: 'INV-2026-0798',
        subTotalTaxable: 2400.00,
        totalGstReversed: 288.00,
        totalCreditNoteAmount: 2688.00,
        status: 'CreditNoteIssued',
        itemsCount: 2
      }
    ];
  },

  async createSalesReturn(payload: any): Promise<ApiSalesReturnCreditNote> {
    const res = await fetch(`${BASE_URL}/api/v1/returns/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create sales return credit note');
    return await res.json();
  },

  async getPurchaseReturns(): Promise<ApiPurchaseReturnDebitNote[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/returns/purchases`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Purchase returns fetch error:', e);
    }
    return [
      {
        debitNoteId: 'dn-1',
        debitNoteNumber: 'DN-2026-0310',
        debitNoteDate: '2026-09-29',
        supplierId: 's-1',
        supplierName: 'Alkem Laboratories Ltd - Chennai C&F',
        totalDebitAmount: 18500.00,
        manufacturerClaimStatus: 'APPROVED_BY_COMPANY',
        companyClaimReference: 'ALK-CLM-8921'
      },
      {
        debitNoteId: 'dn-2',
        debitNoteNumber: 'DN-2026-0294',
        debitNoteDate: '2026-09-23',
        supplierId: 's-2',
        supplierName: 'Cipla Distribution Centre',
        totalDebitAmount: 9400.00,
        manufacturerClaimStatus: 'CREDIT_NOTE_RECEIVED',
        companyClaimReference: 'CIP-CN-4412'
      }
    ];
  },

  async createPurchaseReturn(payload: any): Promise<ApiPurchaseReturnDebitNote> {
    const res = await fetch(`${BASE_URL}/api/v1/returns/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create purchase return debit note');
    return await res.json();
  },

  // ----------------------------------------
  // FINANCIAL ACCOUNTING & GST REPORTS
  // ----------------------------------------
  async getCustomerStatement(customerId: string, fromDate?: string, toDate?: string): Promise<ApiCustomerStatement> {
    try {
      const query = `?fromDate=${fromDate || ''}&toDate=${toDate || ''}`;
      const res = await fetch(`${BASE_URL}/api/v1/financials/customer-ledger/${customerId}${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Customer statement error:', e);
    }
    return {
      customerId,
      customerName: 'Apollo Pharmacy - T. Nagar',
      customerCode: 'CUST-APO-01',
      gstin: '33AAACA1234A1Z5',
      periodFrom: fromDate || '2026-09-01',
      periodTo: toDate || '2026-10-02',
      openingBalance: 15000.00,
      totalDebits: 68450.00,
      totalCredits: 38450.00,
      closingBalance: 45000.00,
      entries: [
        {
          date: '2026-09-01',
          voucherType: 'OPENING',
          voucherNumber: 'OP-BAL',
          particulars: 'Opening Balance Brought Forward',
          debitAmount: 15000.00,
          creditAmount: 0,
          runningBalance: 15000.00
        },
        {
          date: '2026-09-12',
          voucherType: 'SALES_INV',
          voucherNumber: 'INV-2026-0812',
          particulars: 'Tax Invoice - Rapid Counter POS',
          debitAmount: 35000.00,
          creditAmount: 0,
          runningBalance: 50000.00
        },
        {
          date: '2026-09-20',
          voucherType: 'RECEIPT_VOUCHER',
          voucherNumber: 'REC-2026-8910',
          particulars: 'Cheque Collection - HDFC Chq #481902 Cleared',
          debitAmount: 0,
          creditAmount: 35000.00,
          runningBalance: 15000.00
        },
        {
          date: '2026-09-28',
          voucherType: 'SALES_INV',
          voucherNumber: 'INV-2026-0891',
          particulars: 'Tax Invoice - Rapid Counter POS',
          debitAmount: 33450.00,
          creditAmount: 0,
          runningBalance: 48450.00
        },
        {
          date: '2026-09-30',
          voucherType: 'CREDIT_NOTE',
          voucherNumber: 'CN-2026-0812',
          particulars: 'Credit Note - Expiry Stock Return Reversal',
          debitAmount: 0,
          creditAmount: 3450.00,
          runningBalance: 45000.00
        }
      ]
    };
  },

  async getGstR1Summary(monthYear?: string): Promise<ApiGstR1Summary> {
    try {
      const q = monthYear ? `?monthYear=${encodeURIComponent(monthYear)}` : '';
      const res = await fetch(`${BASE_URL}/api/v1/financials/gst-r1-summary${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('GST R1 summary error:', e);
    }
    return {
      monthYear: monthYear || '2026-09',
      totalB2BInvoicesCount: 142,
      totalTaxableTurnover: 2845000.00,
      totalCgstCollected: 170700.00,
      totalSgstCollected: 170700.00,
      totalIgstCollected: 0.00,
      totalGrossTaxLiability: 341400.00,
      b2bInvoices: [
        {
          chemistGstin: '33AAACA1234A1Z5',
          chemistLegalTradeName: 'Apollo Pharmacy - T. Nagar',
          invoiceNumber: 'INV-2026-0891',
          invoiceDate: '2026-09-28',
          invoiceValue: 37464.00,
          placeOfSupply: '33-Tamil Nadu',
          reverseCharge: false,
          taxableValue: 33450.00,
          cgstAmount: 2007.00,
          sgstAmount: 2007.00,
          igstAmount: 0
        },
        {
          chemistGstin: '33BBBMP5678B2Z1',
          chemistLegalTradeName: 'MedPlus Pharmacy - Anna Nagar',
          invoiceNumber: 'INV-2026-0884',
          invoiceDate: '2026-09-27',
          invoiceValue: 28400.00,
          placeOfSupply: '33-Tamil Nadu',
          reverseCharge: false,
          taxableValue: 25357.14,
          cgstAmount: 1521.43,
          sgstAmount: 1521.43,
          igstAmount: 0
        },
        {
          chemistGstin: '33CCCAP9012C3Z8',
          chemistLegalTradeName: 'Manipal Hospital Pharmacy',
          invoiceNumber: 'INV-2026-0870',
          invoiceDate: '2026-09-25',
          invoiceValue: 98500.00,
          placeOfSupply: '33-Tamil Nadu',
          reverseCharge: false,
          taxableValue: 87946.43,
          cgstAmount: 5276.79,
          sgstAmount: 5276.79,
          igstAmount: 0
        }
      ],
      hsnSummary: [
        {
          hsnCode: '30049099',
          description: 'Allopathic Formulations (Tablets/Capsules)',
          uqc: 'STRIPS',
          totalQuantity: 4500,
          totalValue: 185000.00,
          taxableValue: 165178.57,
          ratePercentage: 12.00,
          cgstAmount: 9910.71,
          sgstAmount: 9910.71,
          igstAmount: 0
        },
        {
          hsnCode: '30043110',
          description: 'Insulin Formulations (Cold Chain 2-8°C)',
          uqc: 'VIALS',
          totalQuantity: 650,
          totalValue: 92500.00,
          taxableValue: 88095.24,
          ratePercentage: 5.00,
          cgstAmount: 2202.38,
          sgstAmount: 2202.38,
          igstAmount: 0
        },
        {
          hsnCode: '30042010',
          description: 'Cephalosporins & Meropenem Injectables',
          uqc: 'VIALS',
          totalQuantity: 1200,
          totalValue: 145000.00,
          taxableValue: 129464.29,
          ratePercentage: 12.00,
          cgstAmount: 7767.86,
          sgstAmount: 7767.86,
          igstAmount: 0
        }
      ]
    };
  },

  async getCashBook(date?: string): Promise<ApiCashBookSummary> {
    try {
      const q = date ? `?date=${encodeURIComponent(date)}` : '';
      const res = await fetch(`${BASE_URL}/api/v1/financials/cash-book${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Cash book fetch error:', e);
    }
    return {
      date: date || '2026-10-02',
      openingCashInHand: 25000.00,
      totalCashCollections: 22750.00,
      totalCashDisbursements: 34700.00,
      closingCashInHand: 13050.00,
      transactions: [
        {
          date: '2026-10-02',
          voucherNo: 'REC-CASH-01',
          description: 'Counter Cash Sale - Cash Memo #CM-412',
          cashFlowType: 'INFLOW',
          amount: 4250.00,
          cashInHandBalance: 29250.00
        },
        {
          date: '2026-10-02',
          voucherNo: 'REC-CASH-02',
          description: 'Chemist COD Cash Collection - Van Route #1',
          cashFlowType: 'INFLOW',
          amount: 18500.00,
          cashInHandBalance: 47750.00
        },
        {
          date: '2026-10-02',
          voucherNo: 'EXP-PETTY-01',
          description: 'Warehouse Packing Material & Tamper Tape Purchase',
          cashFlowType: 'OUTFLOW',
          amount: 1200.00,
          cashInHandBalance: 46550.00
        },
        {
          date: '2026-10-02',
          voucherNo: 'EXP-FUEL-01',
          description: 'Delivery Van Diesel Fuel Reimbursement (TN-09-AX-4819)',
          cashFlowType: 'OUTFLOW',
          amount: 3500.00,
          cashInHandBalance: 43050.00
        },
        {
          date: '2026-10-02',
          voucherNo: 'BNK-DEP-01',
          description: 'Cash Remittance to HDFC Bank Current Account',
          cashFlowType: 'OUTFLOW',
          amount: 30000.00,
          cashInHandBalance: 13050.00
        }
      ]
    };
  },

  // ----------------------------------------
  // PHASE B: FIELD FORCE AUTOMATION & BEAT PLANNER
  // ----------------------------------------
  async getFieldForceSummary(): Promise<ApiFieldForceSummary> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/fieldforce/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Field force summary error:', e);
    }
    return {
      activeRepsCount: 4,
      totalBeatsToday: 4,
      totalScheduledVisits: 45,
      visitsCompleted: 34,
      coveragePercentage: 75.6,
      totalFieldOrdersBooked: 28,
      totalFieldBookingValue: 293550.00,
      totalFieldCollections: 173500.00,
      strikeRatePercentage: 82.4,
      beats: [
        {
          beatId: 'beat-1',
          beatName: 'T. Nagar Commercial & Hospital Beat',
          areaZone: 'Central Chennai (Zone-1)',
          repId: 'rep-101',
          repName: 'Rajesh Kumar (MR)',
          repPhone: '+91 98401 55667',
          dayOfWeek: 'Monday & Thursday',
          totalChemistsCount: 12,
          visitedCount: 9,
          targetOrderValue: 85000.00,
          achievedOrderValue: 92450.00,
          targetCollection: 50000.00,
          achievedCollection: 42000.00,
          status: 'In_Progress'
        },
        {
          beatId: 'beat-2',
          beatName: 'Anna Nagar & Kilpauk Retail Beat',
          areaZone: 'North West Chennai (Zone-2)',
          repId: 'rep-102',
          repName: 'Karthik Subramanian (MR)',
          repPhone: '+91 98402 66778',
          dayOfWeek: 'Tuesday & Friday',
          totalChemistsCount: 15,
          visitedCount: 12,
          targetOrderValue: 110000.00,
          achievedOrderValue: 98500.00,
          targetCollection: 75000.00,
          achievedCollection: 68000.00,
          status: 'In_Progress'
        },
        {
          beatId: 'beat-3',
          beatName: 'Tambaram & Chromepet Suburb Beat',
          areaZone: 'South Chennai (Zone-3)',
          repId: 'rep-103',
          repName: 'Venkatesh Babu (MR)',
          repPhone: '+91 98403 77889',
          dayOfWeek: 'Wednesday & Saturday',
          totalChemistsCount: 10,
          visitedCount: 5,
          targetOrderValue: 65000.00,
          achievedOrderValue: 41200.00,
          targetCollection: 40000.00,
          achievedCollection: 28500.00,
          status: 'In_Progress'
        },
        {
          beatId: 'beat-4',
          beatName: 'Adyar & Velachery Specialty Clinic Beat',
          areaZone: 'South Coastal (Zone-4)',
          repId: 'rep-104',
          repName: 'Sanjay Narayanan (MR)',
          repPhone: '+91 98404 88990',
          dayOfWeek: 'Monday & Friday',
          totalChemistsCount: 8,
          visitedCount: 8,
          targetOrderValue: 55000.00,
          achievedOrderValue: 61400.00,
          targetCollection: 35000.00,
          achievedCollection: 35000.00,
          status: 'Completed'
        }
      ]
    };
  },

  async getFieldBeats(): Promise<ApiChemistBeatPlan[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/fieldforce/beats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Field beats error:', e);
    }
    const summary = await this.getFieldForceSummary();
    return summary.beats;
  },

  async getBeatVisits(beatId: string): Promise<ApiChemistBeatVisit[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/fieldforce/beats/${beatId}/visits`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Beat visits error:', e);
    }
    return [
      {
        visitId: `vis-${beatId}-1`,
        beatId: beatId,
        sequenceOrder: 1,
        customerId: 'c-1',
        customerName: 'Apollo Pharmacy - T. Nagar North',
        customerCode: 'CUST-APO-01',
        address: '14 Pondy Bazaar, T. Nagar, Chennai - 600017',
        contactPhone: '+91 98401 22334',
        drugLicense20B: 'TN-CHE-20B-98124',
        creditLimit: 150000.00,
        currentOutstanding: 45000.00,
        isOverdueBlocked: false,
        visitStatus: 'OrderBooked',
        checkInTime: '09:45 AM',
        checkInLatitude: 13.0418,
        checkInLongitude: 80.2341,
        isGeofenceValid: true,
        bookedOrderId: 'SO-FLD-901',
        bookedOrderValue: 18450.00,
        collectedAmount: 15000.00,
        remarks: 'Ordered Augmentin 625 & Pan 40. Handed over HDFC chq #481902.'
      },
      {
        visitId: `vis-${beatId}-2`,
        beatId: beatId,
        sequenceOrder: 2,
        customerId: 'c-2',
        customerName: 'MedPlus Pharmacy - Venkatnarayana Rd',
        customerCode: 'CUST-MED-02',
        address: '42 Venkatnarayana Rd, T. Nagar, Chennai - 600017',
        contactPhone: '+91 98402 33445',
        drugLicense20B: 'TN-CHE-20B-78234',
        creditLimit: 120000.00,
        currentOutstanding: 78400.00,
        isOverdueBlocked: false,
        visitStatus: 'CheckedIn',
        checkInTime: '10:30 AM',
        checkInLatitude: 13.0392,
        checkInLongitude: 80.2312,
        isGeofenceValid: true,
        bookedOrderId: null,
        bookedOrderValue: 0,
        collectedAmount: 0,
        remarks: 'In discussion with chief pharmacist for insulin weekly order.'
      },
      {
        visitId: `vis-${beatId}-3`,
        beatId: beatId,
        sequenceOrder: 3,
        customerId: 'c-3',
        customerName: 'Sri Balaji Medicals - Panagal Park',
        customerCode: 'CUST-BAL-04',
        address: '5 Panagal Park Square, T. Nagar, Chennai - 600017',
        contactPhone: '+91 98404 55667',
        drugLicense20B: 'TN-CHE-20B-45123',
        creditLimit: 80000.00,
        currentOutstanding: 89000.00,
        isOverdueBlocked: true,
        visitStatus: 'Pending',
        checkInTime: null,
        checkInLatitude: null,
        checkInLongitude: null,
        isGeofenceValid: false,
        bookedOrderId: null,
        bookedOrderValue: 0,
        collectedAmount: 0,
        remarks: 'Account blocked due to >60d overdue. Visit target: payment collection.'
      },
      {
        visitId: `vis-${beatId}-4`,
        beatId: beatId,
        sequenceOrder: 4,
        customerId: 'c-5',
        customerName: 'LifeCare Chemist & Surgical Clinic',
        customerCode: 'CUST-LIF-05',
        address: '88 Usman Road, T. Nagar, Chennai - 600017',
        contactPhone: '+91 98405 66778',
        drugLicense20B: 'TN-CHE-20B-33214',
        creditLimit: 60000.00,
        currentOutstanding: 22000.00,
        isOverdueBlocked: false,
        visitStatus: 'Pending',
        checkInTime: null,
        checkInLatitude: null,
        checkInLongitude: null,
        isGeofenceValid: false,
        bookedOrderId: null,
        bookedOrderValue: 0,
        collectedAmount: 0,
        remarks: null
      }
    ];
  },

  async recordGpsCheckIn(payload: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/fieldforce/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Check-in failed');
    return await res.json();
  },

  async bookFieldOrder(payload: any): Promise<ApiFieldOrderResult> {
    const res = await fetch(`${BASE_URL}/api/v1/fieldforce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to book field order');
    return await res.json();
  },

  async recordFieldCollection(payload: any): Promise<ApiFieldCollectionResult> {
    const res = await fetch(`${BASE_URL}/api/v1/fieldforce/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record field collection');
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

// ==========================================
// PHASE A: STATUTORY CDSCO & COMPLIANCE
// ==========================================
export interface ApiScheduleH1Entry {
  id: string;
  supplyDate: string;
  invoiceNumber: string;
  customerName: string;
  drugLicenseNumber: string;
  customerCity: string;
  doctorName: string;
  doctorRegistrationNumber: string;
  productName: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
  quantitySold: number;
  packagingUnit: string;
}

export interface ApiScheduleXLedger {
  id: string;
  date: string;
  productName: string;
  batchNumber: string;
  openingBalance: number;
  inwardReceiptQuantity: number;
  inwardSupplierBillNo: string;
  outwardSoldQuantity: number;
  outwardChemistName: string;
  chemistLicenseForm20F21F: string;
  closingBalance: number;
  registeredPharmacistName: string;
  pharmacistRegNo: string;
}

export interface ApiBatchRecallChemist {
  customerId: string;
  customerName: string;
  contactPhone: string;
  city: string;
  drugLicense20B: string;
  invoiceNumber: string;
  invoiceDate: string;
  quantitySupplied: number;
  deliveryStatus: string;
}

export interface ApiBatchRecallTrace {
  batchNumber: string;
  productName: string;
  genericName: string;
  manufacturerName: string;
  manufacturingDate: string;
  expiryDate: string;
  initialBatchQuantity: number;
  totalUnitsSupplied: number;
  currentWarehouseStock: number;
  warehouseRackLocation: string;
  recallStatus: string;
  severityLevel: string;
  impactedPharmacies: ApiBatchRecallChemist[];
}

export interface ApiColdChainLog {
  id: string;
  logDate: string;
  timeSlot: string;
  storageUnitName: string;
  recordedTemperatureCelsius: number;
  isWithinSafeThreshold: boolean;
  calibratedLoggerSerialNumber: string;
  inspectorPharmacistName: string;
  excursionRemarks?: string | null;
}

// ==========================================
// PHASE A: COLLECTIONS & KNOCKOFF
// ==========================================
export interface ApiPendingInvoiceKnockoff {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalNetPayable: number;
  alreadyPaidAmount: number;
  outstandingBalance: number;
  daysOverdue: number;
  promptPaymentDiscountEligible: number;
}

export interface ApiPaymentReceiptVoucher {
  receiptId: string;
  receiptNumber: string;
  receiptDate: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  amountCollected: number;
  paymentMode: string;
  chequeNumber?: string | null;
  chequeBankName?: string | null;
  upiTransactionRef?: string | null;
  status: string;
  customerBalanceAfterReceipt: number;
  invoicesSettledCount: number;
}

export interface ApiChemistAgingBucket {
  customerId: string;
  customerName: string;
  customerCode: string;
  phoneNumber: string;
  totalOutstanding: number;
  currentNotDue: number;
  days1To15: number;
  days16To30: number;
  days31To45: number;
  days46To60: number;
  daysOver60: number;
  isBlockedForBilling: boolean;
}

export interface ApiChemistAgingSummary {
  totalReceivables: number;
  totalOverdueAmount: number;
  totalOverdueCustomers: number;
  amountOver60Days: number;
  customerAgingList: ApiChemistAgingBucket[];
}

// ==========================================
// PHASE A: RETURNS & CLAIMS
// ==========================================
export interface ApiSalesReturnCreditNote {
  creditNoteId: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  customerId: string;
  customerName: string;
  originalInvoiceNumber: string;
  subTotalTaxable: number;
  totalGstReversed: number;
  totalCreditNoteAmount: number;
  status: string;
  itemsCount: number;
}

export interface ApiPurchaseReturnDebitNote {
  debitNoteId: string;
  debitNoteNumber: string;
  debitNoteDate: string;
  supplierId: string;
  supplierName: string;
  totalDebitAmount: number;
  manufacturerClaimStatus: string;
  companyClaimReference?: string | null;
}

// ==========================================
// PHASE A: FINANCIAL ACCOUNTING & GST REPORTS
// ==========================================
export interface ApiAccountStatementEntry {
  date: string;
  voucherType: string;
  voucherNumber: string;
  particulars: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

export interface ApiCustomerStatement {
  customerId: string;
  customerName: string;
  customerCode: string;
  gstin: string;
  periodFrom: string;
  periodTo: string;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  entries: ApiAccountStatementEntry[];
}

export interface ApiGstR1B2BInvoice {
  chemistGstin: string;
  chemistLegalTradeName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: boolean;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export interface ApiGstHsnSummary {
  hsnCode: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  ratePercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export interface ApiGstR1Summary {
  monthYear: string;
  totalB2BInvoicesCount: number;
  totalTaxableTurnover: number;
  totalCgstCollected: number;
  totalSgstCollected: number;
  totalIgstCollected: number;
  totalGrossTaxLiability: number;
  b2bInvoices: ApiGstR1B2BInvoice[];
  hsnSummary: ApiGstHsnSummary[];
}

export interface ApiCashBookEntry {
  date: string;
  voucherNo: string;
  description: string;
  cashFlowType: string;
  amount: number;
  cashInHandBalance: number;
}

export interface ApiCashBookSummary {
  date: string;
  openingCashInHand: number;
  totalCashCollections: number;
  totalCashDisbursements: number;
  closingCashInHand: number;
  transactions: ApiCashBookEntry[];
}

// ==========================================
// PHASE B: FIELD FORCE AUTOMATION & BEAT PLANNER
// ==========================================
export interface ApiChemistBeatPlan {
  beatId: string;
  beatName: string;
  areaZone: string;
  repId: string;
  repName: string;
  repPhone: string;
  dayOfWeek: string;
  totalChemistsCount: number;
  visitedCount: number;
  targetOrderValue: number;
  achievedOrderValue: number;
  targetCollection: number;
  achievedCollection: number;
  status: string;
}

export interface ApiChemistBeatVisit {
  visitId: string;
  beatId: string;
  sequenceOrder: number;
  customerId: string;
  customerName: string;
  customerCode: string;
  address: string;
  contactPhone: string;
  drugLicense20B: string;
  creditLimit: number;
  currentOutstanding: number;
  isOverdueBlocked: boolean;
  visitStatus: 'Pending' | 'CheckedIn' | 'OrderBooked' | 'CollectionOnly' | 'ChemistClosed';
  checkInTime?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  isGeofenceValid: boolean;
  bookedOrderId?: string | null;
  bookedOrderValue: number;
  collectedAmount: number;
  remarks?: string | null;
}

export interface ApiFieldOrderResult {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  status: string;
  estimatedDeliveryDate: string;
}

export interface ApiFieldCollectionResult {
  receiptId: string;
  receiptNumber: string;
  receiptDate: string;
  customerName: string;
  amountCollected: number;
  status: string;
  remainingChemistBalance: number;
}

export interface ApiFieldForceSummary {
  activeRepsCount: number;
  totalBeatsToday: number;
  totalScheduledVisits: number;
  visitsCompleted: number;
  coveragePercentage: number;
  totalFieldOrdersBooked: number;
  totalFieldBookingValue: number;
  totalFieldCollections: number;
  strikeRatePercentage: number;
  beats: ApiChemistBeatPlan[];
}


