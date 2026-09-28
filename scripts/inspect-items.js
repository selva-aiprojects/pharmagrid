const fs = require('fs');
const path = require('path');
const { Client } = require('../frontend/node_modules/pg');

function loadEnv() {
  const p = path.join(__dirname, '..', '.env');
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
loadEnv();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('?sslmode=require', '') : undefined,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'SalesInvoiceItems'
  `);
  console.log('Columns in SalesInvoiceItems:', cols.rows);

  const items = await client.query('SELECT * FROM "SalesInvoiceItems"');
  console.log('Rows count in SalesInvoiceItems:', items.rows.length);
  if (items.rows.length > 0) {
    console.log('First row:', items.rows[0]);
  }

  await client.end();
}

main();
