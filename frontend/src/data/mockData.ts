export interface BatchItem {
  batchId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  availableQty: number;
  ptr: number;
  mrp: number;
  rackLocation: string;
  isNearExpiry?: boolean;
}

export interface SchemeRule {
  schemeId: string;
  name: string;
  type: 'volumetric' | 'discount';
  minQty: number;
  freeQty: number;
  discountPct: number;
  description: string;
}

export interface ProductItem {
  productId: string;
  code: string;
  name: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: string;
  uom: string;
  hsnCode: string;
  gstPercentage: number;
  ptr: number;
  pts: number;
  mrp: number;
  scheduleClass: 'Regular' | 'G' | 'H' | 'H1' | 'X';
  storageCondition: 'Room Temperature' | 'Cold Chain (2-8°C)' | 'Controlled';
  reorderLevel: number;
  scheme?: SchemeRule;
  batches: BatchItem[];
}

export interface CustomerItem {
  customerId: string;
  code: string;
  name: string;
  customerType: string;
  gstin: string;
  stateCode: string; // 33 = Tamil Nadu, 29 = Karnataka, 27 = Maharashtra
  stateName: string;
  drugLicense20B: string;
  drugLicense21B: string;
  licenseValidUntil: string;
  isLicenseValid: boolean;
  creditLimit: number;
  currentOutstanding: number;
  overdueBillsCount: number;
  address: string;
}

