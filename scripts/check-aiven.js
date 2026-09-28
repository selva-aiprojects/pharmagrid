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

async function main() {
  const client = new Client({
    connectionString: connectionString ? connectionString.replace('?sslmode=require', '') : undefined,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Aiven PostgreSQL [pharmagrid]!\n');
    
    const dbRes = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database Info:', dbRes.rows[0].current_database, '| User:', dbRes.rows[0].current_user);

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\n📊 Total Public Tables on Aiven: ${tablesRes.rows.length}`);
    for (const row of tablesRes.rows) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
        console.log(`   - "${row.table_name}": ${countRes.rows[0].count} records`);
      } catch (err) {
        // Table may be lowercase or not quoted
        try {
          const countRes2 = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
          console.log(`   - ${row.table_name}: ${countRes2.rows[0].count} records`);
        } catch {
          console.log(`   - ${row.table_name} (unable to count)`);
        }
      }
    }

  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    await client.end();
  }
}

main();
