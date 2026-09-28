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

async function syncSchema() {
  const client = new Client({
    connectionString: connectionString ? connectionString.replace('?sslmode=require', '') : undefined,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to Aiven PostgreSQL [pharmagrid]...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const sqlFilePath = path.join(__dirname, '..', 'docs', '03_DATABASE_SCHEMA_POSTGRESQL.sql');
    console.log(`📖 Reading SQL schema from: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🚀 Applying PostgreSQL Schema...');
    await client.query(sqlContent);
    console.log('✅ PostgreSQL DDL Schema applied successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\n📊 Public Tables created (${res.rows.length} tables):`);
    res.rows.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (err) {
    console.error('❌ Error executing schema:', err.message);
    if (err.position) {
      console.error(`Position: ${err.position}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncSchema();