export const SAMPLE_CUSTOMERS: CustomerItem[] = [
  {
    customerId: '7a328a2b-dc74-4b51-8975-d16ba6ec8911',
    code: 'CUST-8942',
    name: 'Apollo Pharmacy - Alandur Depot',
    customerType: 'Retail Pharmacy Chain',
    gstin: '33AABCA1234F1Z8',
    stateCode: '33',
    stateName: 'Tamil Nadu (Intra-State: CGST + SGST)',
    drugLicense20B: 'TN/CHE/20B/2024/9912',
    drugLicense21B: 'TN/CHE/21B/2024/9913',
    licenseValidUntil: '2028-12-31',
    isLicenseValid: true,
    creditLimit: 150000,
    currentOutstanding: 38400,
    overdueBillsCount: 0,
    address: '42, Mount Road, Alandur, Chennai - 600016',
  },
  {
    customerId: '7a328a2b-dc74-4b51-8975-d16ba6ec8944',
    code: 'CUST-4108',
    name: 'MedPlus Chemists - Guindy Industrial Branch',
    customerType: 'Retail Pharmacy',
    gstin: '33BBBCD5678G2Z1',
    stateCode: '33',
    stateName: 'Tamil Nadu (Intra-State: CGST + SGST)',
    drugLicense20B: 'TN/CHE/20B/2021/4401',
    drugLicense21B: 'TN/CHE/21B/2021/4402',
    licenseValidUntil: '2026-10-15',
    isLicenseValid: true, // Expiring in 17 days
    creditLimit: 75000,
    currentOutstanding: 68500,
    overdueBillsCount: 2,
    address: '11, GST Road, Guindy, Chennai - 600032',
  },
  {
    customerId: '7a328a2b-dc74-4b51-8975-d16ba6ec8922',
    code: 'CUST-9012',
    name: 'Manipal Health & Hospitals Pharmacy',
    customerType: 'Super Specialty Hospital',
    gstin: '29AAACH9876E1Z5',
    stateCode: '29',
    stateName: 'Karnataka (Inter-State: 100% IGST)',
    drugLicense20B: 'KA/BNG/20B/2023/1029',
    drugLicense21B: 'KA/BNG/21B/2023/1030',
    licenseValidUntil: '2029-06-30',
    isLicenseValid: true,
    creditLimit: 500000,
    currentOutstanding: 120000,
    overdueBillsCount: 0,
    address: '98, HAL Old Airport Road, Bengaluru - 560017',
  },
  {
    customerId: '7a328a2b-dc74-4b51-8975-d16ba6ec8933',
    code: 'CUST-EXP-99',
    name: 'Care Clinic & Charitable Dispensary',
    customerType: 'Clinic Pharmacy',
    gstin: '33ZZZCD1122H3Z9',
    stateCode: '33',
    stateName: 'Tamil Nadu (Intra-State: CGST + SGST)',
    drugLicense20B: 'TN/CHE/20B/2020/0042',
    drugLicense21B: 'TN/CHE/21B/2020/0043',
    licenseValidUntil: '2026-08-31', // Expired
    isLicenseValid: false,
    creditLimit: 25000,
    currentOutstanding: 29800, // Credit limit exceeded!
    overdueBillsCount: 4,
    address: '8, Station Road, Tambaram, Chennai - 600045',
  },
];

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    productId: '4a42b10a-1123-4c8d-b3b0-2b123d456789',
    code: 'PAN40-INJ',
    name: 'Pan 40mg Injection',
    genericName: 'Pantoprazole Sodium 40mg',
    manufacturer: 'Alkem Laboratories Ltd',
    dosageForm: 'Injection',
    packSize: '1 Vial + Diluent',
    uom: 'Vials',
    hsnCode: '30049099',
    gstPercentage: 12,
    ptr: 38.00,
    pts: 34.20,
    mrp: 55.00,
    scheduleClass: 'H',
    storageCondition: 'Room Temperature',
    reorderLevel: 100,
    scheme: {
      schemeId: 'sch-01',
      name: 'Buy 10 Get 1 Free',
      type: 'volumetric',
      minQty: 10,
      freeQty: 1,
      discountPct: 0,
      description: 'Factory sponsored monsoon promo: 10 + 1 free',
    },
    batches: [
      {
        batchId: '651f8a20-3b41-482a-a53f-4e09d1234abc',
        batchNumber: 'P40-AUG26-01',
        manufacturingDate: '2026-08-01',
        expiryDate: '2028-07-31',
        availableQty: 40, // Low quantity to test split allocation!
        ptr: 38.00,
        mrp: 55.00,
        rackLocation: 'Z1-R02-S03-B01',
      },
      {
        batchId: '7e2a9b31-4c52-493b-b64e-5f10e2345bcd',
        batchNumber: 'P40-SEP26-02',
        manufacturingDate: '2026-09-01',
        expiryDate: '2028-12-31',
        availableQty: 450,
        ptr: 38.00,
        mrp: 55.00,
        rackLocation: 'Z1-R02-S03-B02',
      },
    ],
  },
  {
    productId: '4a42b10a-2223-4c8d-b3b0-2b123d456789',
    code: 'AUG-625-TAB',
    name: 'Augmentin 625mg Tablet',
    genericName: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    dosageForm: 'Tablet',
    packSize: '10 Strips x 10 Tablets',
    uom: 'Strips',
    hsnCode: '30041010',
    gstPercentage: 12,
    ptr: 142.50,
    pts: 128.25,
    mrp: 204.00,
    scheduleClass: 'H1', // Schedule H1 statutory antibiotic!
    storageCondition: 'Controlled',
    reorderLevel: 50,
    scheme: {
      schemeId: 'sch-02',
      name: 'Buy 20 Get 2 Free',
      type: 'volumetric',
      minQty: 20,
      freeQty: 2,
      discountPct: 0,
      description: 'GSK seasonal trade bonus: 20 + 2 free strips',
    },
    batches: [
      {
        batchId: '8a1b2c3d-1111-482a-a53f-4e09d1234abc',
        batchNumber: 'AUG-GSK-991',
        manufacturingDate: '2026-06-15',
        expiryDate: '2028-05-31',
        availableQty: 180,
        ptr: 142.50,
        mrp: 204.00,
        rackLocation: 'Z2-R01-S01-B04',
      },
      {
        batchId: '3e4f5a6b-5555-482a-a53f-4e09d1234abc',
        batchNumber: 'AUG-EXP-WARN',
        manufacturingDate: '2026-08-10',
        expiryDate: '2028-10-31',
        availableQty: 320,
        ptr: 142.50,
        mrp: 204.00,
        rackLocation: 'Z2-R01-S02-B01',
      },
    ],
  },
  {
    productId: '4a42b10a-3323-4c8d-b3b0-2b123d456789',
    code: 'HUM-MIX-100',
    name: 'Human Mixtard 30/70 100IU/ml',
    genericName: 'Biphasic Isophane Insulin Injection IP',
    manufacturer: 'Novo Nordisk India',
    dosageForm: 'Vial',
    packSize: '10ml Glass Vial',
    uom: 'Vials',
    hsnCode: '30043110',
    gstPercentage: 5, // Life-saving insulin taxed at 5%
    ptr: 155.00,
    pts: 139.50,
    mrp: 198.00,
    scheduleClass: 'G',
    storageCondition: 'Cold Chain (2-8°C)', // Cold Chain item
    reorderLevel: 40,
    batches: [
      {
        batchId: '9b2c3d4e-2222-482a-a53f-4e09d1234abc',
        batchNumber: 'MIX-COLD-041',
        manufacturingDate: '2026-07-01',
        expiryDate: '2027-12-31',
        availableQty: 85,
        ptr: 155.00,
        mrp: 198.00,
        rackLocation: 'COLD-ROOM-R01-S01',
      },
    ],
  },
  {
    productId: '4a42b10a-4423-4c8d-b3b0-2b123d456789',
    code: 'DOLO-650',
    name: 'Dolo 650mg Tablet',
    genericName: 'Paracetamol 650mg Fast Release',
    manufacturer: 'Micro Labs Limited',
    dosageForm: 'Tablet',
    packSize: '15 Tablets per Strip',
    uom: 'Strips',
    hsnCode: '30049099',
    gstPercentage: 12,
    ptr: 22.40,
    pts: 20.16,
    mrp: 31.50,
    scheduleClass: 'Regular',
    storageCondition: 'Room Temperature',
    reorderLevel: 200,
    scheme: {
      schemeId: 'sch-03',
      name: 'Bulk Cash Deal (5% Off)',
      type: 'discount',
      minQty: 50,
      freeQty: 0,
      discountPct: 5.0,
      description: 'Micro Labs wholesale incentive: 5% flat discount for 50+ strips',
    },
    batches: [
      {
        batchId: '1c2d3e4f-3333-482a-a53f-4e09d1234abc',
        batchNumber: 'DOLO-SAFE-28',
        manufacturingDate: '2026-05-10',
        expiryDate: '2027-04-30', // Less than 7 months away
        availableQty: 60,
        ptr: 22.40,
        mrp: 31.50,
        rackLocation: 'Z1-R04-S02-B08',
        isNearExpiry: true,
      },
      {
        batchId: '4f5a6b7c-6666-482a-a53f-4e09d1234abc',
        batchNumber: 'DOLO-EXP-PROM',
        manufacturingDate: '2026-08-20',
        expiryDate: '2029-07-31',
        availableQty: 1200,
        ptr: 22.40,
        mrp: 31.50,
        rackLocation: 'Z1-R04-S03-B01',
      },
    ],
  },
  {
    productId: '4a42b10a-5523-4c8d-b3b0-2b123d456789',
    code: 'MERO-1G',
    name: 'Meropenem 1g Injection',
    genericName: 'Meropenem Trihydrate IP 1000mg',
    manufacturer: 'Cipla Critical Care',
    dosageForm: 'Injection',
    packSize: '1 Vial + 20ml Sterile Water',
    uom: 'Vials',
    hsnCode: '30049099',
    gstPercentage: 12,
    ptr: 480.00,
    pts: 432.00,
    mrp: 720.00,
    scheduleClass: 'H1', // Schedule H1
    storageCondition: 'Controlled',
    reorderLevel: 25,
    batches: [
      {
        batchId: '5e6f7a8b-7777-482a-a53f-4e09d1234abc',
        batchNumber: 'CIP-M1G-008',
        manufacturingDate: '2026-04-01',
        expiryDate: '2028-03-31',
        availableQty: 45,
        ptr: 480.00,
        mrp: 720.00,
        rackLocation: 'Z2-R03-S01-B02',
      },
    ],
  },
];
