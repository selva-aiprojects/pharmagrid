const fs = require('fs');
const path = require('path');
const { Client } = require('../frontend/node_modules/pg');

function loadEnv() {
  const paths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'backend', '.env'),
    path.join(__dirname, '..', 'frontend', '.env')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const connectionString = process.env.DATABASE_URL;

async function seedEnterpriseSchema() {
  const client = new Client({
    connectionString: connectionString ? connectionString.replace('?sslmode=require', '') : undefined,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔄 Connected to Aiven PostgreSQL. Syncing enterprise tables and inventory balances...');

    const tenantId = 'b3cf8912-3490-410a-8bf7-df84918e4732';
    const branchId = 'a1b2c3d4-0000-0000-0000-000000000001';
    const warehouseId = 'b3cf8912-3490-410a-8bf7-df84918e4732';
    const userId = 'e5f6a7b8-0000-0000-0000-000000000001';

    // Clean previous master records if any
    await client.query('TRUNCATE TABLE m_locations, m_warehouses, m_users, m_branches, m_tenants CASCADE;');

    // 1. Seed Tenant
    await client.query(`
      INSERT INTO m_tenants (
        tenantid, tenantname, legalbusinessname, subdomain, pannumber,
        gstinnumber, statecode, druglicense20b, druglicense21b, contactemail, contactphone, isactive
      ) VALUES (
        $1, 'PharmaGrid Chennai Stockist', 'PharmaGrid Healthcare Logistics Pvt Ltd', 'chennaistockist',
        'ABCDE1234F', '33AABCP9981E1Z9', '33', 'TN/CHE/20B/2024/001', 'TN/CHE/21B/2024/002',
        'admin@pharmagrid.com', '+91 98401 22334', true
      ) ON CONFLICT (subdomain) DO NOTHING;
    `, [tenantId]);
    console.log('✅ Seeded m_tenants');

    // 2. Seed Branch
    await client.query(`
      INSERT INTO m_branches (
        branchid, tenantid, branchcode, branchname, addressline1, city, statecode, pincode,
        gstinnumber, druglicenseno, isheadoffice, isactive
      ) VALUES (
        $1, $2, 'BR-MAA-01', 'Chennai Central Depot', '100, Anna Salai', 'Chennai', '33', '600002',
        '33AABCP9981E1Z9', 'TN/CHE/20B/2024/001', true, true
      ) ON CONFLICT (tenantid, branchcode) DO NOTHING;
    `, [branchId, tenantId]);
    console.log('✅ Seeded m_branches');

    // 3. Seed Warehouse
    await client.query(`
      INSERT INTO m_warehouses (
        warehouseid, tenantid, branchid, warehousecode, warehousename, iscoldchaincapable, isactive
      ) VALUES (
        $1, $2, $3, 'WH-MAA-MAIN', 'Main Chennai Depot', true, true
      ) ON CONFLICT (tenantid, warehousecode) DO NOTHING;
    `, [warehouseId, tenantId, branchId]);
    console.log('✅ Seeded m_warehouses');

    // 4. Seed Locations
    await client.query(`
      INSERT INTO m_locations (
        locationid, tenantid, warehouseid, zonecode, rackcode, shelfcode, bincode, isquarantinezone, isactive
      ) VALUES 
        (gen_random_uuid(), $1, $2, 'Z1', 'R04', 'S02', 'B03', false, true),
        (gen_random_uuid(), $1, $2, 'Z-COLD', 'R01', 'S01', 'B01', false, true)
      ON CONFLICT DO NOTHING;
    `, [tenantId, warehouseId]);
    console.log('✅ Seeded m_locations');

    // 5. Seed Users
    await client.query(`
      INSERT INTO m_users (
        userid, tenantid, branchid, username, email, passwordhash, fullname, phonenumber, rolename, isactive
      ) VALUES (
        $1, $2, $3, 'selva.admin', 'admin@pharmagrid.com',
        crypt('Admin@Pharma123', gen_salt('bf')),
        'Selva Admin', '+91 98401 22334', 'TenantAdmin', true
      ) ON CONFLICT (tenantid, username) DO NOTHING;
    `, [userId, tenantId, branchId]);
    console.log('✅ Seeded m_users');

    // 6. Sync Products to m_products
    const prodRes = await client.query('SELECT * FROM "Products"');
    for (const p of prodRes.rows) {
      let sched = 'Regular';
      if (p.ScheduleClass === 2) sched = 'H';
      else if (p.ScheduleClass === 3) sched = 'H1';
      else if (p.ScheduleClass === 1) sched = 'G';
      else if (p.ScheduleClass === 4) sched = 'X';

      let storage = 'Room Temperature';
      if (p.StorageCondition === 1) storage = 'Cold Chain (2-8°C)';
      else if (p.StorageCondition === 2) storage = 'Controlled (15-25°C)';

      await client.query(`
        INSERT INTO m_products (
          productid, tenantid, productcode, productname, genericname, brandname,
          manufacturername, dosageform, strength, packsize, uom, hsncode, gstpercentage,
          mrp, ptr, pts, purchaserate, scheduleclass, storagecondition, reorderlevel, isactive
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18::schedule_class_enum, $19::storage_condition_enum, $20, $21
        ) ON CONFLICT (tenantid, productcode) DO NOTHING;
      `, [
        p.Id, p.TenantId, p.ProductCode, p.ProductName, p.GenericName, p.BrandName,
        p.ManufacturerName, p.DosageForm, p.Strength, p.PackSize, p.UOM, p.HSNCode,
        p.GSTPercentage, p.MRP, p.PTR, p.PTS, p.PurchaseRate, sched, storage,
        p.ReorderLevel, p.IsActive
      ]);
    }
    console.log(`✅ Synced ${prodRes.rows.length} products to m_products`);

    // 7. Sync Batches to t_batches & InventoryBalances
    const batchRes = await client.query('SELECT * FROM "Batches"');
    for (const b of batchRes.rows) {
      await client.query(`
        INSERT INTO t_batches (
          batchid, tenantid, productid, batchnumber, manufacturingdate, expirydate,
          purchaserate, mrp, warehouseid, locationrackbin
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) ON CONFLICT (tenantid, productid, batchnumber) DO NOTHING;
      `, [
        b.Id, b.TenantId, b.ProductId, b.BatchNumber, b.ManufacturingDate, b.ExpiryDate,
        b.PurchaseRate, b.MRP, b.WarehouseId, b.LocationRackBin
      ]);

      // Seed t_inventory_balances
      await client.query(`
        INSERT INTO t_inventory_balances (
          inventorybalanceid, tenantid, productid, batchid, warehouseid,
          quantityavailable, quantityreserved, quantitydamaged, quantityexpired, quantityquarantined
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, 0, 0, 0, 0
        ) ON CONFLICT (tenantid, batchid, warehouseid) DO NOTHING;
      `, [
        b.TenantId, b.ProductId, b.Id, b.WarehouseId, b.AvailableQuantity
      ]);

      // Also seed "InventoryBalances" for EF Core
      await client.query(`
        INSERT INTO "InventoryBalances" (
          "Id", "TenantId", "ProductId", "BatchId", "WarehouseId",
          "QuantityAvailable", "QuantityReserved", "QuantityDamaged", "QuantityExpired", "QuantityQuarantined",
          "CreatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, 0, 0, 0, 0, NOW()
        ) ON CONFLICT DO NOTHING;
      `, [
        b.TenantId, b.ProductId, b.Id, b.WarehouseId, b.AvailableQuantity
      ]);
    }
    console.log(`✅ Synced ${batchRes.rows.length} batches to t_batches & inventory balances`);

    // 8. Sync Customers to m_customers
    const custRes = await client.query('SELECT * FROM "Customers"');
    for (const c of custRes.rows) {
      await client.query(`
        INSERT INTO m_customers (
          customerid, tenantid, customername, customercode, customertype, gstinnumber,
          statecode, druglicense20b, druglicense21b, licenseexpirydate, phonenumber,
          addressline1, city, pincode, creditperioddays, creditlimit, currentoutstandingbalance, isactive
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Chennai', '600001',
          $13, $14, $15, true
        ) ON CONFLICT (tenantid, customercode) DO NOTHING;
      `, [
        c.Id, c.TenantId, c.CustomerName, c.CustomerCode, c.CustomerType, c.GstinNumber,
        c.StateCode, c.DrugLicense20B, c.DrugLicense21B, c.LicenseExpiryDate, c.PhoneNumber,
        c.Address, c.CreditPeriodDays, c.CreditLimit, c.CurrentOutstandingBalance
      ]);
    }
    console.log(`✅ Synced ${custRes.rows.length} customers to m_customers`);

    // 9. Sync Suppliers to m_suppliers
    const suppRes = await client.query('SELECT * FROM "Suppliers"');
    for (const s of suppRes.rows) {
      await client.query(`
        INSERT INTO m_suppliers (
          supplierid, tenantid, suppliername, suppliercode, gstinnumber, statecode,
          druglicenseno, currentpayablebalance, creditperioddays, phonenumber, addressline1, city, pincode, isactive
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, '+91 99999 00000', 'Industrial Area', 'Mumbai', '400001', true
        ) ON CONFLICT (tenantid, suppliercode) DO NOTHING;
      `, [
        s.Id, s.TenantId, s.SupplierName, s.SupplierCode, s.GstinNumber, s.StateCode,
        s.DrugLicenseNo, s.CurrentPayableBalance, s.CreditPeriodDays
      ]);
    }
    console.log(`✅ Synced ${suppRes.rows.length} suppliers to m_suppliers`);

    // 10. Sync Schemes to t_schemes
    const schRes = await client.query('SELECT * FROM "Schemes"');
    for (const sc of schRes.rows) {
      let st = 'VolumetricFree';
      if (sc.SchemeType === 1) st = 'FinancialDiscount';
      else if (sc.SchemeType === 2) st = 'ManufacturerRebate';

      await client.query(`
        INSERT INTO t_schemes (
          schemeid, tenantid, schemename, schemetype, manufacturername, productid,
          minorderquantitythreshold, freequantityunits, discountpercentage, reimbursementrateperunit,
          validfrom, validto, isactive
        ) VALUES (
          $1, $2, $3, $4::scheme_type_enum, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) ON CONFLICT DO NOTHING;
      `, [
        sc.Id, sc.TenantId, sc.SchemeName, st, sc.ManufacturerName, sc.ProductId,
        sc.MinOrderQuantityThreshold, sc.FreeQuantityUnits, sc.DiscountPercentage,
        sc.ReimbursementRatePerUnit, sc.ValidFrom, sc.ValidTo, sc.IsActive
      ]);
    }
    console.log(`✅ Synced ${schRes.rows.length} schemes to t_schemes`);

    console.log('\n🎉 ALL ENTERPRISE DATABASE TABLES SYNCHRONIZED TO AIVEN POSTGRESQL SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Enterprise sync failed:', err);
  } finally {
    await client.end();
  }
}

seedEnterpriseSchema();
